/**
 * Rule: no-distracting-elements
 *
 * Forbids <marquee> and <blink> elements, which automatically move or flash
 * content and cannot be paused by the user.
 *
 * WCAG 2.2.2 Pause, Stop, Hide (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-distracting-elements
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid <marquee> and <blink> elements (WCAG 2.2.2)',
      wcag: '2.2.2',
      level: 'A',
      recommended: true,
    },
    messages: {
      noMarquee:
        '<marquee> causes content to scroll automatically and cannot be paused by the user. Use CSS animations with prefers-reduced-motion instead.',
      noBlink: '<blink> causes content to flash and cannot be paused by the user. Use CSS instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      Tag(node) {
        const name = node.name.toLowerCase();
        if (name === 'marquee') {
          context.report({ node, messageId: 'noMarquee' });
        } else if (name === 'blink') {
          context.report({ node, messageId: 'noBlink' });
        }
      },
    };
  },
};
