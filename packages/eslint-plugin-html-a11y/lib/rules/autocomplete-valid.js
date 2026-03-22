/**
 * Rule: autocomplete-valid
 *
 * The autocomplete attribute on form controls must use a valid HTML autocomplete
 * token so that browsers and assistive technology can help users fill in forms.
 *
 * WCAG 1.3.5 Identify Input Purpose (Level AA)
 *
 * Inspired by: eslint-plugin-jsx-a11y/autocomplete-valid
 */

const { getAttr } = require('../utils/dom.js');
const { getMarkers, isDynamicValue } = require('../utils/dynamic.js');

/**
 * Input types that do not accept an autocomplete attribute with a field token
 * (hidden, submit, reset, button, image, radio, checkbox, range, color, file).
 */
const SKIP_TYPES = new Set([
  'hidden',
  'submit',
  'reset',
  'button',
  'image',
  'radio',
  'checkbox',
  'range',
  'color',
  'file',
]);

/**
 * Valid HTML autocomplete field tokens from the HTML living standard.
 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-field
 */
const VALID_TOKENS = new Set([
  'name',
  'honorific-prefix',
  'given-name',
  'additional-name',
  'family-name',
  'honorific-suffix',
  'nickname',
  'username',
  'new-password',
  'current-password',
  'one-time-code',
  'organization-title',
  'organization',
  'street-address',
  'address-line1',
  'address-line2',
  'address-line3',
  'address-level4',
  'address-level3',
  'address-level2',
  'address-level1',
  'country',
  'country-name',
  'postal-code',
  'cc-name',
  'cc-given-name',
  'cc-additional-name',
  'cc-family-name',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
  'transaction-currency',
  'transaction-amount',
  'language',
  'bday',
  'bday-day',
  'bday-month',
  'bday-year',
  'sex',
  'url',
  'photo',
  'tel',
  'tel-country-code',
  'tel-national',
  'tel-area-code',
  'tel-local',
  'tel-extension',
  'impp',
  'email',
  'on',
  'off',
  'additional-name-initial',
  'webauthn', // added in HTML Living Standard for passkey/WebAuthn credential type hints
]);

const SECTION_PREFIX = /^section-\S+$/i;
const ADDRESS_GROUP = new Set(['billing', 'shipping']);

/**
 * Validates a single autocomplete attribute value.
 * Returns true if valid.
 */
function isValidAutocomplete(value) {
  const tokens = value.trim().split(/\s+/);
  /* c8 ignore next */
  if (tokens.length === 0) return false;

  let i = 0;

  // Optional: section-* prefix
  if (SECTION_PREFIX.test(tokens[i])) i++;

  // Optional: billing | shipping
  if (i < tokens.length && ADDRESS_GROUP.has(tokens[i].toLowerCase())) i++;

  // Remaining token must be a valid field token
  if (i >= tokens.length) return false;
  const fieldToken = tokens[i].toLowerCase();
  if (!VALID_TOKENS.has(fieldToken)) return false;

  // No extra tokens after the field token
  return i === tokens.length - 1;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require valid autocomplete attribute on form controls (WCAG 1.3.5)',
      wcag: '1.3.5',
      level: 'AA',
      recommended: true,
    },
    messages: {
      invalidAutocomplete:
        '"{{value}}" is not a valid autocomplete value. Use a valid HTML autocomplete token (e.g. "email", "given-name").',
    },
    schema: [],
  },

  create(context) {
    const { valueMarker } = getMarkers(context);
    return {
      Tag(node) {
        const tag = node.name.toLowerCase();
        const isFormControl = ['input', 'select', 'textarea', 'form'].includes(tag);
        if (!isFormControl) return;

        // Skip input types that don't support autocomplete field tokens
        if (tag === 'input') {
          const type = getAttr(node, 'type');
          if (type && type !== true && SKIP_TYPES.has(type.toLowerCase())) return;
        }

        const autocomplete = getAttr(node, 'autocomplete');
        if (autocomplete === undefined) return;
        if (autocomplete === true || isDynamicValue(autocomplete, valueMarker)) return;

        if (!isValidAutocomplete(autocomplete)) {
          context.report({
            node,
            messageId: 'invalidAutocomplete',
            data: { value: autocomplete },
          });
        }
      },
    };
  },
};
