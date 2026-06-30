# eslint-plugin-html-a11y

## 0.2.3

### Patch Changes

- Update READMEs with accurate ESLint v8/v9 setup instructions and corrected introduction sections.

## 0.2.2

### Patch Changes

- Widen ESLint peer dependency from `>=9.0.0` to `^8.0.0 || >=9.0.0`. Both plugins work with ESLint v8 via legacy configs; the stricter range was incorrectly blocking ESLint v8 projects.

## 0.2.1

### Patch Changes

- Update README: revise introduction and dynamic template values section.

## 0.2.0

### Minor Changes

- Export `buildRulesFor(prefix, rulesMap, config)` for use by adapter packages that need correctly-namespaced rule objects without reimplementing the level-filter and severity logic.
