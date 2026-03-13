import { describe, it, expect } from 'vitest';
import processor from '../../lib/processors/xml-content-asset.js';

const { preprocess, postprocess } = processor;

// Shorthand for a standard body attribute element (CDATA format)
const bodyAttr = (content) => `<custom-attribute attribute-id="body">${content}</custom-attribute>`;
// Entity-encoded body attribute (Business Manager export format)
const bodyAttrEncoded = (lang, content) =>
  `<custom-attribute attribute-id="body" xml:lang="${lang}">${content}</custom-attribute>`;

describe('xml-content-asset processor', () => {
  describe('preprocess — CDATA format', () => {
    it('extracts HTML from a single CDATA block', () => {
      const xml = [
        '<library>',
        '  <custom-attributes>',
        `    ${bodyAttr('<![CDATA[<p>Hello</p>]]>')}`,
        '  </custom-attributes>',
        '</library>',
      ].join('\n');
      const blocks = preprocess(xml, 'library.xml');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].text).toBe('<p>Hello</p>');
      expect(blocks[0].filename).toMatch(/library\.xml/);
    });

    it('extracts HTML from multiple CDATA blocks', () => {
      const xml = [
        '<library>',
        `  ${bodyAttr('<![CDATA[<p>First</p>]]>')}`,
        `  ${bodyAttr('<![CDATA[<h2>Second</h2>]]>')}`,
        '</library>',
      ].join('\n');
      const blocks = preprocess(xml, 'library.xml');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].text).toBe('<p>First</p>');
      expect(blocks[1].text).toBe('<h2>Second</h2>');
    });

    it('gives each block a unique virtual filename', () => {
      const xml = [
        '<root>',
        `  ${bodyAttr('<![CDATA[<p>A</p>]]>')}`,
        `  ${bodyAttr('<![CDATA[<p>B</p>]]>')}`,
        '</root>',
      ].join('\n');
      const blocks = preprocess(xml, 'lib.xml');
      expect(blocks[0].filename).not.toBe(blocks[1].filename);
    });

    it('handles multi-line CDATA content', () => {
      const xml = [
        '<root>',
        '  <custom-attribute attribute-id="body"><![CDATA[',
        '    <p>Line one</p>',
        '    <p>Line two</p>',
        '  ]]></custom-attribute>',
        '</root>',
      ].join('\n');
      const blocks = preprocess(xml, 'lib.xml');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].text).toContain('<p>Line one</p>');
      expect(blocks[0].text).toContain('<p>Line two</p>');
    });

    it('returns an empty array when there are no body attribute elements', () => {
      const xml = '<library><content content-id="empty"/></library>';
      const blocks = preprocess(xml, 'library.xml');
      expect(blocks).toHaveLength(0);
    });

    it('ignores custom-attribute elements without attribute-id="body"', () => {
      const xml =
        '<library><custom-attribute attribute-id="title">Hello</custom-attribute></library>';
      const blocks = preprocess(xml, 'library.xml');
      expect(blocks).toHaveLength(0);
    });
  });

  describe('preprocess — entity-encoded format (Business Manager export)', () => {
    it('extracts and decodes entity-encoded HTML from a body attribute', () => {
      const xml = [
        '<library>',
        bodyAttrEncoded('x-default', '&lt;p&gt;Hello&lt;/p&gt;'),
        '</library>',
      ].join('\n');
      const blocks = preprocess(xml, 'library.xml');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].text).toContain('<p>Hello</p>');
    });

    it('decodes all standard XML entities', () => {
      const encoded = '&lt;div class=&quot;x&quot;&gt;&amp;copy;&lt;/div&gt;';
      const xml = `<library>${bodyAttrEncoded('en', encoded)}</library>`;
      const blocks = preprocess(xml, 'ents.xml');
      expect(blocks[0].text).toContain('<div class="x">');
      expect(blocks[0].text).toContain('&copy;'); // &amp; → & so &amp;copy; → &copy;
    });

    it('decodes decimal numeric entities (&#13; carriage return)', () => {
      const xml = `<library>${bodyAttrEncoded('en', '&lt;p&gt;line&#13;\n&lt;/p&gt;')}</library>`;
      const blocks = preprocess(xml, 'cr.xml');
      // &#13; → \r (carriage return character)
      expect(blocks[0].text).toContain('\r');
      expect(blocks[0].text).toContain('<p>line');
    });

    it('decodes hexadecimal numeric entities (&#x2F; slash)', () => {
      const xml = `<library>${bodyAttrEncoded('en', '&lt;p&gt;foo&#x2F;bar&lt;&#x2F;p&gt;')}</library>`;
      const blocks = preprocess(xml, 'hex.xml');
      expect(blocks[0].text).toContain('<p>foo/bar</p>');
    });

    it('decodes &apos; entity', () => {
      const xml = `<library>${bodyAttrEncoded('en', 'it&apos;s')}</library>`;
      const blocks = preprocess(xml, 'apos.xml');
      expect(blocks[0].text).toContain("it's");
    });

    it('handles xml:lang attribute before attribute-id', () => {
      const xml =
        '<library><custom-attribute xml:lang="en-DE" attribute-id="body">&lt;p&gt;Hi&lt;/p&gt;</custom-attribute></library>';
      const blocks = preprocess(xml, 'lang-first.xml');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].text).toContain('<p>Hi</p>');
    });

    it('extracts multiple entity-encoded blocks from one file', () => {
      const xml = [
        '<library>',
        bodyAttrEncoded('en', '&lt;p&gt;First&lt;/p&gt;'),
        bodyAttrEncoded('de', '&lt;p&gt;Second&lt;/p&gt;'),
        '</library>',
      ].join('\n');
      const blocks = preprocess(xml, 'multi-lang.xml');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].text).toContain('<p>First</p>');
      expect(blocks[1].text).toContain('<p>Second</p>');
    });

    it('handles a mixed file with both CDATA and entity-encoded blocks', () => {
      const xml = [
        '<library>',
        bodyAttrEncoded('en', '&lt;p&gt;Encoded&lt;/p&gt;'),
        bodyAttr('<![CDATA[<p>CDATA</p>]]>'),
        '</library>',
      ].join('\n');
      const blocks = preprocess(xml, 'mixed.xml');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].text).toContain('<p>Encoded</p>');
      expect(blocks[1].text).toContain('<p>CDATA</p>');
    });
  });

  describe('postprocess — CDATA line offsets', () => {
    it('maps block[0] errors to the CDATA start line in the source XML', () => {
      const xml = [
        '<library>',
        `  ${bodyAttr('<![CDATA[<img src="x.jpg">]]>')}`,
        '</library>',
      ].join('\n');
      preprocess(xml, 'lib.xml');
      const messages = [[{ line: 1, column: 0, message: 'img missing alt' }]];
      const result = postprocess(messages, 'lib.xml');
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(2);
    });

    it('also offsets endLine when present', () => {
      const xml = [
        '<library>',
        `  ${bodyAttr('<![CDATA[<img src="x.jpg">]]>')}`,
        '</library>',
      ].join('\n');
      preprocess(xml, 'endline.xml');
      const messages = [
        [{ line: 1, endLine: 1, column: 0, endColumn: 18, message: 'img missing alt' }],
      ];
      const result = postprocess(messages, 'endline.xml');
      expect(result[0].line).toBe(2);
      expect(result[0].endLine).toBe(2);
    });

    it('leaves endLine undefined when absent', () => {
      const xml = `<library>${bodyAttr('<![CDATA[<p>x</p>]]>')}</library>`;
      preprocess(xml, 'noendline.xml');
      const messages = [[{ line: 1, column: 0, message: 'test', endLine: undefined }]];
      const result = postprocess(messages, 'noendline.xml');
      expect(result[0].endLine).toBeUndefined();
    });

    it('offsets multi-line CDATA block errors correctly', () => {
      const xml = [
        '<library>',
        '  <custom-attribute attribute-id="body"><![CDATA[',
        '    <img src="x.jpg">',
        '  ]]></custom-attribute>',
        '</library>',
      ].join('\n');
      preprocess(xml, 'multi.xml');
      // CDATA starts on line 2; img is on line 2 of the block → mapped line = 2 + 2 - 1 = 3
      const messages = [[{ line: 2, column: 4, message: 'img missing alt' }]];
      const result = postprocess(messages, 'multi.xml');
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(3);
    });

    it('returns an empty array when there are no messages', () => {
      const xml = `<root>${bodyAttr('<![CDATA[<p>OK</p>]]>')}</root>`;
      preprocess(xml, 'ok.xml');
      const result = postprocess([[]], 'ok.xml');
      expect(result).toHaveLength(0);
    });

    it('flattens messages from multiple CDATA blocks', () => {
      const xml = [
        '<root>',
        `  ${bodyAttr('<![CDATA[<img src="a.jpg">]]>')}`,
        `  ${bodyAttr('<![CDATA[<img src="b.jpg">]]>')}`,
        '</root>',
      ].join('\n');
      preprocess(xml, 'flat.xml');
      const messages = [
        [{ line: 1, column: 0, message: 'missing alt a' }],
        [{ line: 1, column: 0, message: 'missing alt b' }],
      ];
      const result = postprocess(messages, 'flat.xml');
      expect(result).toHaveLength(2);
    });

    it('uses zero offset when postprocess is called for an unknown file', () => {
      const result = postprocess([[{ line: 3, column: 0, message: 'test' }]], 'unknown.xml');
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(3);
    });

    it('uses zero offset when messages array has more entries than blocks', () => {
      const xml = `<root>${bodyAttr('<![CDATA[<p>x</p>]]>')}</root>`;
      preprocess(xml, 'extra.xml');
      const messages = [[], [{ line: 1, column: 0, message: 'orphan' }]];
      const result = postprocess(messages, 'extra.xml');
      expect(result).toHaveLength(1);
      expect(result[0].line).toBe(1);
    });
  });

  describe('postprocess — entity-encoded line offsets', () => {
    it('maps error on block line 2 to the correct XML source line', () => {
      // Entity-encoded body on XML line 2; decoded block has leading \r on line 1,
      // actual HTML on line 2 → error on block line 2 → XML line 3
      const xml = [
        '<library>',
        bodyAttrEncoded('en', '&#13;\n&lt;img src="x.jpg"&gt;&#13;\n'),
        '</library>',
      ].join('\n');
      preprocess(xml, 'entity-offset.xml');
      // block line 2 = <img src="x.jpg"> → startLine(2) + lineOffset(2-1) = 3
      const messages = [[{ line: 2, column: 0, message: 'img missing alt' }]];
      const result = postprocess(messages, 'entity-offset.xml');
      expect(result[0].line).toBe(3);
    });
  });
});
