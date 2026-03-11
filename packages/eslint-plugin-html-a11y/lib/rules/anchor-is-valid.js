/**
 * Rule: anchor-is-valid
 *
 * Requires <a> elements to have a meaningful href that navigates somewhere.
 * Anchors with missing, empty, or non-navigating href values (like # or
 * javascript:void) are not true links and confuse assistive technology.
 *
 * WCAG 2.4.4 Link Purpose (In Context) (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/anchor-is-valid
 */

import { getAttr } from '../utils/dom.js';
import { getMarkers, isDynamicValue } from '../utils/dynamic.js';

/** href values that do not navigate to a real destination. */
const INVALID_HREF_PATTERN = /^(#$|javascript:)/i;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require <a> elements to have a valid navigating href (WCAG 2.4.4)',
      wcag: '2.4.4',
      recommended: true,
    },
    messages: {
      missingHref: '<a> element has no href. If it is not a navigation link, use <button> instead.',
      invalidHref:
        '<a href="..."> has a non-navigating value. Avoid "#", "javascript:void", and empty strings.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'a') return;

        const href = getAttr(node, 'href');

        if (href === undefined) {
          context.report({ node, messageId: 'missingHref' });
          return;
        }

        // Boolean href (no value) — treat as missing
        if (href === true) {
          context.report({ node, messageId: 'missingHref' });
          return;
        }

        if (isDynamicValue(href, valueMarker)) return;

        if (href.trim() === '') {
          context.report({ node, messageId: 'invalidHref' });
          return;
        }

        if (INVALID_HREF_PATTERN.test(href.trim())) {
          context.report({ node, messageId: 'invalidHref' });
        }
      },
    };
  },
};
