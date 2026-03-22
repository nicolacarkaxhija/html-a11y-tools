'use strict';

const fs = require('fs');
const { ESLint } = require('eslint');
const plugin = require('eslint-plugin-sfcc-a11y');
const { buildRules } = require('eslint-plugin-sfcc-a11y');

const ISML_GLOB = '**/*.isml';
const XML_GLOB = '**/libraries/**/*.xml';

/* c8 ignore next -- v8 maps expandPaths phantom branch to JSDoc line */
/** Expand directory paths to globs; pass-through globs/files. Forward slashes always. */
function expandPaths(paths) {
  return paths.flatMap((p) => {
    try {
      if (fs.statSync(p).isDirectory()) {
        const base = p.replace(/\\/g, '/').replace(/\/$/, '');
        return [`${base}/${ISML_GLOB}`, `${base}/${XML_GLOB}`];
      }
    } catch {
      // Not a real path on disk — treat as a glob pattern and pass through
    }
    return [p];
  });
}

/**
 * Lint the given file paths, directories, or glob patterns.
 *
 * @param {string[]} rawPatterns
 * @param {object} [config] Rule configuration passed to buildRules().
 * @param {'A'|'AA'|'AAA'} [config.level] WCAG ceiling level (default: 'AA').
 * @param {'warn'|'error'} [config.severity] Global rule severity (default: 'warn').
 * @param {Record<string,string|number>} [config.rules] Per-rule overrides (unprefixed names).
 * @returns {Promise<import('eslint').ESLint.LintResult[]>}
 */
async function lint(rawPatterns, config = {}) {
  const patterns = expandPaths(rawPatterns);
  const dynamicRules = buildRules(config);
  // Replace rules only in linting entries (those with both rules + languageOptions).
  // Processor-only entries ([0] and [2]) have neither, so they pass through unchanged.
  const overrideConfig = plugin.configs['flat/recommended']
    .map((entry) =>
      entry.rules && entry.languageOptions ? { ...entry, rules: dynamicRules } : entry,
    );

  const eslint = new ESLint({
    overrideConfigFile: true, // use ONLY overrideConfig; ignore any project eslint.config.js
    warnIgnored: false, // suppress "file ignored" noise during directory traversal
    errorOnUnmatchedPattern: false, // don't throw when a glob matches no files (e.g. no XML assets)
    overrideConfig,
  });

  return eslint.lintFiles(patterns);
}

module.exports = { lint };
