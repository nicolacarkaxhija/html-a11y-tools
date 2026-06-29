# sfcc-a11y

CLI tool for running WCAG accessibility audits on Salesforce Commerce Cloud (SFCC) ISML templates and XML content assets.

This is a thin zero-config wrapper around [`eslint-plugin-sfcc-a11y`](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y) that runs the same rules, but without requiring an ESLint config file or parser setup.

Useful for one-off audits or CI pipeline scans on projects that don't already use ESLint. To get editor-integrated feedback and per-rule configuration, please use the plugin [`eslint-plugin-sfcc-a11y`](https://www.npmjs.com/package/eslint-plugin-sfcc-a11y) instead.

[![npm](https://img.shields.io/npm/v/sfcc-a11y)](https://www.npmjs.com/package/sfcc-a11y)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

---

## Usage

```sh
sfcc-a11y [paths...]                Files, directories, or globs patterns to check
                                    (default: **/*.isml and **/libraries/**/*.xml)
  -f, --format <text|json|github>   Output format
  --exit-zero                       Always exit 0, even when violations are found,
                                    reporting them as warnings to not block CI
```

## Output formats

Choose with `-f, --format`:

- **`text`** (default) human-readable terminal output
- **`json`** array of violation objects
- **`github`** `::warning file=...` inline PR diffs annotations

Default is `text`, or `github` when `GITHUB_ACTIONS=true`.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | No violations, or `--exit-zero` flag set |
| `1` | One or more violations found |
| `2` | Unexpected runtime error (file not found, parse failure, etc.) |

## CI integration

### GitHub Actions (inline annotations)

```yaml
- name: Accessibility lint
  run: npx sfcc-a11y cartridges/ --format github; exit ${PIPESTATUS[0]}
```

### GitHub Actions (JSON report artifact)

```yaml
- name: Accessibility lint
  run: npx sfcc-a11y cartridges/ --format json > a11y-report.json; exit ${PIPESTATUS[0]}

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: a11y-report
    path: a11y-report.json
```

### Bitbucket Pipelines (JSON report artifact)

```yaml
- step:
    name: Accessibility lint
    script:
      - npx sfcc-a11y cartridges/ --format json > a11y-report.json; exit ${PIPESTATUS[0]}
    artifacts:
      - a11y-report.json
```

## Configuration

Config is loaded from the first source found (in priority order):

1. `sfcc-a11y.config.js` — dynamic config
2. `.sfcc-a11yrc.json` — static JSON config
3. `package.json` — `"sfcc-a11y"` key

CLI flags always override the file config.

**Example `.sfcc-a11yrc.json`:**

```json
{
  "paths": ["cartridges/**/*.isml", "**/libraries/**/*.xml"],
  "format": "text",
  "exitZero": false
}
```

## License

MIT © [Nicola Carkaxhija](https://github.com/nicolacarkaxhija)
