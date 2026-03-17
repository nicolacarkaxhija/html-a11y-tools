/**
 * ARIA utilities wrapping the aria-query package.
 * Source: aria-query npm package (https://www.npmjs.com/package/aria-query)
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/
 */

const { roles, aria } = require('aria-query');

/**
 * Returns true if the given string is a valid ARIA role.
 * @param {string} role
 * @returns {boolean}
 */
function isValidAriaRole(role) {
  return roles.has(role);
}

/**
 * Returns true if the given string is a valid ARIA property/state name.
 * @param {string} prop  e.g. "aria-label"
 * @returns {boolean}
 */
function isValidAriaProp(prop) {
  return aria.has(prop);
}

/**
 * Returns the type definition for a given ARIA property.
 * @param {string} prop  e.g. "aria-hidden"
 * @returns {{ type: string, values?: string[] } | undefined}
 */
function getAriaPropType(prop) {
  return aria.get(prop);
}

/**
 * Returns the required ARIA property names for a given role (aria-query v5).
 * @param {string} role
 * @returns {string[]}
 */
/* c8 ignore next 3 -- aria-query v5 always populates requiredProps; cross-product branch is unreachable */
function getRequiredPropsForRole(role) {
  return Object.keys(roles.get(role)?.requiredProps ?? {});
}

/**
 * Returns true if the given role is abstract (cannot be used on elements directly).
 * @param {string} role
 * @returns {boolean}
 */
function isAbstractRole(role) {
  const roleEntry = roles.get(role);
  return roleEntry ? roleEntry.abstract === true : false;
}

/* c8 ignore next 8 -- v8 maps ?.props ?? {} phantom branch into JSDoc lines */
/**
 * Returns all ARIA property names supported by the given role (including inherited globals).
 * @param {string} role
 * @returns {string[]}
 */
function getSupportedPropsForRole(role) {
  return Object.keys(roles.get(role)?.props ?? {});
}

module.exports = { isValidAriaRole, isValidAriaProp, getAriaPropType, getRequiredPropsForRole, isAbstractRole, getSupportedPropsForRole };
