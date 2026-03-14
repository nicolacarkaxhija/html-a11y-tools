#!/usr/bin/env node
/* c8 ignore file -- entry point tested via subprocess in bin.test.js */

import { createRequire } from 'module';
import { Command } from 'commander';
import { lint } from '../lib/linter.js';
import { formatText } from '../lib/format/text.js';
import { formatJson } from '../lib/format/json.js';
import { formatGithub } from '../lib/format/github.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const DEFAULT_GLOBS = ['**/*.isml', '**/libraries/**/*.xml'];

const defaultFormat = process.env.GITHUB_ACTIONS === 'true' ? 'github' : 'text';

const program = new Command();
program
  .name('sfcc-a11y')
  .description('Zero-config WCAG accessibility checker for SFCC ISML and XML files')
  .version(version)
  .argument('[paths...]', 'Files, directories, or globs to check (default: cwd)')
  .option('-f, --format <format>', 'Output format: text, json, github', defaultFormat)
  .option('--exit-zero', 'Always exit with code 0, even when violations are found')
  .action(async (paths, opts) => {
    try {
      const patterns = paths.length ? paths : DEFAULT_GLOBS;
      const results = await lint(patterns);
      const total = results.reduce((sum, r) => sum + r.errorCount + r.warningCount, 0);

      let output;
      if (opts.format === 'json') {
        output = formatJson(results);
      } else if (opts.format === 'github') {
        output = formatGithub(results);
      } else {
        output = formatText(results);
      }

      process.stdout.write(output);

      if (!opts.exitZero && total > 0) process.exit(1);
    } catch (err) {
      process.stderr.write(`sfcc-a11y: ${err.message}\n`);
      process.exit(2);
    }
  });

program.parse();
