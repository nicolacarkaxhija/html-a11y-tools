'use strict';

const htmlParser = require('@html-eslint/parser');

const anchorIsValid = require('./lib/rules/anchor-is-valid.js');
const audioHasTranscript = require('./lib/rules/audio-has-transcript.js');
const fieldsetHasLegend = require('./lib/rules/fieldset-has-legend.js');
const svgImgAlt = require('./lib/rules/svg-img-alt.js');
const videoHasDescription = require('./lib/rules/video-has-description.js');
const ariaHiddenOnFocusable = require('./lib/rules/aria-hidden-on-focusable.js');
const ariaProps = require('./lib/rules/aria-props.js');
const ariaProptypes = require('./lib/rules/aria-proptypes.js');
const ariaRequiredAttr = require('./lib/rules/aria-required-attr.js');
const ariaRole = require('./lib/rules/aria-role.js');
const autocompleteValid = require('./lib/rules/autocomplete-valid.js');
const buttonName = require('./lib/rules/button-name.js');
const headingHasContent = require('./lib/rules/heading-has-content.js');
const htmlHasLang = require('./lib/rules/html-has-lang.js');
const imgAlt = require('./lib/rules/img-alt.js');
const interactiveSupportsFocus = require('./lib/rules/interactive-supports-focus.js');
const label = require('./lib/rules/label.js');
const langValue = require('./lib/rules/lang-value.js');
const linkName = require('./lib/rules/link-name.js');
const mediaHasCaption = require('./lib/rules/media-has-caption.js');
const noAccessKey = require('./lib/rules/no-access-key.js');
const noAutofocus = require('./lib/rules/no-autofocus.js');
const noDistractingElements = require('./lib/rules/no-distracting-elements.js');
const noNoninteractiveTabindex = require('./lib/rules/no-noninteractive-tabindex.js');
const noRedundantRole = require('./lib/rules/no-redundant-role.js');
const objectAlt = require('./lib/rules/object-alt.js');
const roleSupportsAriaProps = require('./lib/rules/role-supports-aria-props.js');
const scopeAttrValid = require('./lib/rules/scope-attr-valid.js');
const tabindexNoPositive = require('./lib/rules/tabindex-no-positive.js');

const rules = {
  'anchor-is-valid': anchorIsValid,
  'audio-has-transcript': audioHasTranscript,
  'aria-hidden-on-focusable': ariaHiddenOnFocusable,
  'aria-props': ariaProps,
  'aria-proptypes': ariaProptypes,
  'aria-required-attr': ariaRequiredAttr,
  'aria-role': ariaRole,
  'autocomplete-valid': autocompleteValid,
  'button-name': buttonName,
  'heading-has-content': headingHasContent,
  'html-has-lang': htmlHasLang,
  'img-alt': imgAlt,
  'interactive-supports-focus': interactiveSupportsFocus,
  label,
  'lang-value': langValue,
  'link-name': linkName,
  'media-has-caption': mediaHasCaption,
  'no-access-key': noAccessKey,
  'no-autofocus': noAutofocus,
  'no-distracting-elements': noDistractingElements,
  'no-noninteractive-tabindex': noNoninteractiveTabindex,
  'no-redundant-role': noRedundantRole,
  'object-alt': objectAlt,
  'role-supports-aria-props': roleSupportsAriaProps,
  'scope-attr-valid': scopeAttrValid,
  'svg-img-alt': svgImgAlt,
  'tabindex-no-positive': tabindexNoPositive,
  'video-has-description': videoHasDescription,
  'fieldset-has-legend': fieldsetHasLegend,
};

/** Numeric order for WCAG conformance level comparison. */
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
  if (config.level !== undefined && !(config.level in LEVEL_ORDER)) {
    throw new Error(
      `buildRules(): invalid level "${config.level}". Must be one of: A, AA, AAA.`,
    );
  }
  const overrides = config.rules ?? {};
  const prefixed = Object.keys(overrides).find((k) => k.startsWith('html-a11y/'));
  if (prefixed) {
    throw new Error(
      `buildRules(): rule names must not include the plugin prefix. Use "${prefixed.replace('html-a11y/', '')}" instead of "${prefixed}".`,
    );
  }
  const maxLevel = LEVEL_ORDER[config.level] ?? LEVEL_ORDER['AA'];
  const globalSeverity = config.severity ?? 'warn';
  const result = {};
  for (const [name, rule] of Object.entries(rules)) {
    const ruleLevel = rule.meta?.docs?.level;
    /* c8 ignore next -- defensive fallback; all registered rules have level set */
    const levelNum = LEVEL_ORDER[ruleLevel] ?? 1;
    if (levelNum > maxLevel) continue;
    result[`html-a11y/${name}`] = overrides[name] ?? globalSeverity;
  }
  return result;
}

const recommendedRules = buildRules();

const plugin = { rules };

plugin.configs = {
  recommended: [
    {
      files: ['**/*.html'],
      plugins: { 'html-a11y': plugin },
      languageOptions: { parser: htmlParser },
      rules: recommendedRules,
    },
  ],
};

module.exports = plugin;
module.exports.buildRules = buildRules;
