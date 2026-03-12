/**
 * Rule: aria-role
 *
 * Requires the `role` attribute to contain a valid, non-abstract ARIA role.
 * Invalid or abstract roles are ignored by assistive technology, meaning the
 * element is announced with no semantic meaning.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/aria-role
 */

import { isValidAriaRole, isAbstractRole } from '../utils/aria.js';
import { getAttr } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid ARIA role values (WCAG 4.1.2)',
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      invalidRole: 'role="{{role}}" is not a valid ARIA role.',
      abstractRole:
        'role="{{role}}" is an abstract ARIA role and must not be used on HTML elements.',
      emptyRole: 'role="" has no value. Remove the attribute or provide a valid role.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const role = getAttr(node, 'role');
        if (role === undefined) return;
        if (role === true) return;
        if (isDynamicValue(role, valueMarker)) return;

        if (role.trim() === '') {
          context.report({ node, messageId: 'emptyRole', data: { role } });
          return;
        }

        // ARIA allows multiple space-separated roles; check the first valid one
        const roles = role.trim().split(/\s+/);
        for (const r of roles) {
          if (isAbstractRole(r)) {
            context.report({ node, messageId: 'abstractRole', data: { role: r } });
            return;
          }
          if (!isValidAriaRole(r)) {
            context.report({ node, messageId: 'invalidRole', data: { role: r } });
            return;
          }
        }
      },
    };
  },
};
