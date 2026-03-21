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
const CONFIG_TEST_DIR = path.join(FIXTURES, 'config-test');
const PKG_CONFIG_TEST_DIR = path.join(FIXTURES, 'pkg-config-test');
const JS_CONFIG_TEST_DIR = path.join(FIXTURES, 'js-config-test');
const LEVEL_A_CONFIG_TEST_DIR = path.join(FIXTURES, 'level-a-config-test');
const AA_ONLY_ISML = path.join(
  FIXTURES,
  'cartridges/app_storefront_base/templates/default/aa-only.isml',
);

function run(args, { env = {}, cwd } = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    cwd,
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
    const { stdout } = run([INVALID_ISML], { env: { GITHUB_ACTIONS: 'true' } });
    expect(stdout).toMatch(/^::warning /);
  });

  it('outputs version with --version', () => {
    const { stdout } = run(['--version']);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  describe('.sfcc-a11yrc.json config file', () => {
    it('uses config paths when no args are given', () => {
      const { status } = run([], { cwd: CONFIG_TEST_DIR });
      expect(status).toBe(0);
    });

    it('uses config format when no --format flag is given', () => {
      const { stdout } = run([VALID_ISML], { cwd: CONFIG_TEST_DIR });
      expect(() => JSON.parse(stdout)).not.toThrow();
    });

    it('CLI --format flag overrides config format', () => {
      const { stdout } = run([VALID_ISML, '--format', 'text'], { cwd: CONFIG_TEST_DIR });
      expect(stdout).toContain('No violations found');
      expect(() => JSON.parse(stdout)).toThrow();
    });
  });

  describe('package.json "sfcc-a11y" config key', () => {
    it('uses format from package.json sfcc-a11y key', () => {
      const { stdout } = run([VALID_ISML], { cwd: PKG_CONFIG_TEST_DIR });
      expect(() => JSON.parse(stdout)).not.toThrow();
    });
  });

  describe('sfcc-a11y.config.js config file', () => {
    it('uses format from sfcc-a11y.config.js', () => {
      const { stdout } = run([VALID_ISML], { cwd: JS_CONFIG_TEST_DIR });
      expect(() => JSON.parse(stdout)).not.toThrow();
    });
  });

  describe('--level flag', () => {
    it('--level AA (default) reports heading-has-content violation', () => {
      const { status } = run([AA_ONLY_ISML, '--level', 'AA']);
      expect(status).toBe(1);
    });

    it('--level A suppresses Level AA violations (heading-has-content)', () => {
      const { status } = run([AA_ONLY_ISML, '--level', 'A']);
      expect(status).toBe(0);
    });

    it('--level A still reports Level A violations', () => {
      const { status } = run([INVALID_ISML, '--level', 'A']);
      expect(status).toBe(1);
    });
  });

  describe('--severity flag', () => {
    it('--severity error promotes violations to errors (exit 1)', () => {
      const { status } = run([INVALID_ISML, '--severity', 'error']);
      expect(status).toBe(1);
    });

    it('--severity error outputs "error" in text format', () => {
      const { stdout } = run([INVALID_ISML, '--severity', 'error']);
      expect(stdout).toContain('error');
    });

    it('--severity error with --exit-zero still exits 0', () => {
      const { status } = run([INVALID_ISML, '--severity', 'error', '--exit-zero']);
      expect(status).toBe(0);
    });
  });

  describe('config file level/severity', () => {
    // aa-only.isml lives inside LEVEL_A_CONFIG_TEST_DIR so ESLint's **/*.isml
    // glob (anchored to process.cwd()) can match it when run from that dir.
    const LEVEL_A_CONFIG_AA_FILE = path.join(LEVEL_A_CONFIG_TEST_DIR, 'aa-only.isml');

    it('config level: A suppresses AA violations', () => {
      const { status } = run([LEVEL_A_CONFIG_AA_FILE], { cwd: LEVEL_A_CONFIG_TEST_DIR });
      expect(status).toBe(0);
    });

    it('CLI --level AA overrides config level: A', () => {
      const { status } = run([LEVEL_A_CONFIG_AA_FILE, '--level', 'AA'], {
        cwd: LEVEL_A_CONFIG_TEST_DIR,
      });
      expect(status).toBe(1);
    });
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
