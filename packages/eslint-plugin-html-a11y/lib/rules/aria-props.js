/**
 * Rule: aria-props
 *
 * Requires all aria-* attribute names to be valid ARIA properties or states.
 * Misspelled or non-existent ARIA attributes are silently ignored by browsers
 * and assistive technology.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/aria-props
 */

import { isValidAriaProp } from '../utils/aria.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid aria-* attribute names (WCAG 4.1.2)',
      wcag: '4.1.2',
      recommended: true,
    },
    messages: {
      invalidProp:
        '"{{prop}}" is not a valid ARIA attribute. Check the ARIA specification for the correct name.',
    },
    schema: [],
  },

  create(context) {
    return {
      Attribute(node) {
        const name = node.key?.value;
        /* c8 ignore next -- @html-eslint/parser always produces string key values */
        if (typeof name !== 'string') return;
        if (!name.startsWith('aria-')) return;
        if (!isValidAriaProp(name)) {
          context.report({ node, messageId: 'invalidProp', data: { prop: name } });
        }
      },
    };
  },
};
