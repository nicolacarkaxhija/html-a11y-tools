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
 * Formats ESLint results as Checkstyle XML.
 * Only files with violations are emitted; clean files are omitted.
 * @see https://checkstyle.org/
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
function formatCheckstyle(results) {
  let fileXml = '';

  for (const result of results) {
    const file = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    const msgs = result.messages;
    if (msgs.length === 0) continue;

    let errorXml = '';
    for (const msg of msgs) {
      const rule = msg.ruleId ?? '';
      const wcag = rule && wcagMap[rule] ? ` [${wcagMap[rule]}]` : '';
      const severity = msg.severity === 2 ? 'error' : 'warning';
      const message = `${msg.message}${wcag}`;
      errorXml +=
        `    <error line="${msg.line}" column="${msg.column}" severity="${severity}"` +
        ` message="${escXml(message)}" source="${escXml(rule)}"/>\n`;
    }

    fileXml += `  <file name="${escXml(file)}">\n${errorXml}  </file>\n`;
  }

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<checkstyle version="8.0">\n' +
    fileXml +
    '</checkstyle>\n'
  );
}

module.exports = { formatCheckstyle };
