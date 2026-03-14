import { describe, it, expect } from 'vitest';
import { formatGithub } from '../../lib/format/github.js';

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

describe('formatGithub()', () => {
  it('produces a ::warning annotation', () => {
    const out = formatGithub([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    expect(out).toMatch(/^::warning /);
    expect(out).toContain('file=a.isml');
    expect(out).toContain('line=12');
    expect(out).toContain('col=5');
    expect(out).toContain('sfcc-a11y/img-alt');
    expect(out).toContain('[WCAG 1.1.1]');
  });

  it('produces a ::error annotation for severity 2', () => {
    const out = formatGithub([makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 })])]);
    expect(out).toMatch(/^::error /);
  });

  it('includes endLine and endColumn when present', () => {
    const out = formatGithub([
      makeResult(process.cwd() + '/a.isml', [msg({ endLine: 12, endColumn: 20 })]),
    ]);
    expect(out).toContain('endLine=12');
    expect(out).toContain('endColumn=20');
  });

  it('omits endLine/endColumn when absent', () => {
    const out = formatGithub([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    expect(out).not.toContain('endLine');
  });

  it('returns empty string for clean results', () => {
    const out = formatGithub([makeResult('/abs/valid.isml', [])]);
    expect(out).toBe('');
  });

  it('handles null ruleId — no rule reference in annotation', () => {
    const out = formatGithub([makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null })])]);
    // no "(rule)" part when ruleId is null
    expect(out).not.toContain('(sfcc-a11y');
    expect(out).not.toContain('[WCAG');
    expect(out).toMatch(/^::warning /);
  });
});
