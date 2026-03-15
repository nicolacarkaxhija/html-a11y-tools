import fs from 'fs';
import { ESLint } from 'eslint';
import htmlParser from '@html-eslint/parser';
import plugin, { sanitize } from 'eslint-plugin-sfcc-a11y';

const recommendedRules = plugin.configs['flat/recommended'][0].rules;
const sfccSettings = plugin.configs['flat/recommended'][0].settings;

const ISML_GLOB = '**/*.isml';
const XML_GLOB = '**/libraries/**/*.xml';

// ESLint v9 resolves virtual block config independently (not inherited from parent).
// Virtual filename uses .html so the **/*.html config (htmlParser + rules) applies.
/* c8 ignore start -- v8 creates phantom function/branch entries for the processor object */
/** @type {import('eslint').Linter.Processor} */
const ismlProcessor = {
  meta: { name: 'sfcc-a11y/isml-sanitizer', version: '0.1.0' },
  preprocess(text, filename) {
    return [{ text: sanitize(text), filename: filename + '/__sanitized.html' }];
  },
  // preprocess returns exactly 1 block; postprocess receives [[...msgs]] → unwrap
  postprocess(messages) {
    return messages[0];
  },
  supportsAutofix: false,
};
/* c8 ignore stop */

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
 * @returns {Promise<import('eslint').ESLint.LintResult[]>}
 */
export async function lint(rawPatterns) {
  const patterns = expandPaths(rawPatterns);

  const eslint = new ESLint({
    overrideConfigFile: true, // use ONLY overrideConfig; ignore any project eslint.config.js
    warnIgnored: false, // suppress "file ignored" noise during directory traversal
    errorOnUnmatchedPattern: false, // don't throw when a glob matches no files (e.g. no XML assets)
    overrideConfig: [
      // Base: ISML parser + XML processor + all sfcc-a11y rules
      ...plugin.configs['flat/recommended'],

      // Wire up the ISML sanitizer processor for .isml files.
      // Must come AFTER flat/recommended so it merges on top of the ISML config entry.
      { files: ['**/*.isml'], processor: ismlProcessor },

      // Handle virtual *.html files produced by both processors:
      //   - ismlProcessor returns  filename + '/__sanitized.html'
      //   - xmlProcessor  returns  filename + '/block_N.html'
      // flat/recommended has no **/*.html config, so without this entry those
      // blocks would be parsed with espree (the default JS parser) and rules would never fire.
      {
        files: ['**/*.html'],
        plugins: { 'sfcc-a11y': plugin },
        languageOptions: { parser: htmlParser },
        settings: sfccSettings,
        rules: recommendedRules,
      },
    ],
  });

  return eslint.lintFiles(patterns);
}
