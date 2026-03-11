import { describe, it } from 'vitest';
import rule from '../../lib/rules/interactive-supports-focus.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('interactive-supports-focus', () => {
  it('requires elements with interactive ARIA roles to be focusable', () => {
    ruleTester.run('html-a11y/interactive-supports-focus', rule, {
      valid: [
        { code: '<button role="button">click</button>' },
        { code: '<a href="/" role="link">home</a>' },
        { code: '<div role="button" tabindex="0">click</div>' },
        { code: '<span role="checkbox" tabindex="0" aria-checked="false">check</span>' },
        { code: '<div role="dialog">modal</div>' },
        { code: '<div>content</div>' },
        { code: '<div role="button" tabindex="__DYNAMIC__">x</div>' },
        { code: '<div role="button" tabindex="-1">x</div>' },
        { code: '<div role="button" tabindex>x</div>' },
      ],
      invalid: [
        {
          code: '<div role="button">not focusable</div>',
          errors: [{ messageId: 'notFocusable' }],
        },
        {
          code: '<span role="link">missing tabindex</span>',
          errors: [{ messageId: 'notFocusable' }],
        },
        {
          code: '<li role="menuitem">item</li>',
          errors: [{ messageId: 'notFocusable' }],
        },
      ],
    });
  });
});
