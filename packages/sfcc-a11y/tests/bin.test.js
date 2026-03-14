import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(__dirname, '..', 'bin', 'sfcc-a11y.js');
const FIXTURES = path.join(__dirname, 'fixtures');
const VALID_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/valid.isml',
);
const INVALID_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/invalid.isml',
);

function run(args, env = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('bin/sfcc-a11y.js', () => {
  it('exits 0 for a clean file', () => {
    const { status } = run([VALID_ISML]);
    expect(status).toBe(0);
  });

  it('exits 1 when violations are found', () => {
    const { status } = run([INVALID_ISML]);
    expect(status).toBe(1);
  });

  it('exits 0 with --exit-zero even when violations found', () => {
    const { status } = run([INVALID_ISML, '--exit-zero']);
    expect(status).toBe(0);
  });

  it('outputs text format by default', () => {
    const { stdout } = run([INVALID_ISML]);
    expect(stdout).toContain('warning');
    expect(stdout).toContain('[WCAG');
  });

  it('outputs JSON format with --format json', () => {
    const { stdout } = run([INVALID_ISML, '--format', 'json']);
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('outputs github format with --format github', () => {
    const { stdout } = run([INVALID_ISML, '--format', 'github']);
    expect(stdout).toMatch(/^::warning /);
  });

  it('defaults to github format when GITHUB_ACTIONS=true', () => {
    const { stdout } = run([INVALID_ISML], { GITHUB_ACTIONS: 'true' });
    expect(stdout).toMatch(/^::warning /);
  });

  it('outputs version with --version', () => {
    const { stdout } = run(['--version']);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('exits 2 and writes to stderr on fatal error', () => {
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `
      process.stderr.write('sfcc-a11y: simulated error\\n');
      process.exit(2);
    `,
      ],
      { encoding: 'utf8' },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('simulated error');
  });
});
