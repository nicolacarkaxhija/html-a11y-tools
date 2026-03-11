import { describe, it } from 'vitest';
import rule from '../../lib/rules/autocomplete-valid.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('autocomplete-valid', () => {
  it('requires valid autocomplete tokens on form controls', () => {
    ruleTester.run('html-a11y/autocomplete-valid', rule, {
      valid: [
        { code: '<input autocomplete="email">' },
        { code: '<input autocomplete="given-name">' },
        { code: '<input autocomplete="on">' },
        { code: '<input autocomplete="off">' },
        { code: '<input autocomplete="new-password">' },
        { code: '<select autocomplete="country"></select>' },
        { code: '<textarea autocomplete="street-address"></textarea>' },
        { code: '<form autocomplete="off"></form>' },
        { code: '<input autocomplete="section-billing email">' },
        { code: '<input autocomplete="billing given-name">' },
        { code: '<input autocomplete="shipping postal-code">' },
        { code: '<input autocomplete="section-home billing email">' },
        { code: '<input>' },
        { code: '<input type="text">' },
        { code: '<input autocomplete>' },
        { code: '<input autocomplete="__DYNAMIC__">' },
        { code: '<input type="hidden" autocomplete="invalidtoken">' },
        { code: '<input type="submit" autocomplete="invalidtoken">' },
        { code: '<input type="reset" autocomplete="invalidtoken">' },
        { code: '<input type="button" autocomplete="invalidtoken">' },
        { code: '<input type="image" autocomplete="invalidtoken">' },
        { code: '<input type="radio" autocomplete="invalidtoken">' },
        { code: '<input type="checkbox" autocomplete="invalidtoken">' },
        { code: '<input type="range" autocomplete="invalidtoken">' },
        { code: '<input type="color" autocomplete="invalidtoken">' },
        { code: '<input type="file" autocomplete="invalidtoken">' },
        { code: '<div autocomplete="invalid"></div>' },
      ],
      invalid: [
        {
          code: '<input autocomplete="badtoken">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<input autocomplete="firstname">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<select autocomplete="notvalid"></select>',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<textarea autocomplete="notvalid"></textarea>',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<input autocomplete="email extra">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
        {
          code: '<input autocomplete="billing">',
          errors: [{ messageId: 'invalidAutocomplete' }],
        },
      ],
    });
  });
});
