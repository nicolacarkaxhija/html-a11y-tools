import { describe, it } from 'vitest';
import rule from '../../lib/rules/aria-required-attr.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('aria-required-attr', () => {
  it('requires mandatory ARIA attributes for roles that need them', () => {
    ruleTester.run('html-a11y/aria-required-attr', rule, {
      valid: [
        { code: '<div role="checkbox" aria-checked="false">item</div>' },
        {
          code: '<div role="combobox" aria-expanded="false" aria-controls="listbox-id">combo</div>',
        },
        { code: '<div role="button">click</div>' },
        { code: '<div>content</div>' },
        { code: '<div role="checkbox" aria-checked="__DYNAMIC__">item</div>' },
      ],
      invalid: [
        {
          code: '<div role="checkbox">missing checked</div>',
          errors: [{ messageId: 'missingRequiredAttr' }],
        },
      ],
    });
  });
});
