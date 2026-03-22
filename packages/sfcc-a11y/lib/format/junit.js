'use strict';

const path = require('path');
const { wcagMap } = require('eslint-plugin-sfcc-a11y');

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats ESLint results as JUnit XML.
 * One <testsuite> per file; each violation becomes a <testcase> with a <failure>.
 * Clean files produce a single passing <testcase> (no <failure> child).
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
function formatJunit(results) {
  let totalTests = 0;
  let totalFailures = 0;
  let suiteXml = '';

  for (const result of results) {
    const file = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    const msgs = result.messages;
    const tests = Math.max(msgs.length, 1);
    const failures = msgs.length;
    totalTests += tests;
    totalFailures += failures;

    let casesXml = '';
    if (msgs.length === 0) {
      casesXml = `    <testcase name="${escXml(file)}" classname="${escXml(file)}"/>\n`;
    } else {
      for (const msg of msgs) {
        const rule = msg.ruleId ?? '';
        const wcag = rule && wcagMap[rule] ? ` [${wcagMap[rule]}]` : '';
        const type = msg.severity === 2 ? 'error' : 'warning';
        const detail = `${msg.message}  ${rule}${wcag} (${file}:${msg.line}:${msg.column})`;
        casesXml +=
          `    <testcase name="${escXml(file)} line ${msg.line}" classname="${escXml(file)}">\n` +
          `      <failure type="${type}" message="${escXml(detail)}">${escXml(detail)}</failure>\n` +
          `    </testcase>\n`;
      }
    }

    suiteXml +=
      `  <testsuite name="${escXml(file)}" tests="${tests}" failures="${failures}" errors="0" time="0">\n` +
      casesXml +
      `  </testsuite>\n`;
  }

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<testsuites tests="${totalTests}" failures="${totalFailures}" errors="0" time="0">\n` +
    suiteXml +
    '</testsuites>\n'
  );
}

module.exports = { formatJunit };
