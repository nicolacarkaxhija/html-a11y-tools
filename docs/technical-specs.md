# html-a11y-tools — Technical Specifications

## 1. Repository layout

```
html-a11y-tools/
├── packages/
│   ├── eslint-plugin-html-a11y/       # General-purpose ESLint plugin
│   │   ├── index.js                   # Plugin entry, exports rules + recommended config
│   │   ├── lib/
│   │   │   ├── rules/                 # 25 rule modules
│   │   │   └── utils/
│   │   │       ├── aria.js            # aria-query wrappers
│   │   │       ├── dom.js             # AST helpers (getAttr, hasAriaLabel, …)
│   │   │       └── dynamic.js         # getMarkers / isDynamicValue
│   │   └── tests/
│   │       ├── rules/                 # One test file per rule
│   │       ├── utils/                 # Unit tests for aria.js, dom.js, dynamic.js
│   │       └── helpers.js            # Shared RuleTester factory
│   │
│   ├── eslint-plugin-sfcc-a11y/       # SFCC adapter
│   │   ├── index.js                   # Re-exports rules, adds flat/recommended config
│   │   └── lib/
│   │       ├── preprocessors/
│   │       │   └── isml-sanitizer.js  # ISML → HTML sanitizer
│   │       ├── processors/
│   │       │   └── xml-content-asset.js  # CDATA extractor / line mapper
│   │       └── utils/
│   │           └── isml.js            # EXPR_SENTINEL, CONTENT_SENTINEL constants
│   │
│   └── sfcc-a11y/                     # Zero-config CLI
│       ├── bin/sfcc-a11y.js           # Commander entry point
│       ├── index.js                   # Programmatic API (re-exports lint())
│       └── lib/
│           ├── linter.js              # ESLint programmatic API wrapper
│           └── format/
│               ├── text.js
│               ├── json.js
│               └── github.js
│
├── docs/
│   ├── functional-specs.md
│   └── technical-specs.md
├── vitest.workspace.js
├── package.json                       # npm workspaces root
└── eslint.config.mjs                  # Monorepo lint config
```

## 2. Tech stack

| Concern | Choice |
|---|---|
| Module system | Native ESM (`"type": "module"`) throughout |
| ESLint | v9 flat config only (no v8 legacy support) |
| HTML parser | `@html-eslint/parser` (`es-html-parser` AST) |
| ARIA data | `aria-query` v5 |
| Test runner | Vitest v2 (workspace mode) |
| Coverage | v8 provider, 100% thresholds |
| Lint | ESLint + `@eslint/js` recommended |
| Format | Prettier |
| Release | Changesets |

## 3. ESLint v9 flat config architecture

Each plugin exports a `configs.recommended` (or `configs['flat/recommended']`) array of config objects. ESLint merges them in order.

### eslint-plugin-html-a11y

```js
plugin.configs.recommended = [
  {
    files: ['**/*.html'],
    plugins: { 'html-a11y': plugin },
    languageOptions: { parser: htmlParser },
    rules: { 'html-a11y/<rule>': 'warn', ... },  // all 25 rules
  },
];
```

### eslint-plugin-sfcc-a11y

```js
plugin.configs['flat/recommended'] = [
  // 1. ISML files: parse as HTML with SFCC sentinel settings
  {
    files: ['**/*.isml'],
    plugins: { 'sfcc-a11y': plugin },
    languageOptions: { parser: htmlParser },
    settings: { 'html-a11y': { dynamicValueMarker: '__ISML_EXPR__', dynamicContentMarker: '__ISML_CONTENT__' } },
    rules: { 'sfcc-a11y/<rule>': 'warn', ... },
  },
  // 2. XML content-asset files: extract CDATA blocks as virtual HTML files
  {
    files: ['**/libraries/**/*.xml'],
    plugins: { 'sfcc-a11y': plugin },
    processor: xmlProcessor,
    settings: { 'html-a11y': { ... } },
    rules: { 'sfcc-a11y/<rule>': 'warn', ... },
  },
];
```

### sfcc-a11y CLI linter

