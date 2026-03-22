import { describe, it, expect } from 'vitest';
import { formatSarif } from '../../lib/format/sarif.js';

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

describe('formatSarif()', () => {
  it('returns valid JSON with SARIF 2.1.0 structure', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const sarif = JSON.parse(out);
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.$schema).toContain('sarif-2.1.0');
    expect(Array.isArray(sarif.runs)).toBe(true);
    expect(sarif.runs).toHaveLength(1);
  });

  it('populates tool.driver with name and version', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const { driver } = JSON.parse(out).runs[0].tool;
    expect(driver.name).toBe('sfcc-a11y');
    expect(typeof driver.version).toBe('string');
    expect(driver.version).toMatch(/^\d+\.\d+/);
  });

  it('includes used rules in tool.driver.rules', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const { rules } = JSON.parse(out).runs[0].tool.driver;
    expect(rules).toHaveLength(1);
    expect(rules[0].id).toBe('sfcc-a11y/img-alt');
    expect(rules[0].name).toBe('img-alt');
    expect(rules[0].shortDescription.text).toBeTruthy();
    expect(rules[0].help.text).toContain('WCAG 1.1.1');
  });

  it('produces a result entry with correct level, location, ruleIndex, and fingerprint', () => {
    const out = formatSarif([makeResult(process.cwd() + '/foo/bar.isml', [msg({})])]);
    const [result] = JSON.parse(out).runs[0].results;
    expect(result.ruleId).toBe('sfcc-a11y/img-alt');
    expect(result.ruleIndex).toBe(0);
    expect(result.level).toBe('warning');
    expect(result.message.text).toBe('img element must have an alt attribute');
    expect(result.partialFingerprints['primary/v1']).toContain('sfcc-a11y/img-alt');
    expect(result.partialFingerprints['primary/v1']).toContain('foo/bar.isml');
    const loc = result.locations[0].physicalLocation;
    expect(loc.artifactLocation.uri).toBe('foo/bar.isml');
    expect(loc.artifactLocation.uriBaseId).toBe('%SRCROOT%');
    expect(loc.region.startLine).toBe(12);
    expect(loc.region.startColumn).toBe(5);
  });

  it('uses level "error" for severity 2', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({ severity: 2 })])]);
    const [result] = JSON.parse(out).runs[0].results;
    expect(result.level).toBe('error');
  });

  it('includes endLine and endColumn when present', () => {
    const out = formatSarif([
      makeResult(process.cwd() + '/a.isml', [msg({ endLine: 12, endColumn: 20 })]),
    ]);
    const region = JSON.parse(out).runs[0].results[0].locations[0].physicalLocation.region;
    expect(region.endLine).toBe(12);
    expect(region.endColumn).toBe(20);
  });

  it('omits endLine/endColumn when absent', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({})])]);
    const region = JSON.parse(out).runs[0].results[0].locations[0].physicalLocation.region;
    expect(region.endLine).toBeUndefined();
    expect(region.endColumn).toBeUndefined();
  });

  it('omits ruleId from result and help from rule for unknown rules', () => {
    const out = formatSarif([
      makeResult(process.cwd() + '/a.isml', [msg({ ruleId: 'some/unknown' })]),
    ]);
    const sarif = JSON.parse(out);
    // unknown rule — still added to rules with generic description
    const rule = sarif.runs[0].tool.driver.rules[0];
    expect(rule.id).toBe('some/unknown');
    expect(rule.help).toBeUndefined();
    // result still has ruleId
    expect(sarif.runs[0].results[0].ruleId).toBe('some/unknown');
  });

  it('omits ruleId and ruleIndex from result when ruleId is null', () => {
    const out = formatSarif([makeResult(process.cwd() + '/a.isml', [msg({ ruleId: null })])]);
    const sarif = JSON.parse(out);
    const result = sarif.runs[0].results[0];
    expect(result.ruleId).toBeUndefined();
    expect(result.ruleIndex).toBeUndefined();
    expect(result.partialFingerprints['primary/v1']).toContain(':a.isml:12:5');
    expect(sarif.runs[0].tool.driver.rules).toHaveLength(0);
  });

  it('returns empty results array for clean files', () => {
    const out = formatSarif([makeResult('/abs/valid.isml', [])]);
    const sarif = JSON.parse(out);
    expect(sarif.runs[0].results).toHaveLength(0);
    expect(sarif.runs[0].tool.driver.rules).toHaveLength(0);
  });

  it('de-duplicates rules across multiple violations of the same rule', () => {
    const out = formatSarif([
      makeResult(process.cwd() + '/a.isml', [msg({}), msg({ line: 20 })]),
    ]);
    const { rules } = JSON.parse(out).runs[0].tool.driver;
    expect(rules).toHaveLength(1);
  });
});
