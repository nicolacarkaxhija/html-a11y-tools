/**
 * Rule: label
 *
 * Requires form controls (<input>, <select>, <textarea>) to have an accessible
 * label. Without a label, screen reader users cannot understand the purpose
 * of the control.
 *
 * Acceptable label sources (same-file analysis only):
 *   1. A <label> element wrapping the control
 *   2. A <label for="X"> matched to the control's id="X"
 *   3. aria-label attribute on the control
 *   4. aria-labelledby attribute on the control (idref — presence assumed valid)
 *
 * Note: Cross-file label/input associations (via <isinclude>) cannot be
 * detected by static analysis. If a label is in a parent template, this rule
 * will report a false positive. Suppress the error with an ESLint disable
 * comment when that is the case.
 *
 * WCAG 1.3.1 Info and Relationships (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/label-has-associated-control,
 *              eslint-plugin-vuejs-accessibility/form-control-has-label
 */

import { getAttr, hasAriaLabel } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** Input types that are self-labelling or exempt from label requirements. */
const EXEMPT_INPUT_TYPES = new Set(['hidden', 'submit', 'reset', 'button', 'image']);

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require form controls to have an accessible label (WCAG 1.3.1)',
      wcag: '1.3.1',
      recommended: true,
    },
    messages: {
      missingLabel:
        '{{tag}} has no accessible label. Add a <label for="...">, wrap it in a <label>, or add aria-label / aria-labelledby.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);

    /**
     * Collects all <label> nodes found in the document, keyed by their `for` value.
     * Also records labels that wrap a control directly (no for/id pair needed).
     * @type {{ forLabels: Map<string, true>, wrappingLabels: Set<object> }}
     */
    const labelState = { forLabels: new Map(), wrappingLabels: new Set() };

    /** All form control nodes seen before analysis — checked against labels in Program:exit. */
    const controls = [];

    return {
      'Tag:exit'(node) {
        const name = node.name.toLowerCase();

        if (name === 'label') {
          const forAttr = getAttr(node, 'for');
          if (forAttr && forAttr !== true && !isDynamicValue(forAttr, valueMarker)) {
            labelState.forLabels.set(forAttr, true);
          }
          labelState.wrappingLabels.add(node);
          return;
        }

        if (name === 'input' || name === 'select' || name === 'textarea') {
          controls.push(node);
        }
      },

      'Program:exit'() {
        for (const node of controls) {
          const name = node.name.toLowerCase();

          if (name === 'input') {
            const type = (getAttr(node, 'type') || 'text').toLowerCase();
            if (EXEMPT_INPUT_TYPES.has(type)) continue;
          }

          const ariaLabelAttr = node.attributes?.find(
            (a) => a.key?.value?.toLowerCase() === 'aria-label',
          );
          if (ariaLabelAttr?.value && isDynamicValue(ariaLabelAttr.value.value, valueMarker)) continue;
          if (hasAriaLabel(node)) continue;

          // Dynamic id — cannot validate for/id association; skip
          const id = getAttr(node, 'id');
          if (id && isDynamicValue(id, valueMarker)) continue;

          if (id && labelState.forLabels.has(id)) continue;

          if (isWrappedByLabel(node)) continue;

          context.report({
            node,
            messageId: 'missingLabel',
            data: { tag: `<${name}>` },
          });
        }
      },
    };

    /**
     * Returns true if the node is a descendant of a <label> element.
     * @param {object} node
     * @returns {boolean}
     */
    function isWrappedByLabel(node) {
      let current = node.parent;
      while (current) {
        if (current.type === 'Tag' && current.name?.toLowerCase() === 'label') {
          return true;
        }
        current = current.parent;
      }
      return false;
    }
  },
};
