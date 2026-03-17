/**
 * Rule: lang-value
 *
 * The lang attribute on <html> must be a valid BCP 47 language tag.
 * An invalid value means screen readers may select the wrong voice profile.
 *
 * WCAG 3.1.1 Language of Page (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/lang
 */

const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

const BCP47_RE = /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/;

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a valid BCP 47 language tag on <html lang> (WCAG 3.1.1)',
      wcag: '3.1.1',
      level: 'A',
      recommended: true,
    },
    messages: {
      invalidLang:
        '"{{value}}" is not a valid BCP 47 language tag. Use a tag like "en" or "fr-CA".',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'html') return;

        const langAttr = node.attributes?.find((a) => a.key?.value?.toLowerCase() === 'lang');
        if (!langAttr) return;

        const value = langAttr.value?.value;
        if (!value || isDynamicValue(value, valueMarker) || value.trim() === '') return;

        if (!BCP47_RE.test(value.trim())) {
          context.report({ node: langAttr, messageId: 'invalidLang', data: { value } });
        }
      },
    };
  },
};
