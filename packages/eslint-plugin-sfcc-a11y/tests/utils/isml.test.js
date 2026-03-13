import { describe, it, expect } from 'vitest';
import { EXPR_SENTINEL, CONTENT_SENTINEL } from '../../lib/utils/isml.js';

describe('sentinels', () => {
  it('exports the EXPR_SENTINEL string', () => {
    expect(typeof EXPR_SENTINEL).toBe('string');
    expect(EXPR_SENTINEL.length).toBeGreaterThan(0);
  });

  it('exports the CONTENT_SENTINEL string', () => {
    expect(typeof CONTENT_SENTINEL).toBe('string');
    expect(CONTENT_SENTINEL.length).toBeGreaterThan(0);
  });

  it('sentinels are distinct', () => {
    expect(EXPR_SENTINEL).not.toBe(CONTENT_SENTINEL);
  });
});
