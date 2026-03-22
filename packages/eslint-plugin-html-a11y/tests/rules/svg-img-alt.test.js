import { describe, it } from 'vitest';
import rule from '../../lib/rules/svg-img-alt.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('svg-img-alt', () => {
  it('requires <svg> to be decorative or labelled as an image', () => {
    ruleTester.run('html-a11y/svg-img-alt', rule, {
      valid: [
        // Decorative — hidden from AT
        { code: '<svg aria-hidden="true"><path d="M0 0"/></svg>' },
        // Decorative — explicit role
        { code: '<svg role="presentation"><path d="M0 0"/></svg>' },
        { code: '<svg role="none"><path d="M0 0"/></svg>' },
        // Image with aria-label
        { code: '<svg role="img" aria-label="Company logo"></svg>' },
        // Image with aria-labelledby
        { code: '<svg role="img" aria-labelledby="title-id"></svg>' },
        // Image with inline <title>
        { code: '<svg role="img"><title>Bar chart showing sales</title></svg>' },
        // Boolean role attribute — skip (cannot determine intent)
        { code: '<svg role><path/></svg>' },
        // Dynamic role — skip
        { code: '<svg role="__DYNAMIC__"><path/></svg>' },
        // Not an svg element
        { code: '<img src="x.jpg" alt="photo">' },
        { code: '<div>text</div>' },
      ],
      invalid: [
        {
          // SVG without any role or aria-hidden — ambiguous
          code: '<svg><path d="M0 0"/></svg>',
          errors: [{ messageId: 'missingRole' }],
        },
        {
          // SVG with non-img role — still ambiguous (treat as missing role)
          code: '<svg role="group"><circle/></svg>',
          errors: [{ messageId: 'missingRole' }],
        },
        {
          // SVG with role="img" but no label
          code: '<svg role="img"><path d="M0 0"/></svg>',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          // SVG with role="img" and an empty <title>
          code: '<svg role="img"><title></title></svg>',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          // SVG with role="img" and only whitespace in <title>
          code: '<svg role="img"><title>   </title></svg>',
          errors: [{ messageId: 'missingLabel' }],
        },
        {
          // SVG with role="img" and aria-label="" (empty)
          code: '<svg role="img" aria-label=""></svg>',
          errors: [{ messageId: 'missingLabel' }],
        },
      ],
    });
  });
});
