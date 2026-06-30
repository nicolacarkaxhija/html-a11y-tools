# eslint-plugin-sfcc-a11y

## 2.2.0

### Minor Changes

- Legacy `recommended`, `recommended-a`, and `recommended-error` configs now include `overrides` for the ISML processor, HTML parser, XML processor, and XML HTML block parser. Consumers no longer need to add these manually to their `.eslintrc.json`.

## 2.1.0

### Minor Changes

- Add `recommended-error` and `flat/recommended-error` configs that enable the same 25 rules as `recommended` but at `"error"` severity instead of `"warn"`.

### Patch Changes

- Updated dependencies
  - eslint-plugin-html-a11y@0.2.0
