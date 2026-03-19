import { describe, it, expect } from 'vitest';
import plugin, { rules, wcagMap, wcagLevelMap, buildRules, sanitize, xmlProcessor } from '../index.js';

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
    // Entry [0] is the ISML processor entry; entry [1] is the virtual HTML entry with settings
    const sanitizedHtmlConfig = plugin.configs['flat/recommended'][1];
    expect(sanitizedHtmlConfig.settings?.['html-a11y']?.dynamicValueMarker).toBe('__ISML_EXPR__');
    expect(sanitizedHtmlConfig.settings?.['html-a11y']?.dynamicContentMarker).toBe('__ISML_CONTENT__');
  });
});

describe('wcagLevelMap', () => {
  it('exports wcagLevelMap with one entry per rule', () => {
    expect(typeof wcagLevelMap).toBe('object');
    expect(Object.keys(wcagLevelMap).length).toBe(Object.keys(rules).length);
  });

  it('autocomplete-valid and heading-has-content are Level AA', () => {
    expect(wcagLevelMap['sfcc-a11y/autocomplete-valid']).toBe('AA');
    expect(wcagLevelMap['sfcc-a11y/heading-has-content']).toBe('AA');
  });

  it('all other rules are Level A', () => {
    for (const [key, level] of Object.entries(wcagLevelMap)) {
      if (key !== 'sfcc-a11y/autocomplete-valid' && key !== 'sfcc-a11y/heading-has-content') {
        expect(level).toBe('A');
      }
    }
  });

  it('every rule has a defined level (no undefined)', () => {
    for (const [name, rule] of Object.entries(rules)) {
      expect(rule.meta?.docs?.level, `${name} missing meta.docs.level`).toMatch(/^A{1,3}$/);
    }
  });
});

describe('buildRules()', () => {
  const totalRules = Object.keys(rules).length;

  it('default (no args) returns all rules at warn', () => {
    const result = buildRules();
    expect(Object.keys(result).length).toBe(totalRules);
    expect(Object.values(result).every((v) => v === 'warn')).toBe(true);
  });

  it('level A returns 2 fewer rules than default', () => {
    const result = buildRules({ level: 'A' });
    expect(Object.keys(result).length).toBe(totalRules - 2);
    expect(result['sfcc-a11y/autocomplete-valid']).toBeUndefined();
    expect(result['sfcc-a11y/heading-has-content']).toBeUndefined();
    expect(result['sfcc-a11y/img-alt']).toBe('warn');
  });

  it('severity error sets all rules to error', () => {
    const result = buildRules({ severity: 'error' });
    expect(Object.values(result).every((v) => v === 'error')).toBe(true);
  });

  it('per-rule override raises specific rule to error', () => {
    const result = buildRules({ rules: { 'img-alt': 'error' } });
    expect(result['sfcc-a11y/img-alt']).toBe('error');
    expect(result['sfcc-a11y/button-name']).toBe('warn');
  });

  it('per-rule override can turn off a specific rule', () => {
    const result = buildRules({ rules: { 'img-alt': 'off' } });
    expect(result['sfcc-a11y/img-alt']).toBe('off');
  });

  it('per-rule override uses unprefixed names', () => {
    const result = buildRules({ rules: { 'sfcc-a11y/img-alt': 'error' } });
    // prefixed key has no effect — img-alt stays at default warn
    expect(result['sfcc-a11y/img-alt']).toBe('warn');
  });
});

describe('level-A configs', () => {
  const totalRules = Object.keys(rules).length;

  it('flat/recommended-a has 4 entries', () => {
    expect(plugin.configs['flat/recommended-a']).toHaveLength(4);
  });

  it('flat/recommended-a virtual HTML entries have N-2 rules', () => {
    const entry1 = plugin.configs['flat/recommended-a'][1];
    const entry3 = plugin.configs['flat/recommended-a'][3];
    expect(Object.keys(entry1.rules).length).toBe(totalRules - 2);
    expect(Object.keys(entry3.rules).length).toBe(totalRules - 2);
  });

  it('flat/recommended-a excludes AA rules', () => {
    const entry1 = plugin.configs['flat/recommended-a'][1];
    expect(entry1.rules['sfcc-a11y/autocomplete-valid']).toBeUndefined();
    expect(entry1.rules['sfcc-a11y/heading-has-content']).toBeUndefined();
  });

  it('recommended-a has N-2 rules at root level', () => {
    expect(Object.keys(plugin.configs['recommended-a'].rules).length).toBe(totalRules - 2);
    expect(plugin.configs['recommended-a'].rules['sfcc-a11y/autocomplete-valid']).toBeUndefined();
  });
});
