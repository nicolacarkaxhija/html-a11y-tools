/**
 * Rule: aria-proptypes
 *
 * Requires aria-* attribute values to conform to their expected ARIA type.
 * For example, aria-hidden must be "true" or "false", and aria-sort must be
 * one of the allowed token values.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/aria-proptypes
 */

const { getAriaPropType, isValidAriaProp } = require('../utils/aria.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** Valid values for boolean ARIA attributes. */
const BOOLEAN_VALUES = new Set(['true', 'false']);

/**
 * Returns true if the value is valid for the given ARIA type definition.
 * @param {{ type: string, values?: string[] }} typeDef
 * @param {string} value
 * @returns {boolean}
 */
function isValidValue(typeDef, value) {
  switch (typeDef.type) {
    case 'boolean':
      return BOOLEAN_VALUES.has(value.toLowerCase());
    case 'tristate':
      return BOOLEAN_VALUES.has(value.toLowerCase()) || value.toLowerCase() === 'mixed';
    case 'token':
      // aria-query may use boolean primitives (true/false) as token values for attributes
      // like aria-haspopup; coerce to string for comparison against HTML attribute values.
      return (
        Array.isArray(typeDef.values) &&
        typeDef.values.some((v) => String(v).toLowerCase() === value.toLowerCase())
      );
    case 'tokenlist':
      return (
        Array.isArray(typeDef.values) &&
        value
          .trim()
          .split(/\s+/)
          .every((t) => typeDef.values.some((v) => String(v).toLowerCase() === t.toLowerCase()))
      );
    case 'integer':
      return Number.isInteger(Number(value)) && !isNaN(Number(value));
    case 'number':
      return !isNaN(Number(value));
    // string, id, idlist, uri — any value is acceptable for static analysis
    default:
      return true;
  }
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid aria-* attribute values (WCAG 4.1.2)',
      wcag: '4.1.2',
      level: 'A',
      recommended: true,
    },
    messages: {
      invalidType: '"{{value}}" is not a valid value for {{prop}}. Expected type: {{type}}.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Attribute(node) {
        const name = node.key?.value;
        if (typeof name !== 'string' || !name.startsWith('aria-')) return;
        if (!isValidAriaProp(name)) return; // defer to aria-props rule

        const value = node.value?.value;
        if (value === undefined) return; // boolean attribute
        if (isDynamicValue(value, valueMarker)) return;

        const typeDef = getAriaPropType(name);
        /* c8 ignore next -- aria.has() above guarantees aria.get() returns a value */
        if (!typeDef) return;

        if (!isValidValue(typeDef, value)) {
          context.report({
            node,
            messageId: 'invalidType',
            data: { prop: name, value, type: typeDef.type },
          });
        }
      },
    };
  },
};
