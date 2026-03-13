/**
 * ISML Sanitizer
 *
 * Transforms ISML template source into valid HTML that @html-eslint/parser can
 * parse without errors.
 *
 * Key guarantee: the number of lines (newline characters) in the output always
 * equals the number of lines in the input. This means ESLint error line numbers
 * map correctly back to the original ISML source. Column numbers within a line
 * may shift slightly when expression text is removed.
 *
 * Replacements applied, in order:
 *   1. <isprint value="..."> → "__ISML_CONTENT__" (sentinel text node)
 *   2. ${...} and {{...}} expressions inside attribute values are stripped;
 *      fully-dynamic values become "__ISML_EXPR__"
 *   3. Remaining {{...}} Mustache/Handlebars expressions in text content →
 *      "__ISML_CONTENT__" so rules treat nodes as having content
 *   4. Remaining <is*> open / close / self-closing tags → same-length spaces,
 *      with newlines inside multi-line tags preserved in place
 */

import { EXPR_SENTINEL, CONTENT_SENTINEL } from '../utils/isml.js';

/**
 * Sanitizes ISML source text so it can be parsed as HTML.
 * @param {string} source  Raw ISML file contents
 * @returns {string}  Sanitized HTML-compatible source
 */
export function sanitize(source) {
  let result = source;

  // Step 1 — ISML tags that emit visible content → content sentinel.
  // The sentinel becomes a plain text node; rules treat it as "has content".
  // <isprint> outputs a value expression.
  // <ispicture> and <iscontentasset> render as <img> / HTML at runtime — replacing
  // them with the sentinel prevents false positives on wrapping <a> or heading rules.
  result = result.replace(/<isprint\b[^>]*\/?>/gi, CONTENT_SENTINEL);
  result = result.replace(/<ispicture\b[^>]*\/?>/gi, CONTENT_SENTINEL);
  result = result.replace(/<iscontentasset\b[^>]*\/?>/gi, CONTENT_SENTINEL);

  // Step 2 — Strip ${...} and {{...}} expressions from inside attribute values.
  // If the entire inner value was dynamic the attribute becomes __ISML_EXPR__.
  // Newlines inside attribute values are preserved to maintain line count.
  // {{...}} covers Mustache/Handlebars hybrid templates (e.g. the /m/ subdir and
  // any template that embeds a client-side templating engine).
  result = result.replace(/(?<==)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (quotedValue) => {
    if (!quotedValue.includes('${') && !quotedValue.includes('{{')) return quotedValue;
    const quote = quotedValue[0];
    const inner = quotedValue.slice(1, -1);
    const stripped = inner
      .replace(/\$\{[^}]*\}/g, '') // ISML/JS template expressions
      .replace(/\{\{[^}]*?\}\}/g, ''); // Mustache expressions (incl. triple-stache)
    if (stripped.trim() === '') {
      // Preserve any newlines that were in the original value
      const preservedNewlines = (inner.match(/\n/g) || []).join('');
      return `${quote}${EXPR_SENTINEL}${preservedNewlines}${quote}`;
    }
    return `${quote}${stripped}${quote}`;
  });

  // Step 3 — Replace remaining {{...}} Mustache expressions in text content.
  // Block/partial/comment helpers ({{#...}}, {{/...}}, {{>...}}, {{!...}}) render
  // no visible output → replace with spaces to preserve line structure.
  // Value expressions ({{expr}} and {{{unescaped}}}) render text → CONTENT_SENTINEL
  // so rules like link-name and heading-has-content see the node as non-empty.
  result = result.replace(/\{\{[#^/>!][^}]*?\}\}/g, (m) => m.replace(/[^\n]/g, ' '));
  result = result.replace(/\{\{[^}]*?\}\}/g, CONTENT_SENTINEL);

  // Step 5 — Replace all remaining <is*> tags (standalone or embedded in
  // attribute values) with spaces of the same length.
  // Non-newline characters become spaces; newlines are kept so line count is
  // preserved even when an ISML tag spans multiple lines.
  result = result.replace(/<\/?is[a-z][^>]*\/?>/gi, (match) => match.replace(/[^\n]/g, ' '));

  return result;
}
