import htmlParser from '@html-eslint/parser';

import anchorIsValid from './lib/rules/anchor-is-valid.js';
import ariaHiddenOnFocusable from './lib/rules/aria-hidden-on-focusable.js';
import ariaProps from './lib/rules/aria-props.js';
import ariaProptypes from './lib/rules/aria-proptypes.js';
import ariaRequiredAttr from './lib/rules/aria-required-attr.js';
import ariaRole from './lib/rules/aria-role.js';
import autocompleteValid from './lib/rules/autocomplete-valid.js';
import buttonName from './lib/rules/button-name.js';
import headingHasContent from './lib/rules/heading-has-content.js';
import htmlHasLang from './lib/rules/html-has-lang.js';
import imgAlt from './lib/rules/img-alt.js';
import interactiveSupportsFocus from './lib/rules/interactive-supports-focus.js';
import label from './lib/rules/label.js';
import langValue from './lib/rules/lang-value.js';
import linkName from './lib/rules/link-name.js';
import mediaHasCaption from './lib/rules/media-has-caption.js';
import noAccessKey from './lib/rules/no-access-key.js';
import noAutofocus from './lib/rules/no-autofocus.js';
import noDistractingElements from './lib/rules/no-distracting-elements.js';
import noNoninteractiveTabindex from './lib/rules/no-noninteractive-tabindex.js';
import noRedundantRole from './lib/rules/no-redundant-role.js';
import objectAlt from './lib/rules/object-alt.js';
import roleSupportsAriaProps from './lib/rules/role-supports-aria-props.js';
import scopeAttrValid from './lib/rules/scope-attr-valid.js';
import tabindexNoPositive from './lib/rules/tabindex-no-positive.js';

export const rules = {
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

export default plugin;
