import { describe, it } from 'vitest';
import rule from '../../lib/rules/anchor-is-valid.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('anchor-is-valid', () => {
  it('requires anchors to have a valid href', () => {
    ruleTester.run('html-a11y/anchor-is-valid', rule, {
      valid: [
        { code: '<a href="/products">Products</a>' },
        { code: '<a href="https://example.com">External</a>' },
        { code: '<a href="#section-1">Jump to section</a>' },
        { code: '<a href="mailto:info@example.com">Email</a>' },
        { code: '<a href="__DYNAMIC__">Link</a>' },
        { code: '<button>Not an anchor</button>' },
      ],
      invalid: [
        {
          code: '<a>Click me</a>',
          errors: [{ messageId: 'missingHref' }],
        },
        {
          code: '<a href>Click</a>',
          errors: [{ messageId: 'missingHref' }],
        },
        {
          code: '<a href="">Empty</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        {
          code: '<a href="#">Hash only</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        {
          code: '<a href="javascript:void(0)">JS void</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
        {
          code: '<a href="javascript:;">JS semi</a>',
          errors: [{ messageId: 'invalidHref' }],
        },
      ],
    });
  });
});
