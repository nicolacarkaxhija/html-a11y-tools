import { describe, it } from 'vitest';
import rule from '../../lib/rules/no-noninteractive-tabindex.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('no-noninteractive-tabindex', () => {
  it('disallows tabindex >= 0 on non-interactive elements', () => {
    ruleTester.run('html-a11y/no-noninteractive-tabindex', rule, {
      valid: [
        { code: '<button tabindex="0">Click</button>' },
        { code: '<input tabindex="0">' },
        { code: '<a href="#" tabindex="0">Link</a>' },
        { code: '<select tabindex="0"><option>A</option></select>' },
        { code: '<textarea tabindex="0"></textarea>' },
        { code: '<div tabindex="-1">x</div>' },
        { code: '<article tabindex="-1">x</article>' },
        { code: '<div role="button" tabindex="0">x</div>' },
        { code: '<div role="link" tabindex="0">x</div>' },
        { code: '<div>x</div>' },
        { code: '<div tabindex="__DYNAMIC__">x</div>' },
        { code: '<div tabindex>x</div>' },
        { code: '<div role="__DYNAMIC__" tabindex="0">x</div>' },
        // composite widget roles legitimately need tabindex="0" per ARIA APG
        { code: '<div role="tabpanel" tabindex="0">content</div>' },
        { code: '<div role="grid" tabindex="0">grid</div>' },
        { code: '<div role="tree" tabindex="0">tree</div>' },
        { code: '<div role="treegrid" tabindex="0">tg</div>' },
      ],
      invalid: [
        {
          code: '<div tabindex="0">x</div>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<article tabindex="0">x</article>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<div role="article" tabindex="0">x</div>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
        {
          code: '<span tabindex="1">x</span>',
          errors: [{ messageId: 'noninteractiveTabindex' }],
        },
      ],
    });
  });
});
