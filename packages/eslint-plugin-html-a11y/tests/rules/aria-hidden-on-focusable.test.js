import { describe, it } from 'vitest';
import rule from '../../lib/rules/aria-hidden-on-focusable.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('aria-hidden-on-focusable', () => {
  it('disallows aria-hidden="true" on focusable elements', () => {
    ruleTester.run('html-a11y/aria-hidden-on-focusable', rule, {
      valid: [
        { code: '<button aria-hidden="false">Click</button>' },
        { code: '<input aria-hidden="false">' },
        { code: '<div aria-hidden="true">Hidden</div>' },
        { code: '<a aria-hidden="true">Decorative</a>' },
        { code: '<input type="hidden" aria-hidden="true">' },
        { code: '<button aria-hidden="__DYNAMIC__">Click</button>' },
        { code: '<div aria-hidden="true" tabindex="-1">Hidden</div>' },
        { code: '<div aria-hidden="true" tabindex="__DYNAMIC__">x</div>' },
      ],
      invalid: [
        {
          code: '<button aria-hidden="true">Click</button>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<input aria-hidden="true">',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<a href="/page" aria-hidden="true">Link</a>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<select aria-hidden="true"><option>A</option></select>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<textarea aria-hidden="true"></textarea>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
        {
          code: '<div aria-hidden="true" tabindex="0">x</div>',
          errors: [{ messageId: 'ariaHiddenOnFocusable' }],
        },
      ],
    });
  });
});
