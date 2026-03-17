/**
 * Rule: role-supports-aria-props
 *
 * ARIA attributes (aria-*) used on an element must be supported by the element's
 * explicit ARIA role. Using unsupported attributes may confuse assistive technology
 * that maps only the properties defined for that role.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/role-supports-aria-props
 */

const { getAttr } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');
const { isValidAriaRole, getSupportedPropsForRole } = require('../utils/aria.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require aria-* attributes to be supported by the element's ARIA role (WCAG 4.1.2)",
      wcag: '4.1.2',
      level: 'A',
      recommended: true,
    },
    messages: {
      unsupportedProp:
        'aria-{{prop}} is not supported by role "{{role}}". Remove the attribute or choose a role that supports it.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const role = getAttr(node, 'role');
        if (!role || role === true || isDynamicValue(role, valueMarker)) return;

        const firstRole = role.trim().split(/\s+/)[0];
        if (!isValidAriaRole(firstRole)) return;

        const supported = getSupportedPropsForRole(firstRole);

        /* c8 ignore next */
        for (const attr of node.attributes ?? []) {
          const key = attr.key?.value;
          if (!key || !key.startsWith('aria-')) continue;

          const value = attr.value?.value;
          if (isDynamicValue(value, valueMarker)) continue;

          if (!supported.includes(key)) {
            context.report({
              node: attr,
              messageId: 'unsupportedProp',
              data: { prop: key.slice('aria-'.length), role: firstRole },
            });
          }
        }
      },
    };
  },
};
