/**
 * Rule: img-alt
 *
 * Requires every <img> element and <input type="image"> to have an alt
 * attribute. A non-empty alt provides a text alternative for users who cannot
 * see the image. A decorative <img> must use alt="" combined with
 * role="presentation" or aria-hidden="true". An <input type="image"> acts as
 * an image button and must always have a non-empty alt describing the action.
 *
 * WCAG 1.1.1 Non-text Content (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/alt-text,
 *              eslint-plugin-vuejs-accessibility/alt-text
 */

import { getAttr, hasAriaLabel, isAriaHidden } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require alt attribute on <img> and <input type="image"> elements (WCAG 1.1.1)',
      wcag: '1.1.1',
      recommended: true,
    },
    messages: {
      missingAlt:
        '<img> must have an alt attribute. Use a descriptive value, or alt="" with role="presentation" for decorative images.',
      decorativeAlt:
        '<img alt=""> marks this image as decorative but it is not hidden from assistive technology. Add role="presentation" or aria-hidden="true" to confirm intent.',
      missingInputAlt:
        '<input type="image"> must have an alt attribute describing the button\'s function.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const tagName = node.name.toLowerCase();
        const isImg = tagName === 'img';
        const isInputImage =
          tagName === 'input' && getAttr(node, 'type')?.toLowerCase() === 'image';

        if (!isImg && !isInputImage) return;

        const alt = getAttr(node, 'alt');

        // aria-label or aria-labelledby provides an accessible name — no alt needed
        if (hasAriaLabel(node)) return;

        if (alt === undefined) {
          context.report({ node, messageId: isImg ? 'missingAlt' : 'missingInputAlt' });
          return;
        }

        if (isDynamicValue(alt, valueMarker)) return;

        if (alt !== true && alt.trim().length > 0) return;

        if (isInputImage) {
          context.report({ node, messageId: 'missingInputAlt' });
          return;
        }

        // Empty or whitespace-only alt on <img>: valid only when decorative markers present
        const hasPresentation =
          getAttr(node, 'role') === 'presentation' || getAttr(node, 'role') === 'none';
        if (isAriaHidden(node) || hasPresentation) return;

        context.report({ node, messageId: 'decorativeAlt' });
      },
    };
  },
};
