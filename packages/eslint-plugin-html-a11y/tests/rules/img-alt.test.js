import { describe, it } from 'vitest';
import rule from '../../lib/rules/img-alt.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('img-alt', () => {
  it('requires meaningful or explicitly decorative alt attributes', () => {
    ruleTester.run('html-a11y/img-alt', rule, {
      valid: [
        { code: '<figure><img alt="product" src="x.jpg"></figure>' },
        { code: '<img alt="product photo" src="x.jpg">' },
        { code: '<img alt="__DYNAMIC__" src="x.jpg">' },
        { code: '<img alt="" role="presentation" src="x.jpg">' },
        { code: '<img alt="" aria-hidden="true" src="x.jpg">' },
        { code: '<img aria-label="logo" src="logo.png">' },
        { code: '<img alt="" role="none" src="x.jpg">' },
        { code: '<input type="image" alt="Submit order" src="btn.png">' },
        { code: '<input type="image" aria-label="Submit" src="btn.png">' },
        { code: '<img aria-labelledby="caption" src="x.jpg">' },
        { code: '<input type="image" aria-labelledby="lbl" src="btn.png">' },
        { code: '<input type="image" alt="__DYNAMIC__" src="btn.png">' },
        { code: '<input type="text">' },
        { code: '<input type="submit" value="Go">' },
      ],
      invalid: [
        {
          code: '<img aria-label src="x.jpg">',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<img src="x.jpg">',
          errors: [{ messageId: 'missingAlt' }],
        },
        {
          code: '<img alt="" src="x.jpg">',
          errors: [{ messageId: 'decorativeAlt' }],
        },
        {
          code: '<img alt="   " src="x.jpg">',
          errors: [{ messageId: 'decorativeAlt' }],
        },
        {
          code: '<input type="image" src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
        {
          code: '<input type="image" alt="" src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
        {
          code: '<input type="image" alt src="btn.png">',
          errors: [{ messageId: 'missingInputAlt' }],
        },
      ],
    });
  });
});
