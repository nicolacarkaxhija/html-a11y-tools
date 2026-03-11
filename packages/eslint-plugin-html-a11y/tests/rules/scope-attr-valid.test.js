import { describe, it } from 'vitest';
import rule from '../../lib/rules/scope-attr-valid.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('scope-attr-valid', () => {
  it('requires scope attribute on th to have a valid value', () => {
    ruleTester.run('html-a11y/scope-attr-valid', rule, {
      valid: [
        { code: '<table><tr><th scope="col">Name</th></tr></table>' },
        { code: '<table><tr><th scope="row">Name</th></tr></table>' },
        { code: '<table><tr><th scope="colgroup">Name</th></tr></table>' },
        { code: '<table><tr><th scope="rowgroup">Name</th></tr></table>' },
        { code: '<table><tr><th>Name</th></tr></table>' },
        { code: '<table><tr><th scope="__DYNAMIC__">Name</th></tr></table>' },
        { code: '<table><tr><td scope="col">data</td></tr></table>' },
        { code: '<table><tr><th scope="COL">Name</th></tr></table>' },
      ],
      invalid: [
        {
          code: '<table><tr><th scope="column">Name</th></tr></table>',
          errors: [{ messageId: 'invalidScope' }],
        },
        {
          code: '<table><tr><th scope="invalid">Name</th></tr></table>',
          errors: [{ messageId: 'invalidScope' }],
        },
        {
          code: '<table><tr><th scope>Name</th></tr></table>',
          errors: [{ messageId: 'booleanScope' }],
        },
      ],
    });
  });
});
