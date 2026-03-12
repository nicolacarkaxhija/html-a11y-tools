import { describe, it } from 'vitest';
import rule from '../../lib/rules/aria-props.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('aria-props', () => {
  it('requires aria-* attribute names to be valid ARIA properties', () => {
    ruleTester.run('html-a11y/aria-props', rule, {
      valid: [
        { code: '<div aria-label="description">x</div>' },
        { code: '<input aria-required="true">' },
        { code: '<div aria-expanded="false">menu</div>' },
        { code: '<div aria-hidden="true">icon</div>' },
        { code: '<p>content</p>' },
        { code: '<div class="foo" aria-label="bar">x</div>' },
      ],
      invalid: [
        {
          code: '<div aria-labeledby="id">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
        {
          code: '<div aria-fake="value">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
        {
          code: '<div aria-role="button">x</div>',
          errors: [{ messageId: 'invalidProp' }],
        },
      ],
    });
  });
});
