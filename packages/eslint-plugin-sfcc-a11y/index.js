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

/** Numeric order for level comparison. */
const LEVEL_ORDER = { A: 1, AA: 2, AAA: 3 };

/**
 * Build an ESLint rules object filtered by WCAG level with optional severity overrides.
 *
 * @param {object} [config]
 * @param {'A'|'AA'|'AAA'} [config.level='AA'] Ceiling level — rules at or below this level are included.
 * @param {'warn'|'error'} [config.severity='warn'] Global severity for all included rules.
 * @param {Record<string,string|number>} [config.rules={}] Per-rule overrides using UNPREFIXED names,
 *   e.g. `{ 'img-alt': 'error', 'html-has-lang': 'off' }`. Overrides the global severity.
 * @returns {Record<string,string|number>}
 */
function buildRules(config = {}) {
  const maxLevel = LEVEL_ORDER[config.level] ?? LEVEL_ORDER['AA'];
  const globalSeverity = config.severity ?? 'warn';
  const overrides = config.rules ?? {};
  const result = {};
  for (const [name, rule] of Object.entries(rules)) {
    const ruleLevel = rule.meta?.docs?.level;
    /* c8 ignore next -- defensive fallback; all registered rules have level set */
    const levelNum = LEVEL_ORDER[ruleLevel] ?? 1;
    if (levelNum > maxLevel) continue;
    result[`sfcc-a11y/${name}`] = overrides[name] ?? globalSeverity;
  }
  return result;
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
  // Rules are registered at the ROOT level (not inside overrides) because ESLint v8
  // does not reliably cascade overrides from shared configs into projects that have
  // their own overrides block. Rules only fire when @html-eslint/parser produces a
  // HTML AST with Tag/Attribute nodes, so they are harmless on JS/TS files.
  //
  // The processor/parser/settings overrides MUST be added directly to the consuming
  // project's .eslintrc.json — they cannot be reliably injected via a shared config.
  recommended: {
    plugins: ['sfcc-a11y'],
    settings: sfccSettings,
    rules: recommendedRules,
  },

};

// Level-A config: same 4-entry structure as flat/recommended but with only Level A rules
const levelARules = buildRules({ level: 'A' });
plugin.configs['flat/recommended-a'] = plugin.configs['flat/recommended']
  .map((entry) => (entry.rules ? { ...entry, rules: levelARules } : entry));
plugin.configs['recommended-a'] = {
  ...plugin.configs.recommended,
  rules: levelARules,
};

module.exports = plugin;
module.exports.sanitize = sanitize;
module.exports.xmlProcessor = xmlProcessor;
module.exports.wcagMap = wcagMap;
module.exports.wcagLevelMap = wcagLevelMap;
module.exports.buildRules = buildRules;
