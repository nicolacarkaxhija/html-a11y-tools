import { describe, it } from 'vitest';
import rule from '../../lib/rules/link-name.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('link-name', () => {
  it('requires links to have a discernible accessible name', () => {
    ruleTester.run('html-a11y/link-name', rule, {
      valid: [
        { code: '<a href="/home">Home</a>' },
        { code: '<a href="/about" aria-label="About us">About</a>' },
        { code: '<a href="/contact" aria-labelledby="lbl">Contact</a>' },
        {
          code: '<a href="/"><span aria-hidden="true">★</span><span class="sr-only">Home</span></a>',
        },
        { code: '<a href="__DYNAMIC__">__CONTENT__</a>' },
        { code: '<a href="/" aria-hidden="true"></a>' },
        { code: '<a href="/" aria-label="__DYNAMIC__">x</a>' },
        { code: '<area shape="default">' },
        { code: '<area href="/home" alt="Home">' },
        { code: '<area href="/home" aria-label="Home section">' },
        { code: '<area href="/home" aria-hidden="true">' },
        { code: '<area href="/home" alt="__DYNAMIC__">' },
      ],
      invalid: [
        {
          code: '<a href="/home"></a>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<a href="/home">   </a>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<a href="/"><img src="logo.png"></a>',
          errors: [{ messageId: 'missingName' }],
        },
        {
          code: '<area href="/home">',
          errors: [{ messageId: 'missingAreaName' }],
        },
        {
          code: '<area href="/home" alt="">',
          errors: [{ messageId: 'missingAreaName' }],
        },
      ],
    });
  });
});
