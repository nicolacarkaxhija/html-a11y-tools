# eslint-plugin-html-a11y

25 WCAG Level A/AA accessibility rules for HTML templates parsed with [`@html-eslint/parser`](https://github.com/yeonjuan/html-eslint).

Works with any HTML-like template language: plain HTML, ISML, Jinja2, Handlebars, Django, Nunjucks, Twig — anything that `@html-eslint/parser` can parse.

## Installation

```sh
npm install --save-dev eslint-plugin-html-a11y @html-eslint/parser eslint
```

**Peer dependencies:** `eslint >= 9`, `@html-eslint/parser >= 0.23`

## Setup

Add to your `eslint.config.js` (ESLint v9 flat config):

```js
import htmlA11y from 'eslint-plugin-html-a11y';

export default [
  ...htmlA11y.configs.recommended,
];
```

The `recommended` config applies `@html-eslint/parser` to `**/*.html` files and sets all 25 rules to `"warn"`.

### Custom configuration

```js
import htmlA11y from 'eslint-plugin-html-a11y';
import htmlParser from '@html-eslint/parser';

export default [
  {
    files: ['**/*.html', '**/*.jinja2'],
    plugins: { 'html-a11y': htmlA11y },
    languageOptions: { parser: htmlParser },
    rules: {
      'html-a11y/img-alt': 'error',
      'html-a11y/button-name': 'warn',
      // ... etc.
    },
  },
];
```

### Dynamic template values

If your template engine uses a marker in attribute values to represent runtime expressions, configure it via `settings` so the plugin can skip those attributes rather than reporting false positives:

```js
export default [
  {
    files: ['**/*.html'],
    plugins: { 'html-a11y': htmlA11y },
    languageOptions: { parser: htmlParser },
    settings: {
      'html-a11y': {
        dynamicValueMarker: '__DYNAMIC__',   // placeholder in attribute values
        dynamicContentMarker: '__CONTENT__', // placeholder in text nodes
      },
    },
    rules: { ... },
  },
];
```

If no markers are configured, all literal attribute values are checked as-is.

## Rules

All 25 rules implement WCAG 2.2 success criteria at Level A or AA.

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `img-alt` | 1.1.1 | A | `<img>` and `<input type="image">` must have a non-empty `alt` |
| `object-alt` | 1.1.1 | A | `<object>` must have an accessible text alternative |
| `media-has-caption` | 1.2.2 | A | `<video>` must have a `<track kind="captions">` child |
| `label` | 1.3.1 | A | Form controls must have an associated accessible label |
| `scope-attr-valid` | 1.3.1 | A | `scope` on `<th>` must be `col`, `row`, `colgroup`, or `rowgroup` |
| `autocomplete-valid` | 1.3.5 | AA | `autocomplete` attribute must use valid tokens |
| `no-distracting-elements` | 2.2.2 | A | Forbid `<marquee>` and `<blink>` |
| `interactive-supports-focus` | 2.1.1 | A | Elements with interactive ARIA roles must be keyboard-focusable |
| `no-noninteractive-tabindex` | 2.1.1 | A | `tabindex >= 0` must not appear on non-interactive elements |
| `no-access-key` | 2.1.4 | A | Forbid `accesskey` attribute |
| `tabindex-no-positive` | 2.4.3 | AA | `tabindex` must not be greater than 0 |
| `no-autofocus` | 2.4.3 | AA | Forbid `autofocus` attribute |
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

## Attribution

Inspired by [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) (rule names and WCAG mappings) and [`aria-query`](https://github.com/A11yance/aria-query) (ARIA data). No source code was copied.

## License

MIT
