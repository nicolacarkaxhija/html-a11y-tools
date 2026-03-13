import { describe, it, expect } from 'vitest';
import plugin, { rules, wcagMap, sanitize, xmlProcessor } from '../index.js';

describe('eslint-plugin-sfcc-a11y index', () => {
  it('exports rules from eslint-plugin-html-a11y', () => {
    expect(typeof rules).toBe('object');
    expect(Object.keys(rules).length).toBeGreaterThan(0);
    expect(rules['img-alt']).toBeDefined();
    expect(rules['button-name']).toBeDefined();
  });

  it('exports wcagMap computed from rule meta', () => {
    expect(typeof wcagMap).toBe('object');
    expect(Object.keys(wcagMap).length).toBeGreaterThan(0);
    expect(wcagMap['sfcc-a11y/img-alt']).toMatch(/^WCAG /);
    expect(wcagMap['sfcc-a11y/button-name']).toMatch(/^WCAG /);
  });

  it('wcagMap covers all rules that have meta.docs.wcag', () => {
    for (const [name, rule] of Object.entries(rules)) {
      if (rule.meta?.docs?.wcag) {
        expect(wcagMap[`sfcc-a11y/${name}`]).toBeDefined();
      }
    }
  });

  it('exports the sanitize function', () => {
    expect(typeof sanitize).toBe('function');
  });

  it('exports the xmlProcessor object', () => {
    expect(typeof xmlProcessor).toBe('object');
    expect(typeof xmlProcessor.preprocess).toBe('function');
    expect(typeof xmlProcessor.postprocess).toBe('function');
  });

  it('default export is the plugin object with rules and configs', () => {
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs['flat/recommended']).toBeDefined();
    expect(Array.isArray(plugin.configs['flat/recommended'])).toBe(true);
  });

  it('flat/recommended config sets ISML sentinel settings', () => {
    const ismlConfig = plugin.configs['flat/recommended'][0];
    expect(ismlConfig.settings?.['html-a11y']?.dynamicValueMarker).toBe('__ISML_EXPR__');
    expect(ismlConfig.settings?.['html-a11y']?.dynamicContentMarker).toBe('__ISML_CONTENT__');
  });
});
