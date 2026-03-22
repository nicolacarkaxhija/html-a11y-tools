import { describe, it } from 'vitest';
import rule from '../../lib/rules/fieldset-has-legend.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('fieldset-has-legend', () => {
  it('requires <fieldset> to have a non-empty <legend>', () => {
    ruleTester.run('html-a11y/fieldset-has-legend', rule, {
      valid: [
        { code: '<fieldset><legend>Personal info</legend><input></fieldset>' },
        { code: '<fieldset><legend>  Payment  </legend><input></fieldset>' },
        // Dynamic content in legend
        { code: '<fieldset><legend>__CONTENT__</legend><input></fieldset>' },
        // Decorative fieldset — role="presentation"
        { code: '<fieldset role="presentation"><input></fieldset>' },
        { code: '<fieldset role="none"><input></fieldset>' },
        // Hidden from AT
        { code: '<fieldset aria-hidden="true"><input></fieldset>' },
        // Not a fieldset
        { code: '<div><input></div>' },
      ],
      invalid: [
        {
          // No legend at all
          code: '<fieldset><input name="x"></fieldset>',
          errors: [{ messageId: 'missingLegend' }],
        },
        {
          // Empty fieldset
          code: '<fieldset></fieldset>',
          errors: [{ messageId: 'missingLegend' }],
        },
        {
          // Legend is present but empty
          code: '<fieldset><legend></legend><input></fieldset>',
          errors: [{ messageId: 'emptyLegend' }],
        },
        {
          // Legend with only whitespace
          code: '<fieldset><legend>   </legend><input></fieldset>',
          errors: [{ messageId: 'emptyLegend' }],
        },
      ],
    });
  });
});
