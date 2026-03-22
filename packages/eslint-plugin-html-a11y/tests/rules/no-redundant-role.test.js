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
        // <header>/<footer> inside sectioning elements have role "generic", not banner/contentinfo
        { code: '<article><header role="banner">title</header></article>' },
        { code: '<article><footer role="contentinfo">end</footer></article>' },
        { code: '<aside><header role="banner">h</header></aside>' },
        { code: '<main><footer role="contentinfo">f</footer></main>' },
        { code: '<nav><header role="banner">h</header></nav>' },
        { code: '<section><footer role="contentinfo">f</footer></section>' },
        // <section> without accessible name has role "generic", not "region"
        { code: '<section role="region">content</section>' },
        // <header>/<footer> at top level with non-redundant roles are fine
        { code: '<header role="navigation">nav</header>' },
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
        // <header>/<footer> at top level
        {
          code: '<header role="banner">h</header>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<footer role="contentinfo">f</footer>',
          errors: [{ messageId: 'redundantRole' }],
        },
        // <section> with accessible name has implicit role "region"
        {
          code: '<section aria-label="Products" role="region">content</section>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<section aria-labelledby="hd" role="region">content</section>',
          errors: [{ messageId: 'redundantRole' }],
        },
        {
          code: '<section title="Products" role="region">content</section>',
          errors: [{ messageId: 'redundantRole' }],
        },
      ],
    });
  });
});
