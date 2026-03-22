import { describe, it } from 'vitest';
import rule from '../../lib/rules/media-has-caption.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('media-has-caption', () => {
  it('requires video elements to have a track with kind="captions"', () => {
    ruleTester.run('html-a11y/media-has-caption', rule, {
      valid: [
        { code: '<video><track kind="captions" src="en.vtt"><source src="v.mp4"></video>' },
        { code: '<video muted><source src="v.mp4"></video>' },
        { code: '<video muted="muted"><source src="v.mp4"></video>' },
        { code: '<audio><source src="a.mp3"></audio>' },
        { code: '<img src="x.jpg" alt="photo">' },
        { code: '<video><track kind="__DYNAMIC__" src="en.vtt"></video>' },
        { code: '<video aria-hidden="true"><source src="v.mp4"></video>' },
      ],
      invalid: [
        {
          code: '<video src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        {
          code: '<video><track kind="subtitles" src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        {
          code: '<video><track src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
        {
          code: '<video><track kind="descriptions" src="en.vtt"></video>',
          errors: [{ messageId: 'missingCaptions' }],
        },
      ],
    });
  });
});
