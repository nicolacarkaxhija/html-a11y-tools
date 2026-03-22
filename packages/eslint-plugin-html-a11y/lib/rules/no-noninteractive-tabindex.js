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

const { getAttr, isInteractiveRole, isNativelyFocusable } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/**
 * Composite widget roles that legitimately require tabindex="0" per the ARIA
 * Authoring Practices Guide. These are non-interactive container roles that
 * need to receive focus as part of a keyboard navigation pattern (e.g. a
 * <div role="tabpanel" tabindex="0"> must be focusable when its tab is activated).
 */
const COMPOSITE_WIDGET_ROLES = new Set(['grid', 'tabpanel', 'tree', 'treegrid']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow tabindex >= 0 on non-interactive elements (WCAG 2.1.1)',
      wcag: '2.1.1',
      level: 'A',
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
          // Composite widget roles need tabindex="0" to receive focus per ARIA APG
          if (COMPOSITE_WIDGET_ROLES.has(firstRole)) return;
        }

        context.report({ node, messageId: 'noninteractiveTabindex' });
      },
    };
  },
};
