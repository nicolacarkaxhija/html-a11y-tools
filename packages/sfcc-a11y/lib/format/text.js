import path from 'path';
import { wcagMap } from 'eslint-plugin-sfcc-a11y';

const SEVERITY = ['', 'warning', 'error'];

/**
 * Formats ESLint results as human-readable text.
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
export function formatText(results) {
  let output = '';
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    if (result.messages.length === 0) continue;

    const relPath = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    output += `\n${relPath}\n`;

    for (const msg of result.messages) {
      const severity = SEVERITY[msg.severity] ?? 'warning';
      const loc = `${msg.line}:${msg.column}`;
      const rule = msg.ruleId ?? '';
      const wcag = rule && wcagMap[rule] ? `  [${wcagMap[rule]}]` : '';
      output += `  ${loc.padEnd(8)}${severity.padEnd(8)}${msg.message}  ${rule}${wcag}\n`;

      if (msg.severity === 2) totalErrors++;
      else totalWarnings++;
    }
  }

  const parts = [];
  if (totalErrors > 0) parts.push(`${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'}`);
  if (totalWarnings > 0)
    parts.push(`${totalWarnings} ${totalWarnings === 1 ? 'warning' : 'warnings'}`);
  output += parts.length ? `\n${parts.join(', ')}\n` : '\nNo violations found.\n';

  return output;
}
