/**
 * Shared test helpers for rule tests.
 * Uses ESLint's RuleTester with @html-eslint/parser and neutral dynamic markers.
 */

import { RuleTester } from 'eslint';
import * as htmlParser from '@html-eslint/parser';

export function createRuleTester() {
  return new RuleTester({
    languageOptions: { parser: htmlParser },
    settings: {
      'html-a11y': {
        dynamicValueMarker: '__DYNAMIC__',
        dynamicContentMarker: '__CONTENT__',
      },
    },
  });
}
