/**
 * Rule: aria-hidden-on-focusable
 *
 * aria-hidden="true" must not be applied to a natively focusable element or any
 * element with a non-negative tabindex. Screen readers would skip the element
 * yet keyboard users can still reach it, creating a confusing experience.
 *
 * Exceptions:
 *  - <a> without href: not keyboard-reachable, so aria-hidden is harmless.
 *  - <input type="hidden">: removed from both tab order and the accessibility tree.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-aria-hidden-on-focusable
 */

import { getAttr, isNativelyFocusable } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow aria-hidden="true" on focusable elements (WCAG 4.1.2)',
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      ariaHiddenOnFocusable:
        'aria-hidden="true" must not be used on a focusable element. Remove aria-hidden or make the element non-focusable.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const ariaHidden = getAttr(node, 'aria-hidden');
        if (ariaHidden !== 'true') return;

        const tag = node.name.toLowerCase();

        const tabindex = getAttr(node, 'tabindex');
        if (tabindex && tabindex !== true && !isDynamicValue(tabindex, valueMarker)) {
          const idx = parseInt(tabindex, 10);
          if (!isNaN(idx) && idx >= 0) {
            context.report({ node, messageId: 'ariaHiddenOnFocusable' });
            return;
          }
        }

        if (!isNativelyFocusable(tag)) return;

        // <a> without href is not keyboard-reachable
        if (tag === 'a') {
          const href = getAttr(node, 'href');
          if (href === undefined) return;
        }

        // <input type="hidden"> is removed from the tab order
        if (tag === 'input') {
          const type = getAttr(node, 'type');
          if (type && type !== true && type.toLowerCase() === 'hidden') return;
        }

        context.report({ node, messageId: 'ariaHiddenOnFocusable' });
      },
    };
  },
};
