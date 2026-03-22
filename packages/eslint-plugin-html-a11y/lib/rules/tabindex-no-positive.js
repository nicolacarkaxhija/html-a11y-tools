/**
 * Rule: tabindex-no-positive
 *
 * Forbids positive tabindex values (tabindex > 0). Positive values override
 * the natural document tab order, creating a confusing experience for keyboard
 * and assistive technology users.
 *
 * WCAG 2.4.3 Focus Order (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/tabindex-no-positive
 */

const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid positive tabindex values (WCAG 2.4.3)',
      wcag: '2.4.3',
      level: 'A',
      recommended: true,
    },
    messages: {
      noPositiveTabindex:
        'tabindex values greater than 0 disrupt the natural focus order. Use 0 or -1 instead.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const tabindexAttr = node.attributes?.find(
          (a) => a.key?.value?.toLowerCase() === 'tabindex',
        );
        if (!tabindexAttr || !tabindexAttr.value) return;

        const value = tabindexAttr.value.value;
        if (isDynamicValue(value, valueMarker)) return;

        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
          context.report({ node: tabindexAttr, messageId: 'noPositiveTabindex' });
        }
      },
    };
  },
};
