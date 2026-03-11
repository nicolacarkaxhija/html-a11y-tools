import { describe, it } from 'vitest';
import rule from '../../lib/rules/heading-has-content.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('heading-has-content', () => {
  it('requires headings to have non-empty content', () => {
    ruleTester.run('html-a11y/heading-has-content', rule, {
      valid: [
        { code: '<h1>Page title</h1>' },
        { code: '<h2><span>Nested text</span></h2>' },
        { code: '<h3>Title <em>with emphasis</em></h3>' },
        { code: '<h1>__CONTENT__</h1>' },
        { code: '<h1 aria-hidden="true"></h1>' },
        { code: '<h4>Level 4</h4>' },
        { code: '<h5>Level 5</h5>' },
        { code: '<h6>Level 6</h6>' },
      ],
      invalid: [
        {
          code: '<h1></h1>',
          errors: [{ messageId: 'emptyHeading' }],
        },
        {
          code: '<h2>   </h2>',
          errors: [{ messageId: 'emptyHeading' }],
        },
        {
          code: '<h3><span></span></h3>',
          errors: [{ messageId: 'emptyHeading' }],
        },
      ],
    });
  });
});
