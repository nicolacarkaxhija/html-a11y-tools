/**
 * Rule: scope-attr-valid
 *
 * Requires the `scope` attribute on <th> elements to use a valid value.
 * An invalid scope value breaks the programmatic association between
 * header cells and data cells in tables, making the table inaccessible
 * to screen reader users.
 *
 * Valid values: col, row, colgroup, rowgroup
 *
 * WCAG 1.3.1 Info and Relationships (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/scope
 */

import { getAttr } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

const VALID_SCOPE_VALUES = new Set(['col', 'row', 'colgroup', 'rowgroup']);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid scope attribute values on <th> elements (WCAG 1.3.1)',
      wcag: '1.3.1',
      recommended: true,
    },
    messages: {
      invalidScope:
        'Invalid scope value "{{value}}" on <th>. Must be one of: col, row, colgroup, rowgroup.',
      booleanScope:
        'The scope attribute on <th> must have a value. Must be one of: col, row, colgroup, rowgroup.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'th') return;

        const scope = getAttr(node, 'scope');
        if (scope === undefined) return;

        if (scope === true) {
          context.report({ node, messageId: 'booleanScope' });
          return;
        }

        if (isDynamicValue(scope, valueMarker)) return;

        if (!VALID_SCOPE_VALUES.has(scope.toLowerCase())) {
          context.report({ node, messageId: 'invalidScope', data: { value: scope } });
        }
      },
    };
  },
};
