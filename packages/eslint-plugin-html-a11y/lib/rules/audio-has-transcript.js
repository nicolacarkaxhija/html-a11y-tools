'use strict';

/**
 * Rule: audio-has-transcript
 *
 * Requires <audio> elements to have a text transcript for users who are deaf
 * or hard-of-hearing. Because transcripts are typically provided as adjacent
 * visible content rather than a child element, this rule flags all visible
 * <audio> elements as a reminder to verify a transcript is present nearby.
 *
 * Elements are exempt when:
 *   - Hidden from assistive technology (aria-hidden="true")
 *   - Muted (no audible content to transcribe)
 *
 * WCAG 1.2.1 Audio-only and Video-only (Prerecorded) (Level A)
 */

const { getAttr, isAriaHidden } = require('../utils/dom.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require <audio> elements to have a text transcript (WCAG 1.2.1)',
      wcag: '1.2.1',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingTranscript:
        '<audio> content requires a text transcript. Provide a visible transcript adjacent to the audio player.',
    },
    schema: [],
  },

  create(context) {
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'audio') return;
        // Decorative or background audio — transcript not required
        if (isAriaHidden(node)) return;
        // Muted audio has no audible content — transcript not required
        if (getAttr(node, 'muted') !== undefined) return;
        context.report({ node, messageId: 'missingTranscript' });
      },
    };
  },
};
