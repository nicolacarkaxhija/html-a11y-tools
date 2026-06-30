# eslint-plugin-sfcc-a11y

## 2.2.3

### Patch Changes

- Update READMEs with accurate ESLint v8/v9 setup instructions and corrected introduction sections.
- Updated dependencies
  - eslint-plugin-html-a11y@0.2.3

## 2.2.2

### Patch Changes

- Widen ESLint peer dependency from `>=9.0.0` to `^8.0.0 || >=9.0.0`. Both plugins work with ESLint v8 via legacy configs; the stricter range was incorrectly blocking ESLint v8 projects.
- Updated dependencies
  - eslint-plugin-html-a11y@0.2.2

## 2.2.1

### Patch Changes

- Fix: revert broken 2.2.0 — ESLint v8 does not propagate `overrides` from plugin configs accessed via `extends`. Processor and parser wiring for `.isml` files must still be added manually to the consuming project's `.eslintrc.json`.

## 2.2.0

### Minor Changes

- Legacy `recommended`, `recommended-a`, and `recommended-error` configs now include `overrides` for the ISML processor, HTML parser, XML processor, and XML HTML block parser. Consumers no longer need to add these manually to their `.eslintrc.json`.

## 2.1.0

### Minor Changes

- Add `recommended-error` and `flat/recommended-error` configs that enable the same 25 rules as `recommended` but at `"error"` severity instead of `"warn"`.

### Patch Changes

- Updated dependencies
  - eslint-plugin-html-a11y@0.2.0
