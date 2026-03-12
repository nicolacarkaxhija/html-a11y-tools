import { describe, it } from 'vitest';
import rule from '../../lib/rules/html-has-lang.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('html-has-lang', () => {
  it('requires a non-empty lang attribute on <html>', () => {
    ruleTester.run('html-a11y/html-has-lang', rule, {
      valid: [
        { code: '<html lang="en"><body></body></html>' },
        { code: '<html lang="fr-CA"><body></body></html>' },
        { code: '<html lang="__DYNAMIC__"><body></body></html>' },
        { code: '<div></div>' },
      ],
      invalid: [
        {
          code: '<html><body></body></html>',
          errors: [{ messageId: 'missingLang' }],
        },
        {
          code: '<html lang=""><body></body></html>',
          errors: [{ messageId: 'emptyLang' }],
        },
      ],
    });
  });
});
