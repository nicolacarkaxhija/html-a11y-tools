import { describe, it } from 'vitest';
import rule from '../../lib/rules/tabindex-no-positive.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('tabindex-no-positive', () => {
  it('allows valid tabindex values', () => {
    ruleTester.run('html-a11y/tabindex-no-positive', rule, {
      valid: [
        { code: '<div tabindex="0">focusable</div>' },
        { code: '<div tabindex="-1">programmatically focusable</div>' },
        { code: '<p>no tabindex</p>' },
        { code: '<div tabindex="__DYNAMIC__">x</div>' },
      ],
      invalid: [
        {
          code: '<div tabindex="1">wrong</div>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
        {
          code: '<button tabindex="5">wrong</button>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
        {
          code: '<a tabindex="999">link</a>',
          errors: [{ messageId: 'noPositiveTabindex' }],
        },
      ],
    });
  });
});
