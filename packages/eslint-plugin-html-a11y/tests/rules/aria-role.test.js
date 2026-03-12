import { describe, it } from 'vitest';
import rule from '../../lib/rules/aria-role.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('aria-role', () => {
  it('requires role values to be valid non-abstract ARIA roles', () => {
    ruleTester.run('html-a11y/aria-role', rule, {
      valid: [
        { code: '<div role="button">click</div>' },
        { code: '<div role="navigation">nav</div>' },
        { code: '<div role="alert">message</div>' },
        { code: '<div role="dialog">modal</div>' },
        { code: '<div role="menuitem">item</div>' },
        { code: '<div role="button navigation">x</div>' },
        { code: '<div role>x</div>' },
        { code: '<div>content</div>' },
        { code: '<div role="__DYNAMIC__">x</div>' },
      ],
      invalid: [
        {
          code: '<div role="fake-role">x</div>',
          errors: [{ messageId: 'invalidRole' }],
        },
        {
          code: '<div role="widget">x</div>',
          errors: [{ messageId: 'abstractRole' }],
        },
        {
          code: '<div role="">x</div>',
          errors: [{ messageId: 'emptyRole' }],
        },
      ],
    });
  });
});
