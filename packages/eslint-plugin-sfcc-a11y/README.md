# eslint-plugin-sfcc-a11y

ESLint plugin for WCAG accessibility checks on Salesforce Commerce Cloud (SFCC) ISML templates and XML content-asset library files.

This package is a thin SFCC adapter on top of [`eslint-plugin-html-a11y`](../eslint-plugin-html-a11y). It re-exports all 25 WCAG rules and adds:

- **ISML sanitizer** — strips `<is*>` tags and converts `${...}` expressions to a sentinel value before parsing
- **XML content-asset processor** — extracts HTML from `<![CDATA[...]]>` blocks in library XML files

## Installation

```sh
npm install --save-dev eslint-plugin-sfcc-a11y @html-eslint/parser eslint
```

**Peer dependencies:** `eslint >= 9`, `@html-eslint/parser >= 0.23`

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

## ISML support

ISML files contain syntax that is not valid HTML:

- `<isif>`, `<isloop>`, `<isinclude>`, `<isset>` and other `<is*>` tags
- `${expression}` inside attribute values: `alt="${image.alt}"`
- `<isprint value="${expr}">` for inline text output
- `<ispicture>`, `<iscontentasset>` for dynamic content blocks
- ISML comments: `<%-- ... --%>`

The built-in sanitizer handles all of these before the HTML parser sees the file:

- `<is*>` tags → stripped (void tags) or replaced with a block spacer
- `${...}` in attribute values → replaced with `__ISML_EXPR__`
- `<isprint>` / `<ispicture>` / `<iscontentasset>` → replaced with `__ISML_CONTENT__`
- ISML comments → stripped

Dynamic attribute values (`__ISML_EXPR__`) are skipped by all rules to avoid false positives. Dynamic content markers (`__ISML_CONTENT__`) count as visible text content.

## XML content-asset support

SFCC content library XML files store rich HTML in CDATA sections:

```xml
<content-asset content-id="homepage-hero">
  <custom-attributes>
    <custom-attribute attribute-id="body"><![CDATA[
      <img src="hero.jpg" alt="">
    ]]></custom-attribute>
  </custom-attributes>
</content-asset>
```

The processor extracts each CDATA block, lints the HTML inside, and maps violations back to the correct line numbers in the original XML file.

Target pattern: `**/libraries/**/*.xml`

## Rules

All 25 rules are re-exported verbatim from `eslint-plugin-html-a11y`. See the [html-a11y rule catalogue](../eslint-plugin-html-a11y/README.md#rules) for the full list with WCAG mappings.

Under the `sfcc-a11y/` prefix:

```
sfcc-a11y/img-alt
sfcc-a11y/object-alt
sfcc-a11y/media-has-caption
sfcc-a11y/label
sfcc-a11y/scope-attr-valid
sfcc-a11y/autocomplete-valid
sfcc-a11y/no-distracting-elements
sfcc-a11y/interactive-supports-focus
sfcc-a11y/no-noninteractive-tabindex
sfcc-a11y/no-access-key
sfcc-a11y/tabindex-no-positive
sfcc-a11y/no-autofocus
sfcc-a11y/link-name
sfcc-a11y/anchor-is-valid
sfcc-a11y/heading-has-content
sfcc-a11y/html-has-lang
sfcc-a11y/lang-value
sfcc-a11y/aria-role
sfcc-a11y/aria-props
sfcc-a11y/aria-required-attr
sfcc-a11y/aria-proptypes
sfcc-a11y/aria-hidden-on-focusable
sfcc-a11y/button-name
sfcc-a11y/no-redundant-role
sfcc-a11y/role-supports-aria-props
```

## Known limitation — cross-file label/input association

The `label` rule matches `<label for="x">` to `<input id="x">` within the same file. SFCC projects often split labels and inputs across `<isinclude>` files. Use an inline disable comment when needed:

```isml
<%-- eslint-disable-next-line sfcc-a11y/label --%>
<input type="email" id="email">
```

## License

MIT
