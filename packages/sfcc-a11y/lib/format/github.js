const path = require('path');
const { wcagMap } = require('eslint-plugin-sfcc-a11y');

/**
 * Formats ESLint results as GitHub Actions workflow commands.
 * @see https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#setting-a-warning-message
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
function formatGithub(results) {
  let output = '';

  for (const result of results) {
    const file = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    for (const msg of result.messages) {
      const level = msg.severity === 2 ? 'error' : 'warning';
      const rule = msg.ruleId ?? '';
      const wcag = rule && wcagMap[rule] ? ` [${wcagMap[rule]}]` : '';

      let loc = `file=${file},line=${msg.line},col=${msg.column}`;
      if (msg.endLine != null) loc += `,endLine=${msg.endLine}`;
      if (msg.endColumn != null) loc += `,endColumn=${msg.endColumn}`;

      const annotation = `${msg.message}${rule ? ` (${rule})` : ''}${wcag}`;
      output += `::${level} ${loc}::${annotation}\n`;
    }
  }

  return output;
}

module.exports = { formatGithub };
