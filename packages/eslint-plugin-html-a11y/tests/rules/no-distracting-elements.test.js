import { describe, it } from 'vitest';
import rule from '../../lib/rules/no-distracting-elements.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('no-distracting-elements', () => {
  it('allows normal elements', () => {
    ruleTester.run('html-a11y/no-distracting-elements', rule, {
      valid: [
        { code: '<p>content</p>' },
        { code: '<div class="marquee-effect">animated</div>' },
        { code: '<span>blink text</span>' },
      ],
      invalid: [
        {
          code: '<marquee>scrolling text</marquee>',
          errors: [{ messageId: 'noMarquee' }],
        },
        {
          code: '<MARQUEE>scrolling</MARQUEE>',
          errors: [{ messageId: 'noMarquee' }],
        },
        {
          code: '<blink>flashing</blink>',
          errors: [{ messageId: 'noBlink' }],
        },
        {
          code: '<BLINK>flashing</BLINK>',
          errors: [{ messageId: 'noBlink' }],
        },
      ],
    });
  });
});
