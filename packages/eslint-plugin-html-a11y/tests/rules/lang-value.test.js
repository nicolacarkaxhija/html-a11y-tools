import { describe, it } from 'vitest';
import rule from '../../lib/rules/lang-value.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('lang-value', () => {
  it('requires a valid BCP 47 language tag on <html lang>', () => {
    ruleTester.run('html-a11y/lang-value', rule, {
      valid: [
        { code: '<html lang="en"><body></body></html>' },
        { code: '<html lang="fr-CA"><body></body></html>' },
        { code: '<html lang="zh-Hans-CN"><body></body></html>' },
        { code: '<html lang="__DYNAMIC__"><body></body></html>' },
        { code: '<html><body></body></html>' },
        { code: '<html lang=""><body></body></html>' },
        { code: '<div lang="invalid value!"></div>' },
      ],
      invalid: [
        {
          code: '<html lang="not valid!"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
        {
          code: '<html lang="123"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
        {
          code: '<html lang="en-"><body></body></html>',
          errors: [{ messageId: 'invalidLang' }],
        },
      ],
    });
  });
});
