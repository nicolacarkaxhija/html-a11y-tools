# eslint-plugin-sfcc-a11y

[![npm](https://img.shields.io/npm/v/eslint-plugin-sfcc-a11y)](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![ESLint](https://img.shields.io/badge/eslint-%3E%3D8-purple)](https://eslint.org)

eslint-plugin-html-a11y adapter for enabling WCAG accessibility linting on Salesforce Commerce Cloud (SFCC) projects:
adds the ISML sanitizer and XML content-asset processor so the same 25 WCAG rules work on .isml templates and XML content asset libraries.

> **Supports ESLint v8 and v9.** The setup differs between the two, so please see [Setup](#setup) below.

## Introduction

TODO

## Installation

Requires **Node.js ≥ 18**, **ESLint ≥ 8**, and **`@html-eslint/parser` ≥ 0.23**:

```sh
npm install --save-dev eslint-plugin-sfcc-a11y @html-eslint/parser eslint
```

## Setup

### ESLint v9 — `eslint.config.js` (recommended)

```js
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [...sfccA11y.configs['flat/recommended']];
```

The `flat/recommended` config is self-contained: it wires up the ISML sanitizer, the XML processor, and `@html-eslint/parser` for the virtual files they produce. No additional configuration is needed.

### ESLint v8 — `.eslintrc.json`

```json
{
  "extends": ["plugin:sfcc-a11y/recommended-error"],
  "overrides": [
    { "files": ["**/*.isml"], "processor": "sfcc-a11y/isml-sanitizer" },
    { "files": ["**/__sanitized.html"], "parser": "@html-eslint/parser" }
  ]
}
```

The two `overrides` entries are **required**. ESLint v8 does not propagate `processor` or `parser` configuration from a shared config accessed via `extends`, so they must be declared in the consuming project's config. The `extends` entry registers the plugin, applies the ISML sentinel settings, and enables all 25 rules.

> **Why the difference?** ESLint v9's flat config lets each array entry declare its own `files`, `processor`, and `languageOptions.parser`, making plugin configs fully self-contained. ESLint v8's legacy system merges only `plugins`, `rules`, `settings`, and `env` from shared configs, whilst `overrides` (which is where processor and parser are set) are not applied from `extends`.

### Changing rule severity

```js
// eslint.config.js (ESLint v9)
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [
  ...sfccA11y.configs['flat/recommended'],
  {
    rules: {
      'sfcc-a11y/img-alt': 'error',   // or 2
      'sfcc-a11y/button-name': 'warn',  // or 1
      'sfcc-a11y/html-has-lang': 'off',  // or 0
    },
  },
];
```

```json
// .eslintrc.json (ESLint v8)
{
  "extends": ["plugin:sfcc-a11y/recommended-error"],
  "overrides": [
    { "files": ["**/*.isml"], "processor": "sfcc-a11y/isml-sanitizer" },
    { "files": ["**/__sanitized.html"], "parser": "@html-eslint/parser" },
    {
      "files": ["**/__sanitized.html"],
      "rules": {
        "sfcc-a11y/img-alt": "error",  // or 2
        "sfcc-a11y/html-has-lang": "off"  // or 0
      }
    }
  ]
}
```

For available rules and their options, see the [html-a11y rule catalogue](../eslint-plugin-html-a11y/README.md#rules).

All 25 rule names are listed under [Rules](#rules) below.

### Available configs

| Config | ESLint | Severity | Rules |
|---|---|---|---|
| `flat/recommended` | v9 | `warn` | All 25 (Level A + AA) |
| `flat/recommended-a` | v9 | `warn` | Level A only |
| `flat/recommended-error` | v9 | `error` | All 25 (Level A + AA) |
| `recommended` | v8 | `warn` | All 25 (Level A + AA) |
| `recommended-a` | v8 | `warn` | Level A only |
| `recommended-error` | v8 | `error` | All 25 (Level A + AA) |

### ESLint v9

With flat config, linting ISML files from the command line just works out of the box:

```sh
eslint "cartridges/**/*.isml"
```

The `flat/recommended` config is self-contained and requires no extra flags.

### ESLint v8 — three traps to avoid

Running `eslint` against ISML files from a script in an ESLint v8 project has several non-obvious failure modes
that silently produce wrong results.

**Trap 1 — `eslint --ext .isml cartridges` (silent zero violations)**

ESLint v8 has an internal `filterCodeBlock` function that decides which virtual files produced by a processor are
eligible for linting. When `--ext .isml` is passed, `filterCodeBlock` applies the same extension regex to code
blocks and the virtual `__sanitized.html` file (extension `.html`) silently fails that test. ESLint calls the
sanitizer, receives the sanitized HTML block, then immediately discards it. Zero violations, no error, no warning.

**Trap 2 — `eslint cartridges` without `--ext` (crash)**

Without `--ext`, `filterCodeBlock` falls back to matching `overrides[].files` and the virtual `.html` files are
correctly accepted. But all rules from the project config also apply to those virtual files. JS-targeting rules
such as `spaced-comment` (from `airbnb-base`) crash when they encounter the HTML AST produced by
`@html-eslint/parser`, because HTML comment nodes have a different structure from JavaScript comments.

**The solution — isolated config with a glob pattern**

1. Create `.eslintrc-a11y.json` in the project root:

```json
{
  "extends": ["plugin:sfcc-a11y/recommended-error"],
  "overrides": [
    { "files": ["**/*.isml"], "processor": "sfcc-a11y/isml-sanitizer" },
    { "files": ["**/__sanitized.html"], "parser": "@html-eslint/parser" }
  ]
}
```

2. Run the linter with:

```sh
eslint --no-eslintrc --config .eslintrc-a11y.json "cartridges/**/*.isml"
```

Why each part is necessary:

- `--no-eslintrc` completely ignores the project's `.eslintrc.json` and everything it extends (airbnb, sonar, prettier…). Only sfcc-a11y rules run, so nothing crashes on the HTML AST.
- `--config .eslintrc-a11y.json` loads the minimal accessibility-only config.
- passing a directory (e.g. `cartridges`) without `--ext` causes ESLint to also enumerate `.js` files by default, which fail to parse under this minimal config. A glob only matches ISML files.
- No `--ext` flag keeps `filterCodeBlock` in overrides-matching mode. The moment `--ext .isml` is added, the virtual `.html` code blocks are silently dropped (Trap 1).

> **Why `--no-eslintrc` is the way to go**
>
> ESLint's `--no-eslintrc --config <file>` pattern was designed for exactly this use case: running a sandboxed lint pass with a specific set of rules, independent of the project's base config. This is the same pattern used by Create React App, Next.js's built-in ESLint integration, and other tools that ship their own ruleset.
>
> The underlying complexity (processor virtual files, `filterCodeBlock`) is an ESLint v8 architectural limitation that the ESLint team addressed in v9. The [ESLint v9 migration guide](https://eslint.org/docs/latest/use/configure/migration-guide) explicitly lists "processors configured in shared configs accessed via `extends` were not applied" as a known v8 limitation and it is one of the motivating reasons flat config was introduced.

## ISML support

The ISML sanitizer (`sfcc-a11y/isml-sanitizer`) is an ESLint processor that translates ISML-specific syntax into
HTML before the parser runs.

### What the sanitizer does

| Input | Output |
|---|---|
| `${...}` expressions | `__ISML_EXPR__` sentinel |
| `<is*>` tags (`<isif>`, `<isloop>`, `<isinclude>`, etc.) | stripped (replaced with whitespace) |
| Content-emitting tags (`<isprint>`, `<ispicture>`, `<iscontentasset>`) | `__ISML_CONTENT__` sentinel |

The two sentinel strings are registered in the plugin's `settings` so that rules treat them as non-empty runtime
values rather than flagging them as missing `alt` text, empty button labels, and so on.

### Virtual file name

The sanitizer produces one code block per ISML file, named `<originalPath>/__sanitized.html`. ESLint uses this
virtual name to resolve config for the block, which is why the override
`{ "files": ["**/__sanitized.html"], "parser": "@html-eslint/parser" }` is required in ESLint v8.
Line numbers in reported violations are automatically remapped back to the original `.isml` file.

## XML content-asset support

TODO

## Rules

All 25 rules are re-exported from [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y/README.md#rules) under the `sfcc-a11y/` prefix.

## Known limitation — false positives from cross-file associations

SFCC projects frequently split `<label>` and `<input>` elements across separate
`<isinclude>` files. ESLint processes each file independently, so the `label` rule
will report a false positive when the label tag `<label for="x">`
is in a different file than the related input `<input id="x">`,
which is frequently the case in SFCC projects (e.g., a shared header include).

Suppress with an inline disable comment when needed:

```isml
<%-- eslint-disable-next-line sfcc-a11y/label --%>
<input type="email" id="email">
```

## License

MIT © [Nicola Carkaxhija](https://github.com/nicolacarkaxhija)
