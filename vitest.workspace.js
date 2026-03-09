import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/eslint-plugin-html-a11y/vitest.config.js',
  'packages/eslint-plugin-sfcc-a11y/vitest.config.js',
  'packages/sfcc-a11y/vitest.config.js',
]);
