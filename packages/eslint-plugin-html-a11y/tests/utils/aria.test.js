import { describe, it, expect } from 'vitest';
import {
  isValidAriaRole,
  isValidAriaProp,
  getAriaPropType,
  getRequiredPropsForRole,
  isAbstractRole,
} from '../../lib/utils/aria.js';

describe('isValidAriaRole', () => {
  it('returns true for valid ARIA roles', () => {
    expect(isValidAriaRole('button')).toBe(true);
    expect(isValidAriaRole('navigation')).toBe(true);
    expect(isValidAriaRole('dialog')).toBe(true);
  });

  it('returns false for invalid roles', () => {
    expect(isValidAriaRole('fake-role')).toBe(false);
    expect(isValidAriaRole('')).toBe(false);
  });
});

describe('isValidAriaProp', () => {
  it('returns true for valid ARIA properties', () => {
    expect(isValidAriaProp('aria-label')).toBe(true);
    expect(isValidAriaProp('aria-hidden')).toBe(true);
  });

  it('returns false for invalid or misspelled properties', () => {
    expect(isValidAriaProp('aria-fake')).toBe(false);
    expect(isValidAriaProp('aria-labeledby')).toBe(false);
  });
});

describe('getAriaPropType', () => {
  it('returns the type definition for a known prop', () => {
    const def = getAriaPropType('aria-hidden');
    expect(def.type).toBe('boolean');
  });

  it('returns undefined for an unknown prop', () => {
    expect(getAriaPropType('aria-nonexistent')).toBeUndefined();
  });
});

describe('getRequiredPropsForRole', () => {
  it('returns required props for a role that has them', () => {
    const required = getRequiredPropsForRole('checkbox');
    expect(required).toContain('aria-checked');
  });

  it('returns an empty array for a role with no required props', () => {
    expect(getRequiredPropsForRole('button')).toEqual([]);
  });

  it('returns an empty array for an unknown role', () => {
    expect(getRequiredPropsForRole('not-a-role')).toEqual([]);
  });
});

describe('isAbstractRole', () => {
  it('returns true for abstract roles', () => {
    expect(isAbstractRole('widget')).toBe(true);
    expect(isAbstractRole('landmark')).toBe(true);
  });

  it('returns false for concrete (usable) roles', () => {
    expect(isAbstractRole('button')).toBe(false);
    expect(isAbstractRole('navigation')).toBe(false);
  });

  it('returns false for roles not in the ARIA spec', () => {
    expect(isAbstractRole('not-a-real-role')).toBe(false);
  });
});
