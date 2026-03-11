/**
 * Rule: object-alt
 *
 * <object> elements must have an accessible text alternative so that users of
 * assistive technology can understand what the embedded content represents.
 *
 * WCAG 1.1.1 Non-text Content (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/object-has-accessible-text
 */

import { getAttr, hasAriaLabel, hasVisibleTextContent } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require accessible text alternative on <object> (WCAG 1.1.1)',
      wcag: '1.1.1',
      recommended: true,
    },
    messages: {
      missingAlt:
        '<object> must have an accessible label: add aria-label, aria-labelledby, title, or text content inside the element.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker, contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'object') return;

        if (hasAriaLabel(node)) return;

        const title = getAttr(node, 'title');
        if (title && title !== true) {
          if (isDynamicValue(title, valueMarker)) return;
          if (title.trim() !== '') return;
        }

        if (hasVisibleTextContent(node, contentMarker)) return;

        context.report({ node, messageId: 'missingAlt' });
      },
    };
  },
};
