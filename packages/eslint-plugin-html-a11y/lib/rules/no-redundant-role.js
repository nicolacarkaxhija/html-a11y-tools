/**
 * Rule: no-redundant-role
 *
 * Flags elements that have an explicit `role` attribute that duplicates the
 * element's own implicit ARIA role. The redundant role adds noise without
 * adding any semantic information.
 *
 * Example: <nav role="navigation"> — <nav> already implies role="navigation".
 *
 * Context-dependent roles:
 *   <a href="..."> → "link"; <a> (no href) → "generic" (role="link" is NOT redundant)
 *   <input type="checkbox"> → "checkbox"; <input type="text"> → "textbox"; etc.
 *
 * WCAG 4.1.2 Name, Role, Value (Level AA — best practice)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-redundant-roles
 */

import { getAttr, getImplicitRole } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/**
 * Maps <input type> to its implicit ARIA role.
 * Types not in this map have no clear implicit role and are skipped.
 */
const INPUT_TYPE_ROLES = new Map([
  ['text', 'textbox'],
  ['email', 'textbox'],
  ['url', 'textbox'],
  ['tel', 'textbox'],
  ['search', 'searchbox'],
  ['number', 'spinbutton'],
  ['range', 'slider'],
  ['checkbox', 'checkbox'],
  ['radio', 'radio'],
  ['button', 'button'],
  ['submit', 'button'],
  ['reset', 'button'],
  ['image', 'button'],
]);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Disallow redundant ARIA roles that duplicate the element's implicit role (WCAG 4.1.2)",
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      redundantRole:
        '<{{tag}}> already has an implicit role of "{{role}}". The explicit role="{{role}}" is redundant.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const explicitRole = getAttr(node, 'role');
        if (!explicitRole || explicitRole === true) return;
        if (isDynamicValue(explicitRole, valueMarker)) return;

        const tagName = node.name.toLowerCase();
        let implicitRole;

        if (tagName === 'a') {
          // <a> without href has implicit role "generic", not "link"
          if (getAttr(node, 'href') === undefined) return;
          implicitRole = 'link';
        } else if (tagName === 'input') {
          const type = (getAttr(node, 'type') ?? 'text').toLowerCase();
          implicitRole = INPUT_TYPE_ROLES.get(type);
          if (!implicitRole) return;
        } else {
          implicitRole = getImplicitRole(tagName);
          if (!implicitRole) return;
        }

        if (explicitRole.trim().toLowerCase() === implicitRole) {
          context.report({
            node,
            messageId: 'redundantRole',
            data: { tag: node.name, role: implicitRole },
          });
        }
      },
    };
  },
};
