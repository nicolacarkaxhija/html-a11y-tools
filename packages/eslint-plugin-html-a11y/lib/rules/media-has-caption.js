/**
 * Rule: media-has-caption
 *
 * Requires every <video> element to have a <track kind="captions"> child.
 * Videos with audio content must provide synchronized captions so that users
 * who are deaf or hard-of-hearing can access the content.
 *
 * Muted videos are exempt because they have no audio track to caption.
 *
 * WCAG 1.2.2 Captions (Prerecorded) (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/media-has-caption
 */

const { getAttr } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require <video> elements to have a <track kind="captions"> child (WCAG 1.2.2)',
      wcag: '1.2.2',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingCaptions:
        '<video> must have a <track kind="captions"> child element to provide synchronized captions.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'video') return;

        // Muted videos have no audio — captions not required
        if (getAttr(node, 'muted') !== undefined) return;

        const hasCaptions =
          Array.isArray(node.children) &&
          node.children.some((child) => {
            if (child.type !== 'Tag' || child.name?.toLowerCase() !== 'track') return false;
            const kind = getAttr(child, 'kind');
            // Dynamic kind — treat as potentially valid (cannot verify statically)
            if (kind && isDynamicValue(kind, valueMarker)) return true;
            return kind?.toLowerCase() === 'captions';
          });

        if (!hasCaptions) {
          context.report({ node, messageId: 'missingCaptions' });
        }
      },
    };
  },
};
