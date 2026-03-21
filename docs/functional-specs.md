# html-a11y-tools — Functional Specifications

## 1. Purpose

`html-a11y-tools` is an open-source accessibility linting toolkit for HTML template ecosystems. It catches WCAG Level A and AA violations at development time — in the IDE and in CI — before they reach production.

The toolkit is structured as three packages to serve different audiences:

| Package | Audience |
|---|---|
| `eslint-plugin-html-a11y` | Any team using `@html-eslint/parser` (Jinja2, Handlebars, Django, Nunjucks, Twig, plain HTML, SFCC ISML) |
| `eslint-plugin-sfcc-a11y` | SFCC teams already using ESLint |
| `sfcc-a11y` (CLI) | SFCC teams that do not have ESLint set up |

## 2. Problem statement

- **`eslint-plugin-jsx-a11y`** covers JSX only — it does not work with HTML template files.
- **`@html-eslint/eslint-plugin`** provides HTML-specific linting rules but has no accessibility rules.
- **SFCC** projects use ISML, a non-standard HTML-like template language, and store rich HTML in XML library files. No existing tool covers both.

## 3. Goals

1. Surface WCAG Level A/AA violations at lint time, requiring no runtime browser environment.
2. Produce zero false positives on dynamic template expressions (e.g. `alt="${image.alt}"`).
3. Be drop-in for any ESLint v9 flat-config setup using `@html-eslint/parser`.
4. Provide a zero-config CLI entry point that requires no ESLint knowledge to use.
5. Emit machine-readable output suitable for CI annotation (GitHub Actions) and automated reporting.

## 4. Non-goals

- Runtime accessibility auditing (that is for tools like axe-core).
- Full WCAG 2.2 Level AAA coverage — the toolkit targets A and AA.
- Browser extension or DevTools integration (separate project).
- Auto-fixing violations (informational warnings only).

## 5. Target file types

| File type | Handled by |
|---|---|
| `**/*.html` | `eslint-plugin-html-a11y` directly |
| `**/*.isml` | `eslint-plugin-sfcc-a11y` ISML sanitizer + html-a11y rules |
| `**/libraries/**/*.xml` | `eslint-plugin-sfcc-a11y` XML processor (CDATA extraction) + html-a11y rules |

## 6. Rule catalogue

All 25 rules are defined in `eslint-plugin-html-a11y` and re-exported by `eslint-plugin-sfcc-a11y`.

### Perceivable (WCAG Principle 1)

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `img-alt` | 1.1.1 | A | `<img>` and `<input type="image">` must have a non-empty `alt` attribute. Decorative images may use `alt=""` with `role="presentation"` or `role="none"`. `aria-labelledby` is also accepted. |
| `object-alt` | 1.1.1 | A | `<object>` must have an accessible text alternative: non-empty `title`, `aria-label`, `aria-labelledby`, or visible text content. |
| `media-has-caption` | 1.2.2 | A | `<video>` must contain a `<track kind="captions">` child element. Muted videos are exempt. Dynamic `kind` values (template expressions) are skipped. |
| `label` | 1.3.1 | A | Form controls (`<input>`, `<select>`, `<textarea>`) must have an accessible label via `<label for>`, `aria-label`, or `aria-labelledby`. `<input type="image">` is exempt (covered by `img-alt`). |
| `scope-attr-valid` | 1.3.1 | A | `scope` attribute on `<th>` elements must be one of: `col`, `row`, `colgroup`, `rowgroup`. |
| `autocomplete-valid` | 1.3.5 | AA | `autocomplete` on eligible input types must use valid WCAG-specified token strings. |
| `no-distracting-elements` | 2.2.2 | A | `<marquee>` and `<blink>` are forbidden — they cause uncontrollable motion. |

### Operable (WCAG Principle 2)

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `interactive-supports-focus` | 2.1.1 | A | Elements with interactive ARIA roles (`button`, `link`, `checkbox`, `menuitem`, etc.) must be natively focusable or have `tabindex="0"`. |
| `no-noninteractive-tabindex` | 2.1.1 | A | `tabindex >= 0` must not be placed on non-interactive elements (elements with non-interactive roles, or no role). |
| `no-access-key` | 2.1.4 | A | `accesskey` attribute is forbidden — it creates keyboard shortcut conflicts. |
| `tabindex-no-positive` | 2.4.3 | AA | `tabindex` must not be greater than 0 — positive values disrupt natural tab order. |
| `no-autofocus` | 2.4.3 | AA | `autofocus` attribute is forbidden — it moves focus unexpectedly and disorients keyboard/screen-reader users. |
| `link-name` | 2.4.4 | A | `<a>` and `<area href>` must have discernible text: non-empty text content, `aria-label`, or `aria-labelledby`. |
| `anchor-is-valid` | 2.4.4 | A | `<a>` must have a `href` that navigates. `href="#"`, `href="javascript:void(0)"`, and empty `href` are not valid. |
| `heading-has-content` | 2.4.6 | AA | `<h1>`–`<h6>` must have non-empty text content. |

