import { describe, it } from 'vitest';
import rule from '../../lib/rules/audio-has-transcript.js';
import { createRuleTester } from './helpers.js';

const ruleTester = createRuleTester();

describe('audio-has-transcript', () => {
  it('flags <audio> without a transcript', () => {
    ruleTester.run('html-a11y/audio-has-transcript', rule, {
      valid: [
        // Decorative / hidden — no transcript required
        { code: '<audio aria-hidden="true"><source src="a.mp3"></audio>' },
        // Muted audio — no audible content
        { code: '<audio muted><source src="a.mp3"></audio>' },
        { code: '<audio muted="muted"><source src="a.mp3"></audio>' },
        // Not an audio element
        { code: '<video><source src="v.mp4"></video>' },
        { code: '<div>text</div>' },
      ],
      invalid: [
        {
          code: '<audio><source src="a.mp3"></audio>',
          errors: [{ messageId: 'missingTranscript' }],
        },
        {
          code: '<audio controls src="podcast.mp3"></audio>',
          errors: [{ messageId: 'missingTranscript' }],
        },
        {
          code: '<audio autoplay><source src="a.mp3"></audio>',
          errors: [{ messageId: 'missingTranscript' }],
        },
      ],
    });
  });
});
