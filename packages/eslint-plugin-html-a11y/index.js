'use strict';

const htmlParser = require('@html-eslint/parser');

const anchorIsValid = require('./lib/rules/anchor-is-valid.js');
const ariaHiddenOnFocusable = require('./lib/rules/aria-hidden-on-focusable.js');
const ariaProps = require('./lib/rules/aria-props.js');
const ariaProptypes = require('./lib/rules/aria-proptypes.js');
const ariaRequiredAttr = require('./lib/rules/aria-required-attr.js');
const ariaRole = require('./lib/rules/aria-role.js');
const autocompleteValid = require('./lib/rules/autocomplete-valid.js');
const buttonName = require('./lib/rules/button-name.js');
const headingHasContent = require('./lib/rules/heading-has-content.js');
const htmlHasLang = require('./lib/rules/html-has-lang.js');
const imgAlt = require('./lib/rules/img-alt.js');
const interactiveSupportsFocus = require('./lib/rules/interactive-supports-focus.js');
const label = require('./lib/rules/label.js');
const langValue = require('./lib/rules/lang-value.js');
const linkName = require('./lib/rules/link-name.js');
const mediaHasCaption = require('./lib/rules/media-has-caption.js');
const noAccessKey = require('./lib/rules/no-access-key.js');
const noAutofocus = require('./lib/rules/no-autofocus.js');
const noDistractingElements = require('./lib/rules/no-distracting-elements.js');
const noNoninteractiveTabindex = require('./lib/rules/no-noninteractive-tabindex.js');
const noRedundantRole = require('./lib/rules/no-redundant-role.js');
const objectAlt = require('./lib/rules/object-alt.js');
const roleSupportsAriaProps = require('./lib/rules/role-supports-aria-props.js');
const scopeAttrValid = require('./lib/rules/scope-attr-valid.js');
const tabindexNoPositive = require('./lib/rules/tabindex-no-positive.js');

const rules = {
  'anchor-is-valid': anchorIsValid,
  'aria-hidden-on-focusable': ariaHiddenOnFocusable,
  'aria-props': ariaProps,
  'aria-proptypes': ariaProptypes,
  'aria-required-attr': ariaRequiredAttr,
  'aria-role': ariaRole,
  'autocomplete-valid': autocompleteValid,
  'button-name': buttonName,
  'heading-has-content': headingHasContent,
  'html-has-lang': htmlHasLang,
  'img-alt': imgAlt,
  'interactive-supports-focus': interactiveSupportsFocus,
  label,
  'lang-value': langValue,
  'link-name': linkName,
  'media-has-caption': mediaHasCaption,
  'no-access-key': noAccessKey,
  'no-autofocus': noAutofocus,
  'no-distracting-elements': noDistractingElements,
  'no-noninteractive-tabindex': noNoninteractiveTabindex,
  'no-redundant-role': noRedundantRole,
  'object-alt': objectAlt,
  'role-supports-aria-props': roleSupportsAriaProps,
  'scope-attr-valid': scopeAttrValid,
  'tabindex-no-positive': tabindexNoPositive,
};

const recommendedRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`html-a11y/${name}`, 'warn']),
);

const plugin = { rules };

plugin.configs = {
  recommended: [
    {
      files: ['**/*.html'],
      plugins: { 'html-a11y': plugin },
      languageOptions: { parser: htmlParser },
      rules: recommendedRules,
    },
  ],
};

module.exports = plugin;
