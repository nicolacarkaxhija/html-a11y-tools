import { describe, it, expect } from 'vitest';
import plugin from '../index.js';

const { buildRules, rules } = plugin;

describe('buildRules()', () => {
  const totalRules = Object.keys(rules).length;

  it('returns all rules at warn by default', () => {
    const result = buildRules();
    expect(Object.keys(result).length).toBe(totalRules);
    expect(result['html-a11y/img-alt']).toBe('warn');
  });

  it('level A excludes AA rules', () => {
    const result = buildRules({ level: 'A' });
    expect(Object.keys(result).length).toBe(totalRules - 2);
    expect(result['html-a11y/autocomplete-valid']).toBeUndefined();
    expect(result['html-a11y/heading-has-content']).toBeUndefined();
  });

  it('severity error sets all rules to error', () => {
    const result = buildRules({ severity: 'error' });
    expect(Object.values(result).every((v) => v === 'error')).toBe(true);
  });

  it('per-rule override sets specific rule', () => {
    const result = buildRules({ rules: { 'img-alt': 'error' } });
    expect(result['html-a11y/img-alt']).toBe('error');
    expect(result['html-a11y/button-name']).toBe('warn');
  });

  it('throws on invalid level', () => {
    expect(() => buildRules({ level: 'INVALID' })).toThrow(/invalid level/);
  });

  it('throws when a prefixed rule key is passed', () => {
    expect(() => buildRules({ rules: { 'html-a11y/img-alt': 'error' } })).toThrow(
      /must not include the plugin prefix/,
    );
  });
});
