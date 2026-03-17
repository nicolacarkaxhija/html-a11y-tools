/**
 * Rule: no-autofocus
 *
 * Disallows the `autofocus` attribute. Auto-focusing an element on page load
 * disrupts the natural focus flow and can disorient users of screen readers
 * and keyboard navigation by moving focus unexpectedly.
 *
 * Related to: WCAG 2.4.3 Focus Order (Level A), WCAG 3.2.1 On Focus (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-autofocus
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow autofocus attribute — it disrupts assistive technology focus management (WCAG 2.4.3)',
      wcag: '2.4.3',
      level: 'A',
      recommended: true,
    },
    messages: {
      noAutofocus:
        'Avoid using the autofocus attribute. It moves focus unexpectedly and can disorient keyboard and screen reader users.',
    },
    schema: [],
  },

  create(context) {
    return {
      Attribute(node) {
        /* c8 ignore next -- @html-eslint/parser always produces string key values */
        if (typeof node.key?.value !== 'string') return;
        if (node.key.value.toLowerCase() === 'autofocus') {
          context.report({ node, messageId: 'noAutofocus' });
        }
      },
    };
  },
};
