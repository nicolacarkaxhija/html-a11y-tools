const path = require('path');
const { wcagMap, wcagLevelMap } = require('eslint-plugin-sfcc-a11y');

const SEVERITY = ['', 'warning', 'error'];

/**
 * Formats ESLint results as a JSON array.
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
function formatJson(results) {
  const violations = [];

  for (const result of results) {
    const file = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    for (const msg of result.messages) {
      const rule = msg.ruleId ?? '';
      violations.push({
        file,
        line: msg.line,
        col: msg.column,
        severity: SEVERITY[msg.severity] ?? 'warning',
        message: msg.message,
        rule,
        wcag: rule && wcagMap[rule] ? wcagMap[rule] : undefined,
        wcagLevel: rule && wcagLevelMap[rule] ? wcagLevelMap[rule] : undefined,
      });
    }
  }

  return JSON.stringify(violations, null, 2) + '\n';
}

module.exports = { formatJson };
