/**
 * Rule: no-redundant-role
 *
 * Flags elements that have an explicit `role` attribute that duplicates the
 * element's own implicit ARIA role. The redundant role adds noise without
 * adding any semantic information.
 *
 * Example: <nav role="navigation"> — <nav> already implies role="navigation".
 *
 * Context-dependent roles:
 *   <a href="..."> → "link"; <a> (no href) → "generic" (role="link" is NOT redundant)
 *   <input type="checkbox"> → "checkbox"; <input type="text"> → "textbox"; etc.
 *
 * WCAG 4.1.2 Name, Role, Value (Level A)
 *
 * Inspired by: eslint-plugin-jsx-a11y/no-redundant-roles
 */

const { getAttr, getImplicitRole } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/**
 * Sectioning content elements that remove the landmark role from
 * <header> and <footer> when those elements are nested inside them.
 * Per HTML-AAM: <header>/<footer> have banner/contentinfo roles only
 * when NOT a descendant of article, aside, main, nav, or section.
 */
const SECTIONING_ELEMENTS = new Set(['article', 'aside', 'main', 'nav', 'section']);

/**
 * Returns true if the given node is nested inside a sectioning element.
 * @param {{ parent?: object, type?: string, name?: string }} node
 * @returns {boolean}
 */
function isInsideSectioning(node) {
  let current = node.parent;
  while (current) {
    if (current.type === 'Tag' && SECTIONING_ELEMENTS.has(current.name.toLowerCase())) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Maps <input type> to its implicit ARIA role.
 * Types not in this map have no clear implicit role and are skipped.
 */
const INPUT_TYPE_ROLES = new Map([
  ['text', 'textbox'],
  ['email', 'textbox'],
  ['url', 'textbox'],
  ['tel', 'textbox'],
  ['search', 'searchbox'],
  ['number', 'spinbutton'],
  ['range', 'slider'],
  ['checkbox', 'checkbox'],
  ['radio', 'radio'],
  ['button', 'button'],
  ['submit', 'button'],
  ['reset', 'button'],
  ['image', 'button'],
]);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Disallow redundant ARIA roles that duplicate the element's implicit role (WCAG 4.1.2)",
      wcag: '4.1.2',
      level: 'A',
      recommended: true,
    },
    messages: {
      redundantRole:
        '<{{tag}}> already has an implicit role of "{{role}}". The explicit role="{{role}}" is redundant.',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const explicitRole = getAttr(node, 'role');
        if (!explicitRole || explicitRole === true) return;
        if (isDynamicValue(explicitRole, valueMarker)) return;

        const tagName = node.name.toLowerCase();
        let implicitRole;

        if (tagName === 'a') {
          // <a> without href has implicit role "generic", not "link"
          if (getAttr(node, 'href') === undefined) return;
          implicitRole = 'link';
        } else if (tagName === 'input') {
          const type = (getAttr(node, 'type') ?? 'text').toLowerCase();
          implicitRole = INPUT_TYPE_ROLES.get(type);
          if (!implicitRole) return;
        } else if (tagName === 'header') {
          // <header> is 'banner' only at the top level; inside a sectioning element it is 'generic'
          if (isInsideSectioning(node)) return;
          implicitRole = 'banner';
        } else if (tagName === 'footer') {
          // <footer> is 'contentinfo' only at the top level; inside a sectioning element it is 'generic'
          if (isInsideSectioning(node)) return;
          implicitRole = 'contentinfo';
        } else if (tagName === 'section') {
          // <section> is 'region' only when it has an accessible name; otherwise it is 'generic'
          const ariaLabel = getAttr(node, 'aria-label');
          const ariaLabelledby = getAttr(node, 'aria-labelledby');
          const titleAttr = getAttr(node, 'title');
          const hasName =
            (ariaLabel && ariaLabel !== true && !isDynamicValue(ariaLabel, valueMarker)) ||
            (ariaLabelledby && ariaLabelledby !== true && !isDynamicValue(ariaLabelledby, valueMarker)) ||
            (titleAttr && titleAttr !== true && !isDynamicValue(titleAttr, valueMarker));
          if (!hasName) return;
          implicitRole = 'region';
        } else {
          implicitRole = getImplicitRole(tagName);
          if (!implicitRole) return;
        }

        if (explicitRole.trim().toLowerCase() === implicitRole) {
          context.report({
            node,
            messageId: 'redundantRole',
            data: { tag: node.name, role: implicitRole },
          });
        }
      },
    };
  },
};
