/**
 * ESLint Processor: SFCC XML Content Asset
 *
 * Extracts HTML content from <custom-attribute attribute-id="body"> elements
 * inside SFCC library XML files and maps ESLint error positions back to the
 * original XML source lines.
 *
 * SFCC library XML files store content asset bodies in two formats:
 *
 *   1. CDATA (less common, hand-edited or older exports):
 *      <custom-attribute attribute-id="body"><![CDATA[<p>HTML</p>]]></custom-attribute>
 *
 *   2. XML entity-encoded (standard Business Manager export format):
 *      <custom-attribute attribute-id="body" xml:lang="x-default">&lt;p&gt;HTML&lt;/p&gt;</custom-attribute>
 *
 * ESLint runs accessibility rules on the extracted HTML as virtual files.
 * The processor then offsets error line numbers so they point into the
 * original XML file, not the start of the extracted snippet.
 */

// Module-level state: maps each XML filename to its extracted block metadata so
// postprocess() can look up line offsets by filename.
//
// CONCURRENCY NOTE: ESLint v9 runs file processing serially within a single
// process (no worker threads by default), so this module-level map is safe.
// If ESLint ever adopts parallel workers, each worker gets its own module instance
// and its own map — this is still safe. The only unsafe case would be sharing
// a single module instance across concurrent async preprocess/postprocess calls
// for different files, which the current ESLint architecture does not do.
/** @type {Map<string, Array<{ startLine: number, virtualBlock: { text: string, filename: string } }>>} */
const fileBlocksMap = new Map();

/**
 * Matches any <custom-attribute attribute-id="body" ...> element.
 * The attribute-id may appear before or after xml:lang or other attributes.
 */
const BODY_ATTR_REGEX =
  /<custom-attribute\s+[^>]*attribute-id="body"[^>]*>([\s\S]*?)<\/custom-attribute>/g;

/** Matches a CDATA section inside a body attribute's content. */
const CDATA_INNER_REGEX = /<!\[CDATA\[([\s\S]*?)\]\]>/;

/**
 * Decodes XML/HTML entities in a string.
 * Handles numeric (&#13;), hex (&#x2F;), and named (&lt; &gt; &quot; &apos; &amp;) entities.
 * @param {string} str
 * @returns {string}
 */
function decodeXmlEntities(str) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    /* c8 ignore next 2 -- v8 phantom: method chain tail always runs when decodeXmlEntities is called */
    .replace(/&amp;/g, '&');
}

/**
 * Counts the line number (1-indexed) of a character offset in a string.
 * @param {string} text
 * @param {number} offset
 * @returns {number}
 */
function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

/**
 * Pre-process: extract body HTML blocks from the XML source.
 * Handles both CDATA and XML entity-encoded content.
 * @param {string} text       Raw XML file contents
 * @param {string} filename   Path of the XML file being linted
 * @returns {Array<{ text: string, filename: string }>}
 */
function preprocess(text, filename) {
  const blocks = [];
  let match;
  BODY_ATTR_REGEX.lastIndex = 0;

  while ((match = BODY_ATTR_REGEX.exec(text)) !== null) {
    const rawContent = match[1];
    const cdataMatch = rawContent.match(CDATA_INNER_REGEX);

    let htmlContent, startLine;
    if (cdataMatch) {
      // CDATA format: startLine = line of <![CDATA[ marker
      const cdataOffset = match.index + match[0].indexOf('<![CDATA[');
      htmlContent = cdataMatch[1];
      startLine = lineOf(text, cdataOffset);
    } else {
      // Entity-encoded format: startLine = line of <custom-attribute> opening tag.
      // Standard Business Manager exports encode the body value inline on the same
      // line as the opening tag, so the first HTML character in the decoded content
      // is on startLine. The lineOf() function counts only '\n' characters, so any
      // leading '\r' (from &#13;) in the decoded content does not advance the line
      // count and does not affect offset accuracy. If the BM export format changes
      // (e.g. the tag and content appear on separate lines), this offset may be off
      // by one and will need updating.
      htmlContent = decodeXmlEntities(rawContent);
      startLine = lineOf(text, match.index);
    }

    const virtualFilename = `${filename}/block_${blocks.length}.html`;
    blocks.push({ startLine, virtualBlock: { text: htmlContent, filename: virtualFilename } });
  }

  fileBlocksMap.set(filename, blocks);

  return blocks.map((b) => b.virtualBlock);
}

/**
 * Post-process: offset error line numbers back to the original XML file.
 * @param {Array<Array<object>>} messages  Per-block message arrays from ESLint
 * @param {string} filename                Path of the original XML file
 * @returns {object[]}
 */
function postprocess(messages, filename) {
  const blocks = fileBlocksMap.get(filename) || [];
  const result = [];

  messages.forEach((blockMessages, index) => {
    const block = blocks[index];
    const lineOffset = block ? block.startLine - 1 : 0;

    blockMessages.forEach((message) => {
      result.push({
        ...message,
        line: message.line + lineOffset,
        endLine: message.endLine != null ? message.endLine + lineOffset : message.endLine,
      });
    });
  });

  fileBlocksMap.delete(filename);

  return result;
}

module.exports = {
  preprocess,
  postprocess,
  supportsAutofix: false,
};
