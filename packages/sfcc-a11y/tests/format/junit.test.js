import { describe, it, expect } from 'vitest';
import { formatJunit } from '../../lib/format/junit.js';

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

describe('formatJunit()', () => {
  it('returns valid XML with declaration and testsuites root', () => {
    const out = formatJunit([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    expect(out).toMatch(/^<\?xml version="1\.0"/);
    expect(out).toContain('<testsuites');
    expect(out).toContain('</testsuites>');
  });

  it('produces a testsuite per file with failure for a violation', () => {
    const out = formatJunit([makeResult(process.cwd() + '/foo/bar.isml', [msg({})])]);
    expect(out).toContain('<testsuite name="foo/bar.isml"');
    expect(out).toContain('<failure type="warning"');
    expect(out).toContain('sfcc-a11y/img-alt');
    expect(out).toContain('[WCAG 1.1.1]');
    expect(out).toContain('foo/bar.isml line 12');
  });

  it('uses failure type="error" for severity 2', () => {
    const out = formatJunit([makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 })])]);
    expect(out).toContain('type="error"');
  });

  it('produces a passing testcase (no failure) for clean files', () => {
    const out = formatJunit([makeResult(process.cwd() + '/clean.isml', [])]);
    expect(out).toContain('<testcase name="clean.isml"');
    expect(out).not.toContain('<failure');
    expect(out).toContain('failures="0"');
  });

  it('totals reflect all files', () => {
    const out = formatJunit([
      makeResult(process.cwd() + '/a.isml', [msg({}), msg({})]),
      makeResult(process.cwd() + '/clean.isml', []),
    ]);
    // 2 violations + 1 passing testcase = 3 tests, 2 failures
    expect(out).toContain('tests="3"');
    expect(out).toContain('failures="2"');
  });

  it('escapes XML special characters in messages', () => {
    const out = formatJunit([
      makeResult(process.cwd() + '/a.isml', [msg({ message: '<img> & "alt" missing' })]),
    ]);
    expect(out).toContain('&lt;img&gt; &amp; &quot;alt&quot; missing');
    expect(out).not.toContain('<img>');
  });

  it('omits WCAG ref for unknown rules', () => {
    const out = formatJunit([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: 'some/unknown' })]),
    ]);
    expect(out).not.toContain('[WCAG');
  });

  it('handles null ruleId', () => {
    const out = formatJunit([makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null })])]);
    expect(out).toContain('<failure');
  });

  it('returns empty testsuites element for empty results array', () => {
    const out = formatJunit([]);
    expect(out).toContain('tests="0"');
    expect(out).toContain('failures="0"');
    expect(out).not.toContain('<testsuite ');
  });
});
