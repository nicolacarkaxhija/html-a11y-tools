import { describe, it } from 'vitest';
import rule from '../../lib/rules/aria-proptypes.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('aria-proptypes', () => {
  it('requires aria-* attribute values to match their expected type', () => {
    ruleTester.run('html-a11y/aria-proptypes', rule, {
      valid: [
        { code: '<div aria-hidden="true">x</div>' },
        { code: '<div aria-hidden="false">x</div>' },
        { code: '<input aria-checked="true">' },
        { code: '<input aria-checked="false">' },
        { code: '<input aria-checked="mixed">' },
        { code: '<div aria-sort="ascending">col</div>' },
        { code: '<th aria-sort="none">col</th>' },
        { code: '<button aria-haspopup="true">menu</button>' },
        { code: '<button aria-haspopup="false">menu</button>' },
        { code: '<button aria-haspopup="menu">menu</button>' },
        { code: '<div aria-dropeffect="copy move">x</div>' },
        { code: '<div aria-dropeffect="none">x</div>' },
        { code: '<div aria-label="description">x</div>' },
        { code: '<div aria-controls="listbox-1">x</div>' },
        { code: '<table aria-colcount="3">x</table>' },
        { code: '<div role="slider" aria-valuemax="100">x</div>' },
        { code: '<div aria-hidden="__DYNAMIC__">x</div>' },
        { code: '<div aria-hidden>x</div>' },
        { code: '<div aria-fake="true">x</div>' },
      ],
      invalid: [
        {
          code: '<div aria-hidden="yes">x</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<input aria-required="1">',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<input aria-checked="maybe">',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<div aria-sort="diagonal">col</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<div aria-dropeffect="fly">x</div>',
          errors: [{ messageId: 'invalidType' }],
        },
        {
          code: '<table aria-colcount="3.5">x</table>',
          errors: [{ messageId: 'invalidType' }],
        },
      ],
    });
  });
});
