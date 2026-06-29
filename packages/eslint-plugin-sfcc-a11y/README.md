# eslint-plugin-sfcc-a11y

[![npm](https://img.shields.io/npm/v/eslint-plugin-sfcc-a11y)](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

eslint-plugin-html-a11y adapter for enabling WCAG accessibility linting on Salesforce Commerce Cloud (SFCC) projects:
adds the ISML sanitizer and XML content-asset processor so the same 25 WCAG rules work on .isml templates and XML content asset libraries.

## Introduction

TODO

## Installation

Requires **Node.js ≥ 18**, **`ESLint ≥ 9`**, and **`@html-eslint/parser` ≥ 0.23**:

```sh
npm install --save-dev eslint-plugin-sfcc-a11y @html-eslint/parser eslint
```
```yarn
yarn add --dev eslint-plugin-sfcc-a11y @html-eslint/parser eslint
```

## Setup

```js
// eslint.config.js
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [
  ...sfccA11y.configs['flat/recommended'],
];
```

The `flat/recommended` config automatically:

- Applies `@html-eslint/parser` to `**/*.isml` files via the ISML sanitizer preprocessor
- Applies the XML content-asset processor to `**/libraries/**/*.xml` files
- Configures the ISML dynamic-expression sentinels (`__ISML_EXPR__` / `__ISML_CONTENT__`)
- Sets all 25 rules to `"warn"` under the `sfcc-a11y/` prefix

### Changing rule severity

```js
import sfccA11y from 'eslint-plugin-sfcc-a11y';

export default [
  ...sfccA11y.configs['flat/recommended'],
  {
    rules: {
      'sfcc-a11y/img-alt': 'error',     // or 2
      'sfcc-a11y/button-name': 'warn',  // or 1
      'sfcc-a11y/html-has-lang': 'off', // or 0
    },
  },
];
```

For available rules and their options, see the [html-a11y rule catalogue](../eslint-plugin-html-a11y/README.md#rules).

All 25 rule names are listed under [Rules](#rules) below.

## ISML support

The built-in sanitizer handles all of these before the HTML parser processes the file:
- `<is*>` tags → stripped (void tags) or replaced with a block spacer
- `${...}` in attribute values → replaced with `__ISML_EXPR__`
- `<isprint>` / `<ispicture>` / `<iscontentasset>` → replaced with `__ISML_CONTENT__`
- ISML comments → stripped

Dynamic attribute values (`__ISML_EXPR__`) are skipped by all rules to avoid false positives.
Dynamic content markers (`__ISML_CONTENT__`) count as visible text content.

---

ISML files enrich HTML with Salesforce-specific proprietary template syntax with `<is*>` tags, `${...}`
expressions inside attribute values: `alt="${image.alt}"`, and `<%-- --%>` comments that would confuse a standard HTML parser.

The built-in sanitizer strips or neutralises all ISML-specific constructs before parsing:
, so rules see clean markup and don't produce false positives on
dynamic values.
| ISML construct | Replacement |
|---|---|
| `<is*>` tags (structural: `isif`, `isloop`, etc.) | block spacer (preserves line numbers) |
| `<is*>` void tags (`isbreak`, etc.) | stripped |
| `${...}` in attribute values | `__ISML_EXPR__` |
| `<isprint>`, `<ispicture>`, `<iscontentasset>` | `__ISML_CONTENT__` |
| ISML comments `<%-- --%>` | stripped |

Attributes containing `__ISML_EXPR__` are always skipped (the value is only known at runtime).
Nodes containing `__ISML_CONTENT__` count as having visible text content.

## XML content-asset support

TODO

## XML content-asset support

TODO

## Rules

All 25 rules are re-exported from [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y/README.md#rules) under the `sfcc-a11y/` prefix: [...].


## Known limitation — cross-file label/input association

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
