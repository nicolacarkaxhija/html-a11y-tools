# eslint-plugin-sfcc-a11y

[![npm](https://img.shields.io/npm/v/eslint-plugin-sfcc-a11y)](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![ESLint](https://img.shields.io/badge/eslint-%3E%3D8-purple)](https://eslint.org)

SFCC adapter for [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y): adds an ISML sanitizer and an XML content-asset processor so all 25 WCAG Level A/AA rules work on `.isml` templates and XML content-asset libraries without false positives from ISML-specific syntax.

> **Supports ESLint v8 and v9.** The setup differs between the two — see [Setup](#setup) below.

## Introduction

Salesforce Commerce Cloud (SFCC) templates use ISML — a proprietary extension of HTML that adds `<is*>` structural tags, `${...}` expression syntax in attribute values, and `<%-- --%>` comments. These constructs are not valid HTML and cause `@html-eslint/parser` to fail if fed the raw `.isml` source.

This plugin solves that by running a sanitizer before the parser: `<is*>` tags are stripped or replaced with block spacers, `${...}` expressions are replaced with a sentinel string (`__ISML_EXPR__`), and ISML comments are removed. The result is valid HTML that the parser can handle, and the rules can analyse without seeing dynamic values they cannot evaluate.

The same 25 WCAG rules from `eslint-plugin-html-a11y` are re-exported here under the `sfcc-a11y/` prefix, so SFCC projects get the full rule set without depending on the base plugin directly.

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

The two `overrides` entries are **required**. ESLint v8 does not propagate `processor` or `parser` configuration from a shared config accessed via `extends` — they must be declared in the consuming project's config. The `extends` entry registers the plugin, applies the ISML sentinel settings, and enables all 25 rules.

> **Why the difference?** ESLint v9's flat config lets each array entry declare its own `files`, `processor`, and `languageOptions.parser`, making plugin configs fully self-contained. ESLint v8's legacy system merges only `plugins`, `rules`, `settings`, and `env` from shared configs — `overrides` (which is where processor and parser are set) are not applied from `extends`.

### Changing rule severity

```js
// eslint.config.js (ESLint v9)
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [
  ...sfccA11y.configs['flat/recommended'],
  {
    rules: {
      'sfcc-a11y/img-alt': 'error',
      'sfcc-a11y/button-name': 'warn',
      'sfcc-a11y/html-has-lang': 'off',
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
        "sfcc-a11y/img-alt": "error",
        "sfcc-a11y/html-has-lang": "off"
      }
    }
  ]
}
```

### Available configs

| Config | ESLint | Severity | Rules |
|---|---|---|---|
| `flat/recommended` | v9 | `warn` | All 25 (Level A + AA) |
| `flat/recommended-a` | v9 | `warn` | Level A only |
| `flat/recommended-error` | v9 | `error` | All 25 (Level A + AA) |
| `recommended` | v8 | `warn` | All 25 (Level A + AA) |
| `recommended-a` | v8 | `warn` | Level A only |
| `recommended-error` | v8 | `error` | All 25 (Level A + AA) |

## ISML support

The built-in sanitizer handles the following before the HTML parser runs:

| ISML construct | Replacement |
|---|---|
| `<is*>` structural tags (`<isif>`, `<isloop>`, etc.) | Block spacer (preserves line numbers) |
| `<is*>` void tags (`<isbreak>`, `<isnext>`, etc.) | Stripped |
| `${...}` in attribute values | `__ISML_EXPR__` |
| `<isprint>`, `<ispicture>`, `<iscontentasset>` | `__ISML_CONTENT__` (counts as visible text) |
| ISML comments `<%-- --%>` | Stripped |

Attribute values containing `__ISML_EXPR__` are skipped by all rules — the value is only known at runtime. Nodes containing `__ISML_CONTENT__` count as having visible text content, so rules like `button-name` and `link-name` do not produce false positives when a button or link text comes from a dynamic expression.

## XML content-asset support

SFCC content-asset XML libraries store HTML markup inside CDATA blocks:

```xml
<library>
  <content-asset content-id="my-asset">
    <custom-attributes>
      <custom-attribute attribute-id="body"><![CDATA[
        <div>
          <a href="/sale">Shop now</a>
        </div>
      ]]></custom-attribute>
    </custom-attributes>
  </content-asset>
</library>
```

The built-in XML processor extracts each CDATA block and presents it to ESLint as a virtual `.html` file, so the accessibility rules run on the HTML content inside. Results are reported with line numbers relative to the original XML file.

The XML processor applies to `**/libraries/**/*.xml` files automatically when using `flat/recommended` (ESLint v9). For ESLint v8, add the override manually if needed:

```json
{
  "overrides": [
    { "files": ["**/libraries/**/*.xml"], "processor": "sfcc-a11y/.xml" },
    { "files": ["**/libraries/**/*.xml/block_*.html"], "parser": "@html-eslint/parser" }
  ]
}
```

## Rules

All 25 rules are re-exported from [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y/README.md#rules) under the `sfcc-a11y/` prefix.

| Rule | WCAG SC | Level |
|---|---|---|
| `sfcc-a11y/img-alt` | 1.1.1 | A |
| `sfcc-a11y/object-alt` | 1.1.1 | A |
| `sfcc-a11y/media-has-caption` | 1.2.2 | A |
| `sfcc-a11y/label` | 1.3.1 | A |
| `sfcc-a11y/scope-attr-valid` | 1.3.1 | A |
| `sfcc-a11y/autocomplete-valid` | 1.3.5 | AA |
| `sfcc-a11y/interactive-supports-focus` | 2.1.1 | A |
| `sfcc-a11y/no-noninteractive-tabindex` | 2.1.1 | A |
| `sfcc-a11y/no-access-key` | 2.1.4 | A |
| `sfcc-a11y/no-distracting-elements` | 2.2.2 | A |
| `sfcc-a11y/no-autofocus` | 2.4.3 | AA |
| `sfcc-a11y/tabindex-no-positive` | 2.4.3 | AA |
| `sfcc-a11y/link-name` | 2.4.4 | A |
| `sfcc-a11y/anchor-is-valid` | 2.4.4 | A |
| `sfcc-a11y/heading-has-content` | 2.4.6 | AA |
| `sfcc-a11y/html-has-lang` | 3.1.1 | A |
| `sfcc-a11y/lang-value` | 3.1.1 | A |
| `sfcc-a11y/aria-role` | 4.1.2 | A |
| `sfcc-a11y/aria-props` | 4.1.2 | A |
| `sfcc-a11y/aria-required-attr` | 4.1.2 | A |
| `sfcc-a11y/aria-proptypes` | 4.1.2 | A |
| `sfcc-a11y/aria-hidden-on-focusable` | 4.1.2 | A |
| `sfcc-a11y/button-name` | 4.1.2 | A |
| `sfcc-a11y/no-redundant-role` | 4.1.2 | AA |
| `sfcc-a11y/role-supports-aria-props` | 4.1.2 | A |

For rule descriptions and options, see the [html-a11y rule catalogue](../eslint-plugin-html-a11y/README.md#rules).

## Known limitation — cross-file label/input association

SFCC projects frequently split `<label>` and `<input>` elements across separate `<isinclude>` files. ESLint processes each file independently, so the `label` rule will report a false positive when the label and its input are in different files.

Suppress with an inline disable comment when needed:

```isml
<%-- eslint-disable-next-line sfcc-a11y/label --%>
<input type="email" id="email">
```

## License

MIT © [Nicola Carkaxhija](https://github.com/nicolacarkaxhija)
