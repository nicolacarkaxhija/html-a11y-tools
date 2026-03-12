/**
 * Rule: button-name
 *
 * Requires every <button> element to have a discernible accessible name. Without
 * a name, screen readers announce "button" with no context, making the control
 * impossible to understand.
 *
 * Acceptable sources of an accessible name:
 *   - Non-empty text content (including nested elements)
 *   - aria-label attribute
 *   - aria-labelledby attribute
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/interactive-supports-focus
 */

import { hasVisibleTextContent, hasAriaLabel, isAriaHidden } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require buttons to have a discernible accessible name (WCAG 4.1.2)',
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      missingName:
        '<button> has no accessible name. Add text content, aria-label, or aria-labelledby.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker, contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'button') return;
        if (isAriaHidden(node)) return;

        // Dynamic aria-label counts as a valid name
        const ariaLabelAttr = node.attributes?.find(
          (a) => a.key?.value?.toLowerCase() === 'aria-label',
        );
        if (ariaLabelAttr?.value && isDynamicValue(ariaLabelAttr.value.value, valueMarker)) return;

        if (hasAriaLabel(node) || hasVisibleTextContent(node, contentMarker)) return;

        context.report({ node, messageId: 'missingName' });
      },
    };
  },
};
