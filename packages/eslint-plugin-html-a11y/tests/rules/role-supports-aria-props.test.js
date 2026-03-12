import { describe, it } from 'vitest';
import rule from '../../lib/rules/role-supports-aria-props.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('role-supports-aria-props', () => {
  it('requires aria-* attributes to be supported by the element ARIA role', () => {
    ruleTester.run('html-a11y/role-supports-aria-props', rule, {
      valid: [
        { code: '<div role="button" aria-label="Close">x</div>' },
        { code: '<div role="checkbox" aria-checked="true">x</div>' },
        { code: '<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">x</div>' },
        { code: '<div aria-label="test">x</div>' },
        { code: '<div role="__DYNAMIC__" aria-checked="true">x</div>' },
        { code: '<div role="notarole" aria-checked="true">x</div>' },
        { code: '<div role="button" aria-checked="__DYNAMIC__">x</div>' },
        { code: '<div role="button">Click</div>' },
      ],
      invalid: [
        {
          code: '<div role="button" aria-checked="true">x</div>',
          errors: [{ messageId: 'unsupportedProp' }],
        },
        {
          code: '<input role="textbox" aria-selected="true">',
          errors: [{ messageId: 'unsupportedProp' }],
        },
        {
          code: '<div role="button" aria-level="1">x</div>',
          errors: [{ messageId: 'unsupportedProp' }],
        },
      ],
    });
  });
});
