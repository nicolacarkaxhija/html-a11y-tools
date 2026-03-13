/**
 * eslint-plugin-sfcc-a11y
 *
 * Thin SFCC adapter for eslint-plugin-html-a11y.
 * Re-exports all 25 WCAG accessibility rules from html-a11y and adds:
 *   - ISML sanitizer (preprocessor)
 *   - XML content-asset processor
 *   - SFCC flat/recommended config with dynamic sentinel settings
 */

import htmlParser from '@html-eslint/parser';
import htmlA11y from 'eslint-plugin-html-a11y';
import _xmlProcessor from './lib/processors/xml-content-asset.js';
import { sanitize as _sanitize } from './lib/preprocessors/isml-sanitizer.js';
import { EXPR_SENTINEL, CONTENT_SENTINEL } from './lib/utils/isml.js';

export const sanitize = _sanitize;
export const xmlProcessor = _xmlProcessor;

/** All 25 WCAG rules, re-exported verbatim from html-a11y. */
export const rules = htmlA11y.rules;

/**
 * Machine-readable WCAG map computed from rule meta.
 * Keys are sfcc-a11y/<rule-name>; values are "WCAG <criterion>".
 */
export const wcagMap = Object.fromEntries(
  Object.entries(rules)
    .filter(([, r]) => r.meta?.docs?.wcag)
    .map(([name, r]) => [`sfcc-a11y/${name}`, `WCAG ${r.meta.docs.wcag}`]),
);

/** All recommended rules set to "warn" under the sfcc-a11y/ prefix. */
const recommendedRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`sfcc-a11y/${name}`, 'warn']),
);

/** ESLint settings that configure the ISML sentinels for all html-a11y rules. */
const sfccSettings = {
  'html-a11y': {
    dynamicValueMarker: EXPR_SENTINEL,
    dynamicContentMarker: CONTENT_SENTINEL,
  },
};

const plugin = { rules, processors: { '.xml': xmlProcessor } };

plugin.configs = {
  'flat/recommended': [
    {
      files: ['**/*.isml'],
      plugins: { 'sfcc-a11y': plugin },
      languageOptions: { parser: htmlParser },
      settings: sfccSettings,
      rules: recommendedRules,
    },
    {
      files: ['**/libraries/**/*.xml'],
      plugins: { 'sfcc-a11y': plugin },
      processor: xmlProcessor,
      settings: sfccSettings,
      rules: recommendedRules,
    },
  ],
};

export default plugin;
