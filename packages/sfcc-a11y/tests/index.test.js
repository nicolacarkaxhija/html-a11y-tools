import { describe, it, expect } from 'vitest';
import { lint } from '../index.js';

describe('programmatic API (index.js)', () => {
  it('exports a lint function', () => {
    expect(typeof lint).toBe('function');
  });

  it('lint() returns an array of ESLint results', async () => {
    const results = await lint(['**/no-such-files-exist-here/**/*.isml']);
    expect(Array.isArray(results)).toBe(true);
  });
});
