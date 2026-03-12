import { describe, it } from 'vitest';
import rule from '../../lib/rules/no-redundant-role.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('no-redundant-role', () => {
  it("flags explicit roles that duplicate the element's implicit role", () => {
    ruleTester.run('html-a11y/no-redundant-role', rule, {
      valid: [
        { code: '<nav>menu</nav>' },
        { code: '<nav role="menubar">menu</nav>' },
        { code: '<div role="navigation">nav</div>' },
        { code: '<div role="button">click</div>' },
        { code: '<nav role="__DYNAMIC__">nav</nav>' },
        { code: '<a role="link">not a real link</a>' },
        { code: '<input type="password" role="textbox">' },
        { code: '<input type="file" role="button">' },
      ],
      invalid: [
        {
          code: '<nav role="navigation">menu</nav>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<button role="button">click</button>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<main role="main">content</main>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<ul role="list">items</ul>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<a href="/home" role="link">Home</a>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input type="checkbox" role="checkbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input type="text" role="textbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input role="textbox">',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input type="submit" role="button">',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input type="image" role="button" alt="Go" src="btn.png">',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<input type="range" role="slider">',
          errors: [{ messageId: 'redundantRole' }],
        },
      ],
    });
  });
});
