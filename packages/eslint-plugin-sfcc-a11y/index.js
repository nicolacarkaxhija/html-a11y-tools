'use strict';

/**
 * eslint-plugin-sfcc-a11y
 *
 * Thin SFCC adapter for eslint-plugin-html-a11y.
 * Re-exports all WCAG accessibility rules from html-a11y and adds:
 *   - ISML sanitizer (preprocessor)
 *   - XML content-asset processor
 *   - SFCC flat/recommended config (ESLint v9 flat config, 4 entries)
 *   - SFCC recommended config (ESLint v8 legacy format, 4 overrides)
 */

const htmlParser = require('@html-eslint/parser');
const htmlA11y = require('eslint-plugin-html-a11y');
const xmlProcessor = require('./lib/processors/xml-content-asset.js');
const { sanitize } = require('./lib/preprocessors/isml-sanitizer.js');
const { EXPR_SENTINEL, CONTENT_SENTINEL } = require('./lib/utils/isml.js');

/** All WCAG rules, re-exported verbatim from html-a11y. */
const rules = htmlA11y.rules;
const { buildRulesFor } = htmlA11y;

/**
 * Machine-readable WCAG map computed from rule meta.
 * Keys are sfcc-a11y/<rule-name>; values are "WCAG <criterion>".
 */
const wcagMap = Object.fromEntries(
  Object.entries(rules)
    .filter(([, r]) => r.meta?.docs?.wcag)
    .map(([name, r]) => [`sfcc-a11y/${name}`, `WCAG ${r.meta.docs.wcag}`]),
);

/**
 * WCAG conformance level map computed from rule meta.
 * Keys are sfcc-a11y/<rule-name>; values are "A", "AA", or "AAA".
 */
const wcagLevelMap = Object.fromEntries(
  Object.entries(rules)
    .filter(([, r]) => r.meta?.docs?.level)
    .map(([name, r]) => [`sfcc-a11y/${name}`, r.meta.docs.level]),
);

function buildRules(config = {}) {
  return buildRulesFor('sfcc-a11y', rules, config);
}

/** All recommended rules (Level A + AA) at "warn" severity. */
const recommendedRules = buildRules();

/** ESLint settings that configure the ISML sentinels for all html-a11y rules. */
const sfccSettings = {
  'html-a11y': {
    dynamicValueMarker: EXPR_SENTINEL,
    dynamicContentMarker: CONTENT_SENTINEL,
  },
};

/**
 * Named ISML sanitizer processor.
 * Replaces ${...} and ISML tags with sentinel strings so @html-eslint/parser
 * can parse ISML templates without errors.
 */
const ismlSanitizerProcessor = {
  meta: { name: 'sfcc-a11y/isml-sanitizer', version: '0.1.0' },
  preprocess(text, filename) {
    return [{ text: sanitize(text), filename: filename + '/__sanitized.html' }];
  },
  postprocess(messages) {
    return messages[0];
  },
  supportsAutofix: false,
};

const plugin = {
  rules,
  processors: {
    '.xml': xmlProcessor,
    'isml-sanitizer': ismlSanitizerProcessor,
  },
};

function buildLegacyConfig(rules) {
  return {
    plugins: ['sfcc-a11y'],
    overrides: [
      { files: ['**/*.isml'], processor: 'sfcc-a11y/isml-sanitizer' },
      { files: ['**/__sanitized.html'], parser: '@html-eslint/parser', settings: sfccSettings, rules },
      { files: ['**/libraries/**/*.xml'], processor: 'sfcc-a11y/.xml' },
      { files: ['**/libraries/**/*.xml/block_*.html'], parser: '@html-eslint/parser', settings: sfccSettings, rules },
    ],
  };
}

// ESLint v9 flat config — 4 entries
// 1. Apply ISML sanitizer (replaces ${...} before parsing)
// 2. Parse sanitized virtual file with rules
// 3. Extract HTML blocks from XML content assets
// 4. Apply rules to extracted HTML blocks
plugin.configs = {
  'flat/recommended': [
    {
      files: ['**/*.isml'],
      plugins: { 'sfcc-a11y': plugin },
      processor: ismlSanitizerProcessor,
    },
    {
      files: ['**/*.isml/__sanitized.html'],
      plugins: { 'sfcc-a11y': plugin },
      languageOptions: { parser: htmlParser },
      settings: sfccSettings,
      rules: recommendedRules,
    },
    {
      files: ['**/libraries/**/*.xml'],
      plugins: { 'sfcc-a11y': plugin },
      processor: xmlProcessor,
    },
    {
      files: ['**/libraries/**/*.xml/block_*.html'],
      plugins: { 'sfcc-a11y': plugin },
      languageOptions: { parser: htmlParser },
      settings: sfccSettings,
      rules: recommendedRules,
    },
  ],

  // ESLint v8 legacy config — used via "plugin:sfcc-a11y/recommended" in .eslintrc.json
  //
  // overrides wire up the processor, parser, and rules for .isml and .xml files so
  // consumers don't need to add them manually. Parser strings are resolved from the
  // project root by ESLint v8, so @html-eslint/parser must be a project-level dep.
  recommended: buildLegacyConfig(recommendedRules),

};

// Level-A config: same 4-entry structure as flat/recommended but with only Level A rules
const levelARules = buildRules({ level: 'A' });
plugin.configs['flat/recommended-a'] = plugin.configs['flat/recommended']
  .map((entry) => (entry.rules ? { ...entry, rules: levelARules } : entry));
plugin.configs['recommended-a'] = buildLegacyConfig(levelARules);

// Error-severity configs: same rules at "error" instead of "warn"
const recommendedErrorRules = buildRules({ severity: 'error' });
plugin.configs['flat/recommended-error'] = plugin.configs['flat/recommended']
  .map((entry) => (entry.rules ? { ...entry, rules: recommendedErrorRules } : entry));
plugin.configs['recommended-error'] = buildLegacyConfig(recommendedErrorRules);

module.exports = plugin;
module.exports.sanitize = sanitize;
module.exports.xmlProcessor = xmlProcessor;
module.exports.wcagMap = wcagMap;
module.exports.wcagLevelMap = wcagLevelMap;
module.exports.buildRules = buildRules;
