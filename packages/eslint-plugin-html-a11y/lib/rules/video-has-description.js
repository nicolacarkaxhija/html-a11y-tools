'use strict';

/**
 * Rule: video-has-description
 *
 * Requires <video> elements to have an audio description track so that users
 * who are blind or have low vision can access the visual content.
 *
 * A <track kind="descriptions"> child is required unless:
 *   - The video is muted (no visual content requiring description)
 *   - The element is hidden from assistive technology (aria-hidden="true")
 *
 * A dynamic kind value is accepted without validation (cannot verify statically).
 *
 * WCAG 1.2.5 Audio Description (Prerecorded) (Level AA)
 */

const { getAttr, isAriaHidden } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require <video> elements to have a <track kind="descriptions"> child (WCAG 1.2.5)',
      wcag: '1.2.5',
      level: 'AA',
      recommended: true,
    },
    messages: {
      missingDescription:
        '<video> must have a <track kind="descriptions"> child to provide audio description for users who are blind or have low vision.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'video') return;
        if (isAriaHidden(node)) return;
        // Muted videos have no audio track — description not required
        if (getAttr(node, 'muted') !== undefined) return;

        const hasDescription =
          Array.isArray(node.children) &&
          node.children.some((child) => {
            if (child.type !== 'Tag' || child.name?.toLowerCase() !== 'track') return false;
            const kind = getAttr(child, 'kind');
            // Dynamic kind — treat as potentially valid (cannot verify statically)
            if (kind && isDynamicValue(kind, valueMarker)) return true;
            return kind?.toLowerCase() === 'descriptions';
          });

        if (!hasDescription) {
          context.report({ node, messageId: 'missingDescription' });
        }
      },
    };
  },
};
