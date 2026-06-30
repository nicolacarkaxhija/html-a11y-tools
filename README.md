# html-a11y-tools

[![CI](https://github.com/nicolacarkaxhija/html-a11y-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/nicolacarkaxhija/html-a11y-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

Monorepo for WCAG 2.2 accessibility linting tools targeting HTML template ecosystems.

## Packages

| Package | Version | Description |
|---|---|---|
| [`eslint-plugin-html-a11y`](packages/eslint-plugin-html-a11y) | [![npm](https://img.shields.io/npm/v/eslint-plugin-html-a11y)](https://www.npmjs.com/package/eslint-plugin-html-a11y) | 25 WCAG Level A/AA rules for any template language `@html-eslint/parser` can parse |
| [`eslint-plugin-sfcc-a11y`](packages/eslint-plugin-sfcc-a11y) | [![npm](https://img.shields.io/npm/v/eslint-plugin-sfcc-a11y)](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y) | SFCC adapter: adds ISML sanitizer and XML content-asset processor |
| [`sfcc-a11y`](packages/sfcc-a11y) | [![npm](https://img.shields.io/npm/v/sfcc-a11y)](https://www.npmjs.com/package/sfcc-a11y) | Zero-config CLI for SFCC ISML and XML accessibility audits |

## Introduction

Most accessibility linters target a single framework, such as React (`eslint-plugin-jsx-a11y`), Vue (`eslint-plugin-vuejs-accessibility`), and so on. Plain HTML templates and non-mainstream template languages are left without tooling, even though the underlying WCAG 2.2 rules are fully framework-agnostic.

This plugin aims to fill the gap by bringing the same set of WCAG Level A and AA checks to any HTML-like template language that
`@html-eslint/parser` can parse to an AST, enabling static analysis before compilation.

By design, this package is meant to be extended into new ones that enable the target languages to reuse the current package,
by providing a preprocessor that strips or silences any template-specific syntax before the parser runs,
so that the result of the reduction can rely on the hereby supported engine and rules, without having to reimplement them for each new template language.

## Architecture

```
eslint-plugin-html-a11y                 25 WCAG rules, parser integration, extension API
        │
        └── eslint-plugin-sfcc-a11y     re-exports all rules under sfcc-a11y/ prefix
                │                        adds ISML sanitizer + XML processor
                │
                └── sfcc-a11y           zero-config CLI wrapper, multiple output formats
```

Adapter packages consume `buildRulesFor(prefix, rulesMap, config)` from `eslint-plugin-html-a11y` to produce correctly-namespaced rule objects without duplicating the filtering or severity logic.

## Repository layout

```
packages/
  eslint-plugin-html-a11y/   # Core plugin — rules, parser config, extension API
  eslint-plugin-sfcc-a11y/   # SFCC adapter — ISML sanitizer, XML processor
  sfcc-a11y/                 # Zero-config CLI
docs/
  functional-specs.md        # Product requirements and rule catalogue
  technical-specs.md         # Architecture and implementation details
.changeset/                  # Pending release changesets (managed by Changesets)
.github/workflows/
  ci.yml                     # Test matrix (Node 18/20/22), PR title check, changeset guard
  release.yml                # changesets/action — opens version PRs or publishes to npm
```

## Adding a rule

Rules live in `eslint-plugin-html-a11y`. SFCC and the CLI pick them up automatically.

1. Create `packages/eslint-plugin-html-a11y/lib/rules/<rule-name>.js` with `meta.docs.wcag` and `meta.docs.level` set
2. Add tests in `packages/eslint-plugin-html-a11y/tests/rules/<rule-name>.test.js`
3. Register the rule in `packages/eslint-plugin-html-a11y/index.js` — it is automatically included in `recommended`, `flat/recommended`, and all SFCC configs

## Adding a new template adapter

1. Create a new package under `packages/`
2. Add it to the `workspaces` array in the root `package.json`
3. Depend on `eslint-plugin-html-a11y`
4. Write a preprocessor that strips or neutralises template-specific syntax, then register sentinel values in the plugin settings so rules know to skip dynamic values
5. Use `buildRulesFor(yourPrefix, htmlA11y.rules, config)` to produce the correctly-namespaced recommended rules

## Releases

Releases are managed with [Changesets](https://github.com/changesets/changesets). Every PR that changes package behaviour must include a changeset file (enforced by CI).

```sh
npm run changeset   # describe what changed and which packages are affected
npm run version     # apply version bumps and update CHANGELOG files
npm run release     # publish changed packages to npm
```

In practice the `version` and `release` steps run automatically via the GitHub Actions release workflow: merging to `main` either opens a "Version Packages" PR (if changesets are pending) or publishes directly (if that PR is what was merged).

## Documentation

- [Functional specifications](docs/functional-specs.md)
- [Technical specifications](docs/technical-specs.md)

## License

MIT © [Nicola Carkaxhija](https://github.com/nicolacarkaxhija)
