import { describe, it } from 'vitest';
import rule from '../../lib/rules/label.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('label', () => {
  it('requires form controls to have an accessible label', () => {
    ruleTester.run('html-a11y/label', rule, {
      valid: [
        { code: '<label for="email">Email</label><input type="email" id="email">' },
        { code: '<label>Email<input type="email"></label>' },
        { code: '<input type="text" aria-label="Search">' },
        { code: '<input type="text" aria-labelledby="lbl">' },
        { code: '<input type="email" id="__DYNAMIC__">' },
        { code: '<input type="text" aria-label="__DYNAMIC__">' },
        { code: '<input type="hidden" name="csrf">' },
        { code: '<input type="submit" value="Submit">' },
        { code: '<input type="reset" value="Reset">' },
        { code: '<input type="button" value="Click">' },
        {
          code: '<label for="country">Country</label><select id="country"><option>US</option></select>',
        },
        { code: '<label for="bio">Bio</label><textarea id="bio"></textarea>' },
      ],
      invalid: [
        {
          code: '<input type="text">',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          code: '<input type="email">',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          code: '<select><option>Choose</option></select>',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          code: '<textarea></textarea>',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          code: '<label for="wrong">Name</label><input type="text" id="name">',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          code: '<div><input></div>',
          errors: [{ messageId: 'missingLabel' }],
        },
      ],
    });
  });
});
