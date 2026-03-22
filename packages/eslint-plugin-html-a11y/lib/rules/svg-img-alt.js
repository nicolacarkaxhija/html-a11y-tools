'use strict';

/**
 * Rule: svg-img-alt
 *
 * Requires <svg> elements to either be hidden from assistive technology or
 * identified as images with an accessible label.
 *
 * Acceptable patterns:
 *   ✓ <svg aria-hidden="true"> — decorative, correctly hidden
 *   ✓ <svg role="presentation"> or role="none" — explicitly decorative
 *   ✓ <svg role="img" aria-label="…"> — image with label
 *   ✓ <svg role="img" aria-labelledby="…"> — image with external label
 *   ✓ <svg role="img"><title>…</title></svg> — image with inline title
 *   ✓ <svg role> or role="__DYNAMIC__"> — skip (cannot validate statically)
 *   ✗ <svg> — purpose unclear to assistive technology
 *   ✗ <svg role="img"> — declared as image but no accessible label
 *
 * WCAG 1.1.1 Non-text Content (Level A)
 */

const { getAttr, hasAriaLabel, isAriaHidden, hasVisibleTextContent } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

const DECORATIVE_ROLES = new Set(['presentation', 'none']);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require <svg> elements to be decorative (aria-hidden) or labelled images (role="img" + label) (WCAG 1.1.1)',
      wcag: '1.1.1',
      level: 'A',
      recommended: true,
    },
    messages: {
      missingLabel:
        '<svg role="img"> must have an accessible label via aria-label, aria-labelledby, or a non-empty <title> child.',
      missingRole:
        '<svg> must be either decorative (aria-hidden="true" or role="presentation") or identified as an image (role="img" with an accessible label).',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker, contentMarker } = getMarkers(context);
    return {
      Tag(node) {
        if (node.name.toLowerCase() !== 'svg') return;
        // Explicitly hidden — decorative, no label needed
        if (isAriaHidden(node)) return;

        const role = getAttr(node, 'role');
        // Boolean role or dynamic value — cannot validate statically
        if (role === true) return;
        if (role && isDynamicValue(role, valueMarker)) return;

        if (role) {
          const normalizedRole = role.trim().toLowerCase();
          // Explicitly decorative roles
          if (DECORATIVE_ROLES.has(normalizedRole)) return;

          if (normalizedRole === 'img') {
            // Declared as an image — must have an accessible label
            const hasTitle =
              Array.isArray(node.children) &&
              node.children.some(
                (child) =>
                  child.type === 'Tag' &&
                  child.name?.toLowerCase() === 'title' &&
                  hasVisibleTextContent(child, contentMarker),
              );
            if (!hasAriaLabel(node) && !hasTitle) {
              context.report({ node, messageId: 'missingLabel' });
            }
            return;
          }
        }

        // No role (or unrecognised role) without aria-hidden — purpose is ambiguous
        context.report({ node, messageId: 'missingRole' });
      },
    };
  },
};
