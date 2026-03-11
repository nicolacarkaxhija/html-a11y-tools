/**
 * Rule: no-access-key
 *
 * Disallows the `accesskey` attribute. Access keys create custom keyboard
 * shortcuts that conflict with browser keyboard shortcuts and assistive
 * technology hotkeys, making keyboard navigation unpredictable for users
 * who rely on the keyboard.
 *
 * WCAG 2.1.4 Character Key Shortcuts (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-access-key
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow accesskey attribute — it creates keyboard shortcut conflicts (WCAG 2.1.4)',
      wcag: '2.1.4',
      recommended: true,
    },
    messages: {
      noAccessKey:
        'Avoid using the accesskey attribute. It creates keyboard shortcut conflicts with browser and assistive technology hotkeys.',
    },
    schema: [],
  },

  create(context) {
    return {
      Attribute(node) {
        /* c8 ignore next -- @html-eslint/parser always produces string key values */
        if (typeof node.key?.value !== 'string') return;
        if (node.key.value.toLowerCase() === 'accesskey') {
          context.report({ node, messageId: 'noAccessKey' });
        }
      },
    };
  },
};
