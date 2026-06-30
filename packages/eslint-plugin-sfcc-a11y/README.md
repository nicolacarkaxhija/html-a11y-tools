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

## ISML support

TODO

## XML content-asset support

TODO

## Rules

All 25 rules are re-exported from [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y/README.md#rules) under the `sfcc-a11y/` prefix.

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