### Understandable (WCAG Principle 3)

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `html-has-lang` | 3.1.1 | A | `<html>` must have a non-empty `lang` attribute. |
| `lang-value` | 3.1.1 | A | The value of `lang` must be a valid BCP 47 language tag (e.g. `en`, `en-US`). |

### Robust (WCAG Principle 4)

| Rule | WCAG SC | Level | Description |
|---|---|---|---|
| `aria-role` | 4.1.2 | A | `role` value must be a valid, non-abstract ARIA role. Multiple space-separated roles are each validated. Boolean `role` attribute (no value) is allowed. |
| `aria-props` | 4.1.2 | A | `aria-*` attribute names must be valid ARIA properties as defined by the ARIA spec. |
| `aria-required-attr` | 4.1.2 | A | When an element has a `role`, all required ARIA attributes for that role must be present. |
| `aria-proptypes` | 4.1.2 | A | `aria-*` attribute values must match the expected ARIA type: `boolean`, `tristate`, `token`, `tokenlist`, `integer`, `number`, or `string`. |
| `aria-hidden-on-focusable` | 4.1.2 | A | `aria-hidden="true"` must not appear on focusable elements (natively focusable tags, or elements with a non-negative `tabindex`). `<a>` without `href` and `<input type="hidden">` are exempt. |
| `button-name` | 4.1.2 | A | `<button>` must have discernible text: non-empty text content, `aria-label`, or `aria-labelledby`. |
| `no-redundant-role` | 4.1.2 | AA | Explicit `role` must not duplicate the element's implicit ARIA role. Uses the HTML-AAM implicit role mapping for each element (e.g. `<button role="button">` is redundant). `<a>` without `href` has implicit role `generic` (not `link`). |
| `role-supports-aria-props` | 4.1.2 | A | `aria-*` attributes on an element must be in the set of properties supported or inherited by the element's role. |

## 7. ISML dynamic-expression handling

SFCC ISML files use `${...}` for server-side expressions. The sanitizer replaces these with a sentinel string (`__ISML_EXPR__`) before parsing.

All rules that check attribute values call `isDynamicValue(value, marker)`. When the value equals the configured `dynamicValueMarker`, the check is skipped — treating a dynamic value as conditionally valid rather than reporting a false positive.

Similarly, text-node sentinels (`__ISML_CONTENT__`) count as visible text for rules that check for non-empty content.

The sentinel strings are configurable via ESLint `settings` so any template ecosystem can use this mechanism with its own markers.

## 8. XML content-asset handling

The XML processor runs as an ESLint file processor on `**/libraries/**/*.xml`. It:

1. Parses the XML with a simple regex to find all `<![CDATA[...]]>` sections.
2. Returns each CDATA block as a virtual `.html` file with a unique filename.
3. In `postprocess`, remaps line numbers from virtual HTML coordinates back to the original XML file's line numbers (both `line` and `endLine`).

Violations reference the line in the XML file where the corresponding CDATA block begins.

## 9. CLI functional requirements

The `sfcc-a11y` CLI must:

- Accept zero arguments and default to scanning `**/*.isml` and `**/libraries/**/*.xml` in the current directory.
- Accept one or more file paths, directory paths, or glob patterns as arguments.
- Expand directory arguments to `<dir>/**/*.isml` and `<dir>/**/libraries/**/*.xml`.
- Support three output formats: `text` (human-readable), `json` (machine-readable array), `github` (GitHub Actions annotations).
- Default to `github` format when `GITHUB_ACTIONS=true` is set.
- Exit with code `0` when no violations are found, `1` when violations are found, `2` on unexpected errors.
- Provide `--exit-zero` to suppress the non-zero exit code (useful for advisory-only CI runs).

## 10. Coverage and quality requirements

- 100% code coverage (statements, branches, functions, lines) on all source files.
- The CLI entry point (`bin/sfcc-a11y.js`) is exempt — covered via subprocess tests.
- All rules must have test cases using ESLint `RuleTester` with both `valid` and `invalid` examples.
