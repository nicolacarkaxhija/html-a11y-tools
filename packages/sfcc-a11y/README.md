# sfcc-a11y

Zero-config CLI for WCAG accessibility checks on Salesforce Commerce Cloud ISML templates and XML content-asset library files.

No ESLint configuration required — install and run.

## Installation

```sh
npm install --save-dev sfcc-a11y
```

Or use directly via `npx`:

```sh
npx sfcc-a11y cartridges/
```

## Usage

```
sfcc-a11y [paths...] [options]

Arguments:
  paths    Files, directories, or globs to check (default: **/*.isml and
           **/libraries/**/*.xml in the current directory)

Options:
  -f, --format <format>  Output format: text, json, github (default: text,
                         or github when GITHUB_ACTIONS=true)
  --exit-zero            Always exit 0, even when violations are found
  -V, --version          Print version
  -h, --help             Show help
```

### Examples

```sh
# Lint all ISML and XML files under cartridges/
sfcc-a11y cartridges/

# Lint a specific file
sfcc-a11y cartridges/app_custom_core/cartridge/templates/default/home.isml

# JSON output
sfcc-a11y cartridges/ --format json

# GitHub Actions annotations (auto-enabled when GITHUB_ACTIONS=true)
sfcc-a11y cartridges/ --format github

# Use in CI without failing the build (warnings only)
sfcc-a11y cartridges/ --exit-zero
```

## Output formats

### `text` (default)

```
cartridges/app_custom_core/templates/default/home.isml
  12:3   warning  <img> is missing a non-empty alt attribute  sfcc-a11y/img-alt  [WCAG 1.1.1]
  25:1   warning  <button> is missing an accessible name      sfcc-a11y/button-name  [WCAG 4.1.2]

2 warnings
```

### `json`

Array of violation objects:

```json
[
  {
    "file": "cartridges/.../home.isml",
    "line": 12,
    "col": 3,
    "severity": "warning",
    "message": "<img> is missing a non-empty alt attribute",
    "rule": "sfcc-a11y/img-alt",
    "wcag": "WCAG 1.1.1"
  }
]
```

### `github`

GitHub Actions workflow command annotations:

```
::warning file=cartridges/.../home.isml,line=12,col=3,title=sfcc-a11y/img-alt::<img> is missing...
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | No violations (or `--exit-zero` was passed) |
| `1` | One or more violations found |
| `2` | Unexpected error (file not found, parse error, etc.) |

## CI integration

### GitHub Actions

```yaml
- name: Accessibility lint
  run: npx sfcc-a11y cartridges/
```

When `GITHUB_ACTIONS=true` is set (automatically by GitHub), the output format defaults to `github` annotations, which surface violations inline in the PR diff.

### npm script

```json
{
  "scripts": {
    "lint:a11y": "sfcc-a11y cartridges/"
  }
}
```

## License

MIT
