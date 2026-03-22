'use strict';

/**
 * Rule: fieldset-has-legend
 *
 * Requires <fieldset> elements to have a <legend> child with non-empty content.
 * The legend labels the group of form controls for screen reader users who
 * cannot infer the group's purpose from surrounding visual context.
 *
 * Exempt when role="presentation" or role="none" marks the fieldset as
 * decorative, or when aria-hidden="true" hides it from assistive technology.
 *
 * WCAG 1.3.1 Info and Relationships (Level A)
 */

const { getAttr, isAriaHidden, hasVisibleTextContent } = require('../utils/dom.js');
const { getMarkers } = require('../utils/dynamic.js');

const DECORATIVE_ROLES = new Set(['presentation', 'none']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require <fieldset> elements to have a non-empty <legend> (WCAG 1.3.1)',
      wcag: '1.3.1',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingLegend:
        '<fieldset> must have a <legend> child with descriptive text to label the group of form controls.',
      emptyLegend:
        '<legend> is empty. Provide descriptive text to identify the form group.',
    },
    schema: [],
  },

  create(context) {
    const { contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'fieldset') return;
        if (isAriaHidden(node)) return;

        // role="presentation" / role="none" marks the fieldset as decorative
        const role = getAttr(node, 'role');
        if (role && role !== true && DECORATIVE_ROLES.has(role.trim().toLowerCase())) return;

        const legend =
          Array.isArray(node.children) &&
          node.children.find(
            (child) => child.type === 'Tag' && child.name?.toLowerCase() === 'legend',
          );

        if (!legend) {
          context.report({ node, messageId: 'missingLegend' });
          return;
        }

        if (!hasVisibleTextContent(legend, contentMarker)) {
          context.report({ node: legend, messageId: 'emptyLegend' });
        }
      },
    };
  },
};
