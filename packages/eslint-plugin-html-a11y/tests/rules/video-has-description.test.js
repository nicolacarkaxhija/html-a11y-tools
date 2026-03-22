import { describe, it } from 'vitest';
import rule from '../../lib/rules/video-has-description.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('video-has-description', () => {
  it('requires <video> to have a <track kind="descriptions"> child', () => {
    ruleTester.run('html-a11y/video-has-description', rule, {
      valid: [
        // Has audio description track
        { code: '<video><track kind="descriptions" src="en.vtt"><source src="v.mp4"></video>' },
        // Muted — no audio track, description not required
        { code: '<video muted><source src="v.mp4"></video>' },
        { code: '<video muted="muted"><source src="v.mp4"></video>' },
        // Decorative
        { code: '<video aria-hidden="true"><source src="v.mp4"></video>' },
        // Dynamic kind — treat as potentially valid
        { code: '<video><track kind="__DYNAMIC__" src="en.vtt"></video>' },
        // Not a video element
        { code: '<audio><source src="a.mp3"></audio>' },
      ],
      invalid: [
        {
          code: '<video src="v.mp4"></video>',
          errors: [{ messageId: 'missingDescription' }],
        },
        {
          code: '<video><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingDescription' }],
        },
        {
          // Has captions track but NOT a descriptions track
          code: '<video><track kind="captions" src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingDescription' }],
        },
        {
          // Has track without kind
          code: '<video><track src="en.vtt"><source src="v.mp4"></video>',
          errors: [{ messageId: 'missingDescription' }],
        },
      ],
    });
  });
});
