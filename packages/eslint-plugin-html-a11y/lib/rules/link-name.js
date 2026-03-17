/**
 * Rule: link-name
 *
 * Requires every <a> element and every <area href> element to have a
 * discernible accessible name. Links with no text are announced as "link" by
 * screen readers, giving users no information about where the link leads.
 *
 * Acceptable sources of an accessible name for <a>:
 *   - Non-empty text content (including nested elements)
 *   - aria-label attribute
 *   - aria-labelledby attribute
 *
 * Acceptable sources of an accessible name for <area>:
 *   - alt attribute (primary mechanism for image map areas)
 *   - aria-label attribute
 *   - aria-labelledby attribute
 *
 * WCAG 2.4.4 Link Purpose (In Context) (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/anchor-has-content
 */

const { getAttr, hasVisibleTextContent, hasAriaLabel, isAriaHidden } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require <a> and <area href> elements to have a discernible accessible name (WCAG 2.4.4)',
      wcag: '2.4.4',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingName:
        '<a> has no accessible name. Add text content, aria-label, or aria-labelledby so users know where the link leads.',
      missingAreaName:
        '<area href> has no accessible name. Add an alt, aria-label, or aria-labelledby attribute.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker, contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        const tagName = node.name.toLowerCase();

        if (tagName === 'a') {
          if (isAriaHidden(node)) return;

          // Dynamic aria-label counts as a valid name
          const ariaLabelAttr = node.attributes?.find(
            (a) => a.key?.value?.toLowerCase() === 'aria-label',
          );
          if (ariaLabelAttr?.value && isDynamicValue(ariaLabelAttr.value.value, valueMarker)) return;

          if (hasAriaLabel(node) || hasVisibleTextContent(node, contentMarker)) return;

          context.report({ node, messageId: 'missingName' });
          return;
        }

        if (tagName === 'area') {
          // <area> without href is not a link — no accessible name required
          if (getAttr(node, 'href') === undefined) return;
          if (isAriaHidden(node)) return;

          const alt = getAttr(node, 'alt');
          if (alt && alt !== true && isDynamicValue(alt, valueMarker)) return;
          if (alt && alt !== true && alt.trim() !== '') return;

          if (hasAriaLabel(node)) return;

          context.report({ node, messageId: 'missingAreaName' });
        }
      },
    };
  },
};
