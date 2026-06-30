# eslint-plugin-html-a11y

[![npm](https://img.shields.io/npm/v/eslint-plugin-html-a11y)](https://www.npmjs.com/package/eslint-plugin-html-a11y)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![ESLint](https://img.shields.io/badge/eslint-%3E%3D9-purple)](https://eslint.org)

WCAG 2.2 accessibility linting for HTML-like template languages that `@html-eslint/parser` can parse natively:
plain HTML, Jinja2, Handlebars, Twig, Django, Nunjucks, and any other language whose template syntax is
transparent enough that the parser can produce a valid AST out of it.

> **SFCC ISML?** ISML is not natively supported by `@html-eslint/parser`, since its `<is*>` tags and `${...}` expressions cause parse errors. Use [`eslint-plugin-sfcc-a11y`](../eslint-plugin-sfcc-a11y) instead, which adds an ISML sanitizer on top of this plugin.

## Introduction

Most accessibility linters, such as `eslint-plugin-jsx-a11y` for React, or `eslint-plugin-vuejs-accessibility` for Vue,
target a specific framework, usually the most popular frontend frameworks and libraries; they don't work on plain HTML templates,
and they don't work on other template languages, even though the underlying set of WCAG 2.2 rules is generic, so potentially framework-agnostic.

This plugin fills that gap: 25 WCAG Level A/AA rules that work with any language `@html-eslint/parser` can parse natively. Template expressions like `{{ name }}` or `{% if cond %}` appear as opaque text in the AST, so the parser does not choke on them and rules still fire on the surrounding HTML structure.

For template languages whose syntax does cause parse errors (ISML, and potentially others), the right approach is an adapter package that preprocesses the file, by stripping or neutralising non-HTML syntax, before handing it to the parser. This plugin exposes `buildRulesFor(prefix, rulesMap, config)` precisely so adapters can inherit the full rule set without reimplementing it.

## Installation

Requires Node.js ≥ 18, and the peer dependencies `eslint >= 9` and `@html-eslint/parser >= 0.23`.

```sh
# npm
npm install --save-dev eslint-plugin-html-a11y @html-eslint/parser eslint

# yarn
yarn add --dev eslint-plugin-html-a11y @html-eslint/parser eslint

# pnpm
pnpm add -D eslint-plugin-html-a11y @html-eslint/parser eslint
```

## Setup

Add to your `eslint.config.js` (ESLint v9 flat config):

```js
import htmlA11y from 'eslint-plugin-html-a11y';

export default [...htmlA11y.configs.recommended];
```

The `recommended` config applies `@html-eslint/parser` to `**/*.html` files and enables all 25 rules as `"warn"`.

### Override with custom configurations

```js
import htmlA11y from 'eslint-plugin-html-a11y';
import htmlParser from '@html-eslint/parser';

export default [
  ...htmlA11y.configs.recommended,
  {
    files: ['**/*.html', '**/*.jinja2'],
    plugins: { 'html-a11y': htmlA11y },
    languageOptions: { parser: htmlParser },
    rules: {
      'html-a11y/img-alt': 'error',     // or 2
      'html-a11y/button-name': 'warn',  // or 1
      'html-a11y/no-autofocus': 'off',  // or 0
    },
  },
];
```

### Dynamic template values

If you run a preprocessor that replaces template expressions with a sentinel string before the file gets parsed, configure the sentinel so rules know to treat those attribute values and text nodes as non-empty runtime values rather than flagging them as violations:

```js
export default [
  ...htmlA11y.configs.recommended,
  {
    files: ['**/*.html'],
    settings: {
      'html-a11y': {
        dynamicValueMarker: '__EXPR__',    // skip attributes whose value contains this string
        dynamicContentMarker: '__CONTENT__', // treat text nodes containing this string as non-empty
      },
    },
  },
];
```

Without a preprocessor — if template expressions appear literally in the source (e.g., `alt="{{ image.alt }}"`) — no configuration is needed. The parser sees the expression as a non-empty string and rules pass without false positives in the common case.

Adapter packages handle this automatically. `eslint-plugin-sfcc-a11y`, for example, replaces ISML `${...}` expressions with `__ISML_EXPR__` and configures that marker in the recommended settings, so no manual setup is required.

## Rules

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `img-alt` | 1.1.1 | A | `<img>` and `<input type="image">` must have a non-empty `alt` |
| `object-alt` | 1.1.1 | A | `<object>` must have an accessible text alternative |
| `media-has-caption` | 1.2.2 | A | `<video>` must have a `<track kind="captions">` child |
| `label` | 1.3.1 | A | Form controls must have an associated accessible label |
| `scope-attr-valid` | 1.3.1 | A | `scope` on `<th>` must be `col`, `row`, `colgroup`, or `rowgroup` |
| `autocomplete-valid` | 1.3.5 | AA | `autocomplete` attribute must use valid tokens |
| `interactive-supports-focus` | 2.1.1 | A | Elements with interactive ARIA roles must be keyboard-focusable |
| `no-noninteractive-tabindex` | 2.1.1 | A | `tabindex >= 0` must not appear on non-interactive elements |
| `no-access-key` | 2.1.4 | A | Forbid `accesskey` attribute |
| `no-distracting-elements` | 2.2.2 | A | Forbid `<marquee>` and `<blink>` |
| `no-autofocus` | 2.4.3 | AA | Forbid `autofocus` attribute |
| `tabindex-no-positive` | 2.4.3 | AA | `tabindex` must not be greater than 0 |
| `link-name` | 2.4.4 | A | `<a>` and `<area href>` must have discernible text or `aria-label` |
| `anchor-is-valid` | 2.4.4 | A | `<a>` must have a navigating `href` (not `#`, `javascript:`, empty) |
| `heading-has-content` | 2.4.6 | AA | `<h1>`–`<h6>` must have non-empty text content |
| `html-has-lang` | 3.1.1 | A | `<html>` must have a non-empty `lang` attribute |
| `lang-value` | 3.1.1 | A | `lang` attribute must be a valid BCP 47 language tag |
| `aria-role` | 4.1.2 | A | `role` value must be a valid, non-abstract ARIA role |
| `aria-props` | 4.1.2 | A | `aria-*` attribute names must be valid ARIA properties |
| `aria-required-attr` | 4.1.2 | A | Required ARIA attributes for the element's role must be present |
| `aria-proptypes` | 4.1.2 | A | `aria-*` values must match the expected ARIA type |
| `aria-hidden-on-focusable` | 4.1.2 | A | `aria-hidden="true"` must not appear on focusable elements |
| `button-name` | 4.1.2 | A | `<button>` must have discernible text or `aria-label` |
| `no-redundant-role` | 4.1.2 | AA | Explicit `role` must not duplicate the element's implicit ARIA role |
| `role-supports-aria-props` | 4.1.2 | A | `aria-*` attributes must be in the element's role's supported set |

## License

MIT © [Nicola Carkaxhija](https://github.com/nicolacarkaxhija)
