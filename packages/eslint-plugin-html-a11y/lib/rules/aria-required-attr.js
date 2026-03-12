/**
 * Rule: aria-required-attr
 *
 * Requires that elements with explicit ARIA roles include all mandatory ARIA
 * attributes for that role. Missing required attributes mean the role cannot
 * communicate its current state to assistive technology.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/role-has-required-aria-props
 */

import { getRequiredPropsForRole } from '../utils/aria.js';
import { getAttr } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: "Require mandatory ARIA attributes for the element's role (WCAG 4.1.2)",
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      missingRequiredAttr: 'role="{{role}}" requires the {{missing}} attribute(s) to be present.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const role = getAttr(node, 'role');
        if (!role || role === true || isDynamicValue(role, valueMarker)) return;

        const primaryRole = role.trim().split(/\s+/)[0];
        const required = getRequiredPropsForRole(primaryRole);
        if (required.length === 0) return;

        const missing = required.filter((prop) => {
          const val = getAttr(node, prop);
          if (val === undefined) return true;
          // Dynamic value — assume the required attr is present
          if (typeof val === 'string' && isDynamicValue(val, valueMarker)) return false;
          return false;
        });

        if (missing.length > 0) {
          context.report({
            node,
            messageId: 'missingRequiredAttr',
            data: { role: primaryRole, missing: missing.join(', ') },
          });
        }
      },
    };
  },
};
