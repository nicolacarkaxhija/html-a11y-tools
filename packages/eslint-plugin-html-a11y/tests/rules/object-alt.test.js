import { describe, it } from 'vitest';
import rule from '../../lib/rules/object-alt.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('object-alt', () => {
  it('requires an accessible text alternative on <object>', () => {
    ruleTester.run('html-a11y/object-alt', rule, {
      valid: [
        { code: '<object aria-label="Embedded PDF"></object>' },
        { code: '<object aria-labelledby="caption"></object>' },
        { code: '<object title="Interactive chart"></object>' },
        { code: '<object>A description of the embedded content</object>' },
        { code: '<object title="__DYNAMIC__"></object>' },
        { code: '<div></div>' },
        // role="presentation" / role="none" marks the object as decorative
        { code: '<object role="presentation"></object>' },
        { code: '<object role="none"></object>' },
        { code: '<object role="NONE"></object>' },
      ],
      invalid: [
        {
          code: '<object></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<object title=""></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<object title="   "></object>',
          errors: [{ messageId: 'missingAlt' }],
        },
      ],
    });
  });
});
