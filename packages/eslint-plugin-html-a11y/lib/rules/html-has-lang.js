/**
 * Rule: html-has-lang
 *
 * Requires the <html> element to have a non-empty lang attribute. Without a
 * language declaration, screen readers cannot choose the correct voice profile,
 * and text-to-speech tools may mispronounce content.
 *
 * WCAG 3.1.1 Language of Page (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/html-has-lang
 */

const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require lang attribute on <html> element (WCAG 3.1.1)',
      wcag: '3.1.1',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingLang:
        '<html> element must have a lang attribute so screen readers can select the correct language.',
      emptyLang:
        '<html lang=""> must have a non-empty value. Use a valid BCP 47 language tag (e.g. "en", "fr-CA").',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'html') return;

        const langAttr = node.attributes?.find((a) => a.key?.value?.toLowerCase() === 'lang');

        if (!langAttr) {
          context.report({ node, messageId: 'missingLang' });
          return;
        }

        const value = langAttr.value?.value;
        if (isDynamicValue(value, valueMarker)) return;

        if (!value || value.trim() === '') {
          context.report({ node: langAttr, messageId: 'emptyLang' });
        }
      },
    };
  },
};
