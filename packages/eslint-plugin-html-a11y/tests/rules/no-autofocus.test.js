import { describe, it } from 'vitest';
import rule from '../../lib/rules/no-autofocus.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('no-autofocus', () => {
  it('disallows the autofocus attribute', () => {
    ruleTester.run('html-a11y/no-autofocus', rule, {
      valid: [
        { code: '<input type="text" name="query">' },
        { code: '<button>Submit</button>' },
        { code: '<textarea name="bio"></textarea>' },
        { code: '<select name="color"><option>Red</option></select>' },
      ],
      invalid: [
        {
          code: '<input type="text" autofocus>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        {
          code: '<button autofocus>Submit</button>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        {
          code: '<textarea autofocus></textarea>',
          errors: [{ messageId: 'noAutofocus' }],
        },
        {
          code: '<input type="text" autofocus="autofocus">',
          errors: [{ messageId: 'noAutofocus' }],
        },
      ],
    });
  });
});
