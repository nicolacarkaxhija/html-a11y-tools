/**
 * DOM element utilities for accessibility rule logic.
 */

/**
 * Elements that are natively focusable without needing tabindex.
 * Excludes disabled elements — callers must check the disabled attribute separately.
 */
const NATIVELY_FOCUSABLE_ELEMENTS = new Set([
  'a',
  'button',
  'details',
  'embed',
  'iframe',
  'input',
  'object',
  'select',
  'textarea',
]);

/**
 * ARIA roles that imply interactive (keyboard-operable) behaviour.
 * Elements with these roles must be focusable.
 */
const INTERACTIVE_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'gridcell',
  'link',
  'listbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
  'treeitem',
]);

/**
 * Semantic HTML elements and their implicit ARIA roles, used by no-redundant-role.
 */
// Note: <header>, <footer>, and <section> have context-dependent implicit roles:
//   <header>/<footer> are 'banner'/'contentinfo' only when NOT inside a sectioning element.
//   <section> is 'region' only when it has an accessible name.
// These are handled as special cases in no-redundant-role.js and are intentionally
// omitted from this map. Similarly, <a> is handled specially (role depends on href).
const IMPLICIT_ROLES = new Map([
  ['article', 'article'],
  ['aside', 'complementary'],
  ['button', 'button'],
  ['datalist', 'listbox'],
  ['details', 'group'],
  ['dialog', 'dialog'],
  ['fieldset', 'group'],
  ['figure', 'figure'],
  ['form', 'form'],
  ['h1', 'heading'],
  ['h2', 'heading'],
  ['h3', 'heading'],
  ['h4', 'heading'],
  ['h5', 'heading'],
  ['h6', 'heading'],
  ['hr', 'separator'],
  ['img', 'img'],
  ['input', 'textbox'],
  ['li', 'listitem'],
  // <link> (the HTML element) has an implicit role of 'link', distinct from the <a> handling
  ['link', 'link'],
  ['main', 'main'],
  ['math', 'math'],
  ['menu', 'list'],
  ['menuitem', 'menuitem'],
  ['meter', 'meter'],
  ['nav', 'navigation'],
  ['ol', 'list'],
  ['option', 'option'],
  ['output', 'status'],
  ['progress', 'progressbar'],
  ['select', 'combobox'],
  ['summary', 'button'],
  ['table', 'table'],
  ['tbody', 'rowgroup'],
  ['td', 'cell'],
  ['textarea', 'textbox'],
  ['tfoot', 'rowgroup'],
  ['th', 'columnheader'],
  ['thead', 'rowgroup'],
  ['tr', 'row'],
  ['ul', 'list'],
]);

/**
 * Returns the value of a named attribute on a Tag node, or undefined if absent.
 * Returns `true` for boolean attributes (present but no value).
 * @param {{ attributes?: Array<{ key?: { value: string }, value?: { value: string } }> }} node
 * @param {string} attrName
 * @returns {string | true | undefined}
 */
function getAttr(node, attrName) {
  const attr = node.attributes?.find((a) => a.key?.value?.toLowerCase() === attrName.toLowerCase());
  if (!attr) return undefined;
  return attr.value?.value ?? true;
}

/* c8 ignore next 3 -- v8 maps optional-chain branches from getAttr's callback to surrounding lines */
/** Recursively collects all text content from an element's subtree. */
function getTextContent(node) {
  if (!Array.isArray(node.children)) return '';
  return node.children
    .map((child) => {
      if (child.type === 'Text') return child.value || '';
      if (child.type === 'Tag') return getTextContent(child);
      return '';
    })
    .join('');
}

/**
 * Returns true if the element has any non-whitespace text content, including
 * dynamic content sentinels injected by a template preprocessor.
 * @param {{ children?: any[] }} node
 * @param {string | null} [contentMarker]
 * @returns {boolean}
 */
function hasVisibleTextContent(node, contentMarker = null) {
  const text = getTextContent(node);
  if (contentMarker && text.includes(contentMarker)) return true;
  return text.trim().length > 0;
}

/**
 * Returns true if an element has a valid accessible name via aria-label or
 * aria-labelledby (presence only — we cannot resolve idref targets statically).
 * @param {{ attributes?: any[] }} node
 * @returns {boolean}
 */
function hasAriaLabel(node) {
  const ariaLabel = getAttr(node, 'aria-label');
  if (ariaLabel && ariaLabel !== true && ariaLabel.trim() !== '') return true;
  const ariaLabelledBy = getAttr(node, 'aria-labelledby');
  if (ariaLabelledBy && ariaLabelledBy !== true) return true;
  return false;
}

/**
 * Returns true if the element is hidden from assistive technology via aria-hidden="true".
 * @param {{ attributes?: any[] }} node
 * @returns {boolean}
 */
function isAriaHidden(node) {
  return getAttr(node, 'aria-hidden') === 'true';
}

/**
 * Returns true if the element is natively focusable.
 * @param {string} tagName
 * @returns {boolean}
 */
function isNativelyFocusable(tagName) {
  return NATIVELY_FOCUSABLE_ELEMENTS.has(tagName.toLowerCase());
}

/**
 * Returns true if the given ARIA role implies interactive behaviour.
 * @param {string} role
 * @returns {boolean}
 */
function isInteractiveRole(role) {
  return INTERACTIVE_ROLES.has(role);
}

/**
 * Returns the implicit ARIA role for a given element tag name, or undefined.
 * @param {string} tagName
 * @returns {string | undefined}
 */
function getImplicitRole(tagName) {
  return IMPLICIT_ROLES.get(tagName.toLowerCase());
}

module.exports = { getAttr, getTextContent, hasVisibleTextContent, hasAriaLabel, isAriaHidden, isNativelyFocusable, isInteractiveRole, getImplicitRole, INTERACTIVE_ROLES };
