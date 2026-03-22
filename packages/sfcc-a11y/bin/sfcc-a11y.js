#!/usr/bin/env node
/* c8 ignore file -- entry point tested via subprocess in bin.test.js */
'use strict';

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { lint } = require('../lib/linter.js');
const { formatText } = require('../lib/format/text.js');
const { formatJson } = require('../lib/format/json.js');
const { formatGithub } = require('../lib/format/github.js');
const { formatJunit } = require('../lib/format/junit.js');
const { formatSarif } = require('../lib/format/sarif.js');
const { formatCheckstyle } = require('../lib/format/checkstyle.js');

/**
 * Load config from the first source found (cosmiconfig-style):
 *   1. sfcc-a11y.config.js  — programmatic / dynamic config
 *   2. .sfcc-a11yrc.json    — static JSON config
 *   3. package.json         — "sfcc-a11y" key
 * CLI flags always override whatever this returns.
 */
function loadConfig() {
  const cwd = process.cwd();
  try {
    return require(path.join(cwd, 'sfcc-a11y.config.js'));
  } catch {}
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, '.sfcc-a11yrc.json'), 'utf8'));
  } catch {}
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    if (pkg['sfcc-a11y']) return pkg['sfcc-a11y'];
  } catch {}
  return {};
}

const fileConfig = loadConfig();

const DEFAULT_GLOBS = fileConfig.paths ?? ['**/*.isml', '**/libraries/**/*.xml'];

// Precedence: CLI flag > config file > GITHUB_ACTIONS env > 'text'
const envFormat = process.env.GITHUB_ACTIONS === 'true' ? 'github' : 'text';
const defaultFormat = fileConfig.format ?? envFormat;
const defaultLevel = fileConfig.level ?? 'AA';
const defaultSeverity = fileConfig.severity ?? 'warn';

const program = new Command();
program
  .name('sfcc-a11y')
  .description('Zero-config WCAG accessibility checker for SFCC ISML and XML files')
  .version(require('../package.json').version)
  .argument('[paths...]', 'Files, directories, or globs to check (default: cwd)')
  .option('-f, --format <format>', 'Output format: text, json, github, junit, sarif, checkstyle', defaultFormat)
  .option('--level <level>', 'WCAG conformance level ceiling: A, AA, AAA', defaultLevel)
  .option('--severity <severity>', 'Rule severity: warn, error', defaultSeverity)
  .option('--exit-zero', 'Always exit with code 0, even when violations are found')
  .action(async (paths, opts) => {
    try {
      const patterns = paths.length ? paths : DEFAULT_GLOBS;
      const lintConfig = {
        level: opts.level,
        severity: opts.severity,
        // Per-rule overrides come from the config file only — there is no CLI equivalent.
        // Use .sfcc-a11yrc.json "rules": { "img-alt": "error", "html-has-lang": "off" }
        rules: fileConfig.rules,
      };
      const results = await lint(patterns, lintConfig);
      const total = results.reduce((sum, r) => sum + r.errorCount + r.warningCount, 0);

      let output;
      if (opts.format === 'json') {
        output = formatJson(results);
      } else if (opts.format === 'github') {
        output = formatGithub(results);
      } else if (opts.format === 'junit') {
        output = formatJunit(results);
      } else if (opts.format === 'sarif') {
        output = formatSarif(results);
      } else if (opts.format === 'checkstyle') {
        output = formatCheckstyle(results);
      } else {
        output = formatText(results);
      }

      process.stdout.write(output);

      const exitZero = opts.exitZero || fileConfig.exitZero === true;
      if (!exitZero && total > 0) process.exit(1);
    } catch (err) {
      process.stderr.write(`sfcc-a11y: ${err.message}\n`);
      process.exit(2);
    }
  });

program.parse();
