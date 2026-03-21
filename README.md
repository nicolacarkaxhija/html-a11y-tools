# html-a11y-tools

Monorepo for WCAG accessibility linting tools targeting HTML template ecosystems.

## Packages

| Package | Version | Description |
|---|---|---|
| [`eslint-plugin-html-a11y`](packages/eslint-plugin-html-a11y) | 0.1.0 | 25 WCAG accessibility rules for any `@html-eslint/parser` project |
| [`eslint-plugin-sfcc-a11y`](packages/eslint-plugin-sfcc-a11y) | 2.0.0 | SFCC adapter — adds ISML sanitizer and XML content-asset processor |
| [`sfcc-a11y`](packages/sfcc-a11y) | 1.0.0-alpha.0 | Zero-config CLI for SFCC ISML and XML accessibility checks |

## Motivation

`@html-eslint/eslint-plugin` has no accessibility rules. `eslint-plugin-jsx-a11y` is JSX-only. Template ecosystems (Jinja2, Handlebars, Django, SFCC ISML) are underserved.

`eslint-plugin-html-a11y` fills that gap with 25 WCAG Level A/AA rules that work with `@html-eslint/parser`. `eslint-plugin-sfcc-a11y` extends it with SFCC-specific pre-processing. `sfcc-a11y` wraps everything in a zero-config CLI.

## Repository structure

```
packages/
  eslint-plugin-html-a11y/   # General-purpose ESLint plugin (25 rules)
  eslint-plugin-sfcc-a11y/   # SFCC adapter (re-exports rules + ISML/XML processors)
  sfcc-a11y/                 # Zero-config CLI
docs/
  functional-specs.md        # Product requirements and rule catalogue
  technical-specs.md         # Architecture and implementation details
```

## Development

```sh
npm install              # install all workspace deps
npm test                 # run all tests
npm run test:coverage    # run with 100% coverage check
npm run lint             # ESLint across all packages
npm run format           # Prettier
```

### Adding a rule

1. Create `packages/eslint-plugin-html-a11y/lib/rules/<rule-name>.js`
2. Add tests in `packages/eslint-plugin-html-a11y/tests/rules/<rule-name>.test.js`
3. Register in `packages/eslint-plugin-html-a11y/index.js`
4. Add `meta.docs.wcag` — the `wcagMap` in `eslint-plugin-sfcc-a11y` is computed automatically

### Releases

Managed with [Changesets](https://github.com/changesets/changesets):

```sh
npm run changeset   # document what changed
npm run version     # bump versions
npm run release     # publish to npm
```

## Documentation

- [Functional specifications](docs/functional-specs.md)
- [Technical specifications](docs/technical-specs.md)

## License

MIT
