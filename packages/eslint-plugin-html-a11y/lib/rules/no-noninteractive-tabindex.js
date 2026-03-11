/**
 * Rule: no-noninteractive-tabindex
 *
 * tabindex must not be set to a value >= 0 on elements with a non-interactive
 * ARIA role. Adding tabindex to a non-interactive element (e.g. role="article")
 * creates a stop in the tab order without providing the expected keyboard
 * interaction, confusing keyboard and screen-reader users.
 *
 * tabindex="-1" is allowed: it enables programmatic focus without entering the tab order.
 *
 * WCAG 2.1.1 Keyboard (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-noninteractive-tabindex
 */

import { getAttr, isInteractiveRole, isNativelyFocusable } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow tabindex >= 0 on non-interactive elements (WCAG 2.1.1)',
      wcag: '2.1.1',
      recommended: true,
    },
    messages: {
      noninteractiveTabindex:
        'tabindex must not be >= 0 on a non-interactive element. Use tabindex="-1" or assign an interactive ARIA role.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const tabindex = getAttr(node, 'tabindex');
        if (tabindex === undefined || tabindex === true) return;
        if (isDynamicValue(tabindex, valueMarker)) return;

        const idx = parseInt(tabindex, 10);
        if (isNaN(idx) || idx < 0) return;

        const tag = node.name.toLowerCase();
        if (isNativelyFocusable(tag)) return;

        const role = getAttr(node, 'role');
        if (role && role !== true) {
          if (isDynamicValue(role, valueMarker)) return;
          const firstRole = role.trim().split(/\s+/)[0];
          if (isInteractiveRole(firstRole)) return;
        }

        context.report({ node, messageId: 'noninteractiveTabindex' });
      },
    };
  },
};