The CLI builds its own `overrideConfig` array:

```js
overrideConfig: [
  ...plugin.configs['flat/recommended'],              // ISML + XML base config
  { files: ['**/*.isml'], processor: ismlProcessor }, // attach sanitizer processor
  {                                                   // handle virtual *.html blocks
    files: ['**/*.html'],
    plugins: { 'sfcc-a11y': plugin },
    languageOptions: { parser: htmlParser },
    settings: sfccSettings,   // ← CRITICAL: sentinel settings must be here too
    rules: recommendedRules,
  },
]
```

**Important:** ESLint v9 resolves config for virtual files (from processors) independently based on the virtual filename, not the parent file's config. Both the ISML sanitizer (`filename + '/__sanitized.html'`) and the XML processor (`filename + '/block_N.html'`) produce `.html` virtual filenames. The `**/*.html` config entry handles both — and it must include `settings: sfccSettings` so that `getMarkers(context)` returns the configured sentinels inside the virtual block.

## 4. @html-eslint/parser AST

Rules use ESLint selectors on the `es-html-parser` AST:

| Selector | Node properties |
|---|---|
| `Tag` | `.name` (string), `.attributes` (array), `.children` (array) |
| `Attribute` | `.key.value` (string), `.value.value` (string or undefined for boolean attrs) |
| `Text` | `.value` (string) |

```js
// Boolean attribute: <div aria-hidden> → value is undefined
const val = node.value?.value; // undefined
// getAttr returns true for boolean attributes
```

`getAttr(node, attrName)` returns:
- `true` — attribute is present but has no value (boolean)
- `string` — attribute value string
- `null` — attribute not found

## 5. Dynamic sentinel pattern

### Configuration

```js
// eslint settings key
context.settings['html-a11y'] = {
  dynamicValueMarker: '__ISML_EXPR__',    // replaces ${...} in attribute values
  dynamicContentMarker: '__ISML_CONTENT__' // replaces dynamic text nodes
}
```

### API (`lib/utils/dynamic.js`)

```js
export function getMarkers(context) {
  const cfg = context.settings?.['html-a11y'] ?? {};
  return {
    valueMarker: cfg.dynamicValueMarker ?? null,
    contentMarker: cfg.dynamicContentMarker ?? null,
  };
}

export function isDynamicValue(value, marker) {
  return marker !== null && value === marker;
}
```

Rules call `getMarkers(context)` once in `create()` and guard attribute checks with `isDynamicValue(attrValue, valueMarker)`. When `marker` is `null` (no settings configured), `isDynamicValue` always returns `false` — every value is checked as-is.

## 6. ISML sanitizer

`lib/preprocessors/isml-sanitizer.js` — a synchronous string transformation, not a full parser.

### Transformations (in order)

| Input | Output | Reason |
|---|---|---|
| ISML comments `<%-- ... --%>` | Removed | Not valid HTML |
| `<isif>`, `<iselse>`, `<iselseif>`, `<isloop>`, `<isbreak>`, `<isnext>`, `<isinclude>`, `<ismodule>`, `<iscomponent>`, `<iscontent>`, `<isredirect>`, `<isslot>` | Empty (void, no children) | Structural — no rendered output |
| `<isset>`, `<isremove>` | Removed with content | No rendered output |
| `<isprint>`, `<ispicture>`, `<iscontentasset>` | `CONTENT_SENTINEL` | Render visible HTML at runtime |
| `${...}` fully dynamic attribute value | `EXPR_SENTINEL` | Dynamic value |
| `${...}` inside a larger string | `EXPR_SENTINEL` (replace occurrence) | Partial dynamic |
| Mustache `{{#...}}`, `{{/...}}`, `{{>...}}`, `{{!...}}` | Spaces | Block/partial helpers, no output |
| Remaining `{{...}}` in text | `CONTENT_SENTINEL` | Renders visible content |

Sentinel constants:

```js
export const EXPR_SENTINEL = '__ISML_EXPR__';
export const CONTENT_SENTINEL = '__ISML_CONTENT__';
```

