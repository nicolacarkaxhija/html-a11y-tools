/**
 * Dynamic template expression helpers for accessibility rules.
 *
 * Rules use these to skip validation of attribute values or element content
 * that was replaced by a template preprocessor with a sentinel marker string.
 * Markers are configured via ESLint settings under the 'html-a11y' key:
 *
 *   settings: {
 *     'html-a11y': {
 *       dynamicValueMarker: '__MY_EXPR__',
 *       dynamicContentMarker: '__MY_CONTENT__',
 *     }
 *   }
 */

/**
 * Reads the configured dynamic marker strings from ESLint context settings.
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {{ valueMarker: string | null, contentMarker: string | null }}
 */
export function getMarkers(context) {
  const s = context.settings?.['html-a11y'] ?? {};
  return {
    valueMarker: s.dynamicValueMarker ?? null,
    contentMarker: s.dynamicContentMarker ?? null,
  };
}

/**
 * Returns true when an attribute value contains the configured dynamic value marker,
 * indicating it was originally a template expression and should not be validated.
 * @param {string | true | undefined} v
 * @param {string | null} marker
 * @returns {boolean}
 */
export function isDynamicValue(v, marker) {
  return marker != null && typeof v === 'string' && v.includes(marker);
}
