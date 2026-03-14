import { describe, it, expect } from 'vitest';
import { formatText } from '../../lib/format/text.js';

const makeResult = (filePath, messages) => ({
  filePath,
  messages,
  errorCount: messages.filter((m) => m.severity === 2).length,
  warningCount: messages.filter((m) => m.severity === 1).length,
});

const msg = (overrides) => ({
  severity: 1,
  line: 10,
  column: 5,
  message: 'img element must have an alt attribute',
  ruleId: 'sfcc-a11y/img-alt',
  endLine: 10,
  endColumn: 20,
  ...overrides,
});

describe('formatText()', () => {
  it('skips results with no messages', () => {
    const out = formatText([makeResult('/abs/path/valid.isml', [])]);
    expect(out).not.toContain('valid.isml');
    expect(out).toContain('No violations found.');
  });

  it('includes relative path, location, severity, message, rule, and WCAG ref', () => {
    const out = formatText([makeResult(process.cwd() + '/foo/bar.isml', [msg({})])]);
    expect(out).toContain('foo/bar.isml');
    expect(out).toContain('10:5');
    expect(out).toContain('warning');
    expect(out).toContain('img element must have an alt attribute');
    expect(out).toContain('sfcc-a11y/img-alt');
    expect(out).toContain('[WCAG 1.1.1]');
  });

  it('shows correct totals', () => {
    const out = formatText([
      makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 }), msg({ severity: 1 })]),
    ]);
    expect(out).toContain('1 error');
    expect(out).toContain('1 warning');
  });

  it('omits WCAG ref for unknown rules', () => {
    const out = formatText([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: 'some/unknown-rule' })]),
    ]);
    expect(out).not.toContain('[WCAG');
  });

  it('handles null ruleId (parser errors)', () => {
    const out = formatText([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null, severity: 2 })]),
    ]);
    expect(out).toContain('1 error');
  });

  it('shows only error count when no warnings', () => {
    const out = formatText([makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 })])]);
    expect(out).toContain('1 error');
    expect(out).not.toContain('warning');
  });

  it('shows only warning count when no errors', () => {
    const out = formatText([makeResult(process.cwd() + '/a.isml', [msg({ severity: 1 })])]);
    expect(out).toContain('1 warning');
    expect(out).not.toContain('error');
  });

  it('uses plural errors and warnings for counts > 1', () => {
    const out = formatText([
      makeResult(process.cwd() + '/a.isml', [
        msg({ severity: 2 }),
        msg({ severity: 2 }),
        msg({ severity: 1 }),
        msg({ severity: 1 }),
      ]),
    ]);
    expect(out).toContain('2 errors');
    expect(out).toContain('2 warnings');
  });

  it('falls back to warning for unknown severity', () => {
    const out = formatText([makeResult(process.cwd() + '/a.isml', [msg({ severity: 99 })])]);
    expect(out).toContain('warning');
  });
});