The sanitizer operates as an ESLint `preprocess` function. The virtual filename returned is `filename + '/__sanitized.html'`, which matches the `**/*.html` config entry.

## 7. XML content-asset processor

`lib/processors/xml-content-asset.js`

### `preprocess(text, filename)`

1. Finds all `<![CDATA[...]]>` blocks using a regex with `s` flag (dotAll).
2. Records the start line of each block (by counting newlines before the `<![CDATA[` marker).
3. Returns an array of `{ text: cdataContent, filename: filename + '/block_N.html' }` objects.

### `postprocess(messages, filename)`

1. Receives `messages[N]` — array of message arrays, one per virtual block.
2. For each block N, offsets each message's `line` and `endLine` by the CDATA block's start line.
3. Flattens all messages into a single array.

## 8. aria-query v5 API

```js
import { roles, aria } from 'aria-query';

roles.get('button')
// → { requiredProps: {}, supported: [...], abstract: false, ... }

aria.get('aria-hidden')
// → { type: 'boolean', values: ['true', 'false'] }

aria.get('aria-haspopup')
// → { type: 'token', values: ['false', 'true', 'menu', 'listbox', ...] }
```

All roles have `requiredProps: {}` at minimum — never `null`. The `type` field can be: `boolean`, `tristate`, `token`, `tokenlist`, `integer`, `number`, `string`, `id`, `idlist`, `uri`.

## 9. Test patterns

### Rule tests

Each rule has a single `it` block using ESLint `RuleTester`:

```js
// tests/rules/helpers.js
export function createRuleTester() {
  return new RuleTester({
    languageOptions: { parser: htmlParser },
    settings: {
      'html-a11y': {
        dynamicValueMarker: '__DYNAMIC__',
        dynamicContentMarker: '__CONTENT__',
      },
    },
  });
}
```

Tests use neutral sentinel strings (`__DYNAMIC__`, `__CONTENT__`) rather than the SFCC-specific strings, keeping the html-a11y package decoupled from SFCC.

### Unit tests

`dom.js` and `aria.js` utilities are tested with plain JavaScript objects that mimic the `@html-eslint/parser` AST shape — no ESLint or parser invocation needed.

### CLI tests

`bin.test.js` uses `spawnSync` to invoke the CLI as a subprocess. This gives realistic process exit code and stdout/stderr testing without mocking the entire ESLint stack.

## 10. Coverage strategy

v8 source-map artifacts create phantom branches for certain patterns. Workarounds:

| Pattern | Fix |
|---|---|
| `typeof name !== 'string'` guards on attribute keys | `/* c8 ignore next */` |
| `if (!typeDef) return` after `aria-query` lookup | `/* c8 ignore next */` |
| `?.requiredProps ?? {}` optional chain | `/* c8 ignore next 3 */` before function |
| `getTextContent` optional chain on children | `/* c8 ignore next 3 */` before function |
| `ismlProcessor` object in linter.js | `/* c8 ignore start */` / `/* c8 ignore stop */` |
| JSDoc line before `expandPaths` | `/* c8 ignore next */` |
| `bin/sfcc-a11y.js` entirely | `/* c8 ignore file */` — tested via subprocess |

## 11. Dependency graph

```
sfcc-a11y (CLI)
  └── eslint-plugin-sfcc-a11y
        └── eslint-plugin-html-a11y
              └── aria-query
```

`eslint`, `@html-eslint/parser` are peer dependencies at each level. The CLI resolves them from the workspace root `node_modules` in a monorepo setup, or from the project's `node_modules` when installed standalone.

## 12. Release process

Managed with [Changesets](https://github.com/changesets/changesets):

1. `npm run changeset` — describe what changed (patch/minor/major per package)
2. `npm run version` — bumps versions in `package.json` and updates `CHANGELOG.md`
3. `npm run release` — publishes changed packages to npm

Each package is independently versioned. `eslint-plugin-sfcc-a11y` declares `"eslint-plugin-html-a11y": "*"` (npm workspace protocol) rather than a pinned version — npm resolves this to the local workspace package during development and to the latest published version otherwise.
