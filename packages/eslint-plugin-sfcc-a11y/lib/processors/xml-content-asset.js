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
      // Decoded content begins with \r\n (from &#13;\n at line end), so block
      // line 1 is blank (CR only) and block line 2 maps to startLine + 1 in the XML.
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

export default {
  preprocess,
  postprocess,
  supportsAutofix: false,
};
