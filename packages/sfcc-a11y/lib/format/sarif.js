'use strict';

const path = require('path');
const { rules } = require('eslint-plugin-sfcc-a11y');

/**
 * Formats ESLint results as SARIF 2.1.0 (Static Analysis Results Interchange Format).
 * Compatible with GitHub Advanced Security code scanning and VS Code SARIF viewer.
 * @see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 *
 * @param {import('eslint').ESLint.LintResult[]} results
 * @returns {string}
 */
function formatSarif(results) {
  // Collect rule IDs that actually appear in results (only populate used rules)
  const ruleIdsUsed = new Set();
  for (const result of results) {
    for (const msg of result.messages) {
      if (msg.ruleId) ruleIdsUsed.add(msg.ruleId);
    }
  }

  // Build an index map for ruleIndex references in result entries
  const ruleIdToIndex = new Map([...ruleIdsUsed].map((id, i) => [id, i]));

  // Build SARIF rule descriptors from plugin metadata
  const sarifRules = [...ruleIdsUsed].map((ruleId) => {
    const shortName = ruleId.replace(/^sfcc-a11y\//, '');
    const rule = rules[shortName];
    const description = rule?.meta?.docs?.description ?? ruleId;
    const wcag = rule?.meta?.docs?.wcag ? `WCAG ${rule.meta.docs.wcag}` : undefined;
    return {
      id: ruleId,
      name: shortName,
      shortDescription: { text: description },
      ...(wcag ? { help: { text: wcag } } : {}),
    };
  });

  // Build SARIF result entries
  const sarifResults = [];
  for (const result of results) {
    const uri = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/');
    for (const msg of result.messages) {
      const level = msg.severity === 2 ? 'error' : 'warning';
      const region = {
        startLine: msg.line,
        startColumn: msg.column,
        ...(msg.endLine != null ? { endLine: msg.endLine } : {}),
        ...(msg.endColumn != null ? { endColumn: msg.endColumn } : {}),
      };
      // partialFingerprints provide stable result identity across runs for deduplication
      const fingerprint = `${msg.ruleId ?? ''}:${uri}:${msg.line}:${msg.column}`;
      sarifResults.push({
        ...(msg.ruleId
          ? { ruleId: msg.ruleId, ruleIndex: ruleIdToIndex.get(msg.ruleId) }
          : {}),
        level,
        message: { text: msg.message },
        partialFingerprints: { 'primary/v1': fingerprint },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri, uriBaseId: '%SRCROOT%' },
              region,
            },
          },
        ],
      });
    }
  }

  const toolVersion = require('../../package.json').version;

  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'sfcc-a11y',
            version: toolVersion,
            informationUri: 'https://github.com/nicolacarkaxhija/html-a11y-tools',
            rules: sarifRules,
          },
        },
        results: sarifResults,
      },
    ],
  };

  return JSON.stringify(sarif, null, 2) + '\n';
}

module.exports = { formatSarif };
