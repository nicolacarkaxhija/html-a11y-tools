/**
 * Rule: heading-has-content
 *
 * Requires all heading elements (<h1>–<h6>) to have non-empty text content.
 * Empty headings confuse screen reader users who rely on headings for page
 * navigation.
 *
 * WCAG 2.4.6 Headings and Labels (Level AA)
 *
 * Inspired by: eslint-plugin-jsx-a11y/heading-has-content
 */

const { hasVisibleTextContent, isAriaHidden } = require('../utils/dom.js');
const { getMarkers } = require('../utils/dynamic.js');

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require heading elements to have non-empty content (WCAG 2.4.6)',
      wcag: '2.4.6',
      level: 'AA',
      recommended: true,
    },
    messages: {
      emptyHeading:
        'Heading element has no content. Screen reader users rely on headings for navigation.',
    },
    schema: [],
  },

  create(context) {
    const { contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (!HEADING_TAGS.has(node.name.toLowerCase())) return;
        if (isAriaHidden(node)) return;
        if (!hasVisibleTextContent(node, contentMarker)) {
          context.report({ node, messageId: 'emptyHeading' });
        }
      },
    };
  },
};
