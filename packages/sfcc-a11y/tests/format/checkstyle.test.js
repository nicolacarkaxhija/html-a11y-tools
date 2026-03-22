import { describe, it, expect } from 'vitest';
import { formatCheckstyle } from '../../lib/format/checkstyle.js';

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

describe('formatCheckstyle()', () => {
  it('returns valid XML with declaration and checkstyle root', () => {
    const out = formatCheckstyle([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    expect(out).toMatch(/^<\?xml version="1\.0"/);
    expect(out).toContain('<checkstyle version="8.0">');
    expect(out).toContain('</checkstyle>');
  });

  it('emits a file element with error for a violation', () => {
    const out = formatCheckstyle([makeResult(process.cwd() + '/foo/bar.isml', [msg({})])]);
    expect(out).toContain('<file name="foo/bar.isml">');
    expect(out).toContain('line="12"');
    expect(out).toContain('column="5"');
    expect(out).toContain('severity="warning"');
    expect(out).toContain('sfcc-a11y/img-alt');
    expect(out).toContain('[WCAG 1.1.1]');
  });

  it('uses severity="error" for severity 2', () => {
    const out = formatCheckstyle([makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 })])]);
    expect(out).toContain('severity="error"');
  });

  it('omits clean files entirely', () => {
    const out = formatCheckstyle([makeResult(process.cwd() + '/clean.isml', [])]);
    expect(out).not.toContain('<file');
  });

  it('escapes XML special characters in messages', () => {
    const out = formatCheckstyle([
      makeResult(process.cwd() + '/a.isml', [msg({ message: '<img> & "alt" missing' })]),
    ]);
    expect(out).toContain('&lt;img&gt; &amp; &quot;alt&quot; missing');
    expect(out).not.toContain('<img>');
  });

  it('omits WCAG ref for unknown rules', () => {
    const out = formatCheckstyle([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: 'some/unknown' })]),
    ]);
    expect(out).not.toContain('[WCAG');
  });

  it('handles null ruleId — source attribute is empty', () => {
    const out = formatCheckstyle([makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null })])]);
    expect(out).toContain('source=""');
  });

  it('returns empty checkstyle element for all-clean results', () => {
    const out = formatCheckstyle([makeResult('/abs/valid.isml', [])]);
    expect(out).toContain('<checkstyle');
    expect(out).not.toContain('<file');
  });
});
