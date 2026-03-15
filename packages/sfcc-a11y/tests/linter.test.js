import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { lint } from '../lib/linter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');
const INVALID_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/invalid.isml',
);
const VALID_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/valid.isml',
);
const DYNAMIC_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/dynamic.isml',
);
const LIBRARY_XML = path.join(FIXTURES, 'libraries/SiteGenesisSharedLibrary/library.xml');

describe('lint()', () => {
  it('reports violations in invalid.isml', async () => {
    const results = await lint([INVALID_ISML]);
    expect(results).toHaveLength(1);
    const msgs = results[0].messages;
    expect(msgs.length).toBeGreaterThan(0);
    const rules = msgs.map((m) => m.ruleId);
    expect(rules).toContain('sfcc-a11y/img-alt');
    expect(rules).toContain('sfcc-a11y/button-name');
    expect(rules).toContain('sfcc-a11y/anchor-is-valid');
    expect(rules).toContain('sfcc-a11y/label');
  });

  it('does not report violations for ISML dynamic expressions (sentinel pass-through)', async () => {
    // Ensures the sfcc-a11y settings (dynamicValueMarker / dynamicContentMarker) are applied
    // to virtual .html blocks produced by the ISML sanitizer.
    const results = await lint([DYNAMIC_ISML]);
    const total = results.reduce((sum, r) => sum + r.messages.length, 0);
    expect(total).toBe(0);
  });

  it('reports no violations in valid.isml', async () => {
    const results = await lint([VALID_ISML]);
    const total = results.reduce((sum, r) => sum + r.messages.length, 0);
    expect(total).toBe(0);
  });

  it('reports violations in library.xml CDATA blocks', async () => {
    const results = await lint([LIBRARY_XML]);
    const msgs = results.flatMap((r) => r.messages);
    expect(msgs.length).toBeGreaterThan(0);
    const rules = msgs.map((m) => m.ruleId);
    expect(rules).toContain('sfcc-a11y/img-alt');
    expect(rules).toContain('sfcc-a11y/button-name');
  });

  it('returns empty results for a directory with no matching files', async () => {
    const results = await lint(['**/no-such-files-here/**/*.isml']);
    expect(results).toHaveLength(0);
  });

  it('expands a directory argument into ISML + XML globs', async () => {
    const results = await lint([FIXTURES]);
    const filePaths = results.map((r) => r.filePath);
    expect(filePaths.some((p) => p.endsWith('.isml'))).toBe(true);
    const allMessages = results.flatMap((r) => r.messages);
    expect(allMessages.some((m) => m.ruleId === 'sfcc-a11y/img-alt')).toBe(true);
  });
});
