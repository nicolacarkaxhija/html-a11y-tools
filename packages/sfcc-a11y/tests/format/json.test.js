import { describe, it, expect } from 'vitest';
import { formatJson } from '../../lib/format/json.js';

const makeResult = (filePath, messages) => ({
  filePath,
  messages,
  errorCount: messages.filter((m) => m.severity === 2).length,
  warningCount: messages.filter((m) => m.severity === 1).length,
});

const msg = (overrides) => ({
  severity: 1,
  line: 12,
  column: 5,
  message: 'img element must have an alt attribute',
  ruleId: 'sfcc-a11y/img-alt',
  ...overrides,
});

describe('formatJson()', () => {
  it('returns valid JSON array', () => {
    const out = formatJson([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const parsed = JSON.parse(out);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });

  it('includes all required fields', () => {
    const out = formatJson([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const [item] = JSON.parse(out);
    expect(item).toMatchObject({
      file: 'a.isml',
      line: 12,
      col: 5,
      severity: 'warning',
      message: 'img element must have an alt attribute',
      rule: 'sfcc-a11y/img-alt',
      wcag: 'WCAG 1.1.1',
    });
  });

  it('returns empty array for clean results', () => {
    const out = formatJson([makeResult('/abs/valid.isml', [])]);
    expect(JSON.parse(out)).toEqual([]);
  });

  it('omits wcag field for unknown rules', () => {
    const out = formatJson([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: 'some/other' })]),
    ]);
    const [item] = JSON.parse(out);
    expect(item.wcag).toBeUndefined();
    expect(item.rule).toBe('some/other');
  });

  it('handles null ruleId', () => {
    const out = formatJson([makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null })])]);
    const [item] = JSON.parse(out);
    expect(item.rule).toBe('');
    expect(item.wcag).toBeUndefined();
  });

  it('falls back to warning for unknown severity', () => {
    const out = formatJson([makeResult(process.cwd() + '/a.isml', [msg({ severity: 99 })])]);
    const [item] = JSON.parse(out);
    expect(item.severity).toBe('warning');
  });
});
