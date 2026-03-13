import { describe, it, expect } from 'vitest';
import { sanitize } from '../../lib/preprocessors/isml-sanitizer.js';

describe('isml-sanitizer', () => {
  describe('${...} expressions in attribute values', () => {
    it('replaces a fully-dynamic expression with the sentinel', () => {
      const result = sanitize('<img alt="${image.alt}" src="x.jpg">');
      expect(result).toContain('alt="__ISML_EXPR__"');
      expect(result).not.toContain('${');
    });

    it('replaces multiple expressions in the same attribute with the sentinel', () => {
      const result = sanitize('<img alt="${a} ${b}" src="x.jpg">');
      expect(result).toContain('alt="__ISML_EXPR__"');
    });

    it('replaces expressions in multiple different attributes', () => {
      const result = sanitize('<input aria-label="${label}" id="${id}">');
      expect(result).toContain('aria-label="__ISML_EXPR__"');
      expect(result).toContain('id="__ISML_EXPR__"');
    });

    it('strips expressions from a partially-dynamic value without the sentinel', () => {
      const result = sanitize('<a href="/products/${id}/detail">link</a>');
      expect(result).not.toContain('${');
      expect(result).not.toContain('__ISML_EXPR__');
      expect(result).toContain('href="/products//detail"');
    });

    it('does not modify attributes without expressions', () => {
      const result = sanitize('<img alt="static text" src="x.jpg">');
      expect(result).toBe('<img alt="static text" src="x.jpg">');
    });
  });

  describe('content-emitting ISML tags', () => {
    it('replaces <isprint> with the content sentinel text node', () => {
      const result = sanitize('<button><isprint value="${label}"></button>');
      expect(result).toBe('<button>__ISML_CONTENT__</button>');
    });

    it('replaces self-closing <isprint />', () => {
      const result = sanitize('<h1><isprint value="${title}" /></h1>');
      expect(result).toContain('__ISML_CONTENT__');
      expect(result).not.toContain('<isprint');
    });

    it('replaces <ispicture> with the content sentinel (renders as <img> at runtime)', () => {
      const result = sanitize('<a href="/p/123"><ispicture url="${img.url}" /></a>');
      expect(result).toContain('__ISML_CONTENT__');
      expect(result).not.toContain('<ispicture');
    });

    it('replaces <iscontentasset> with the content sentinel (renders HTML at runtime)', () => {
      const result = sanitize('<a href="/help"><iscontentasset aid="help-icon" /></a>');
      expect(result).toContain('__ISML_CONTENT__');
      expect(result).not.toContain('<iscontentasset');
    });
  });

  describe('<is*> tags inside attribute values', () => {
    it('removes inline <isif> tags from attribute values', () => {
      const input = 'class=\'<isif condition="${x}">active</isif>\'';
      const result = sanitize(input);
      expect(result).not.toContain('<isif');
      expect(result).not.toContain('</isif');
    });

    it('preserves the surrounding quote characters', () => {
      const input = 'class=\'<isif condition="${x}">active</isif>\'';
      const result = sanitize(input);
      expect(result.startsWith("class='")).toBe(true);
      expect(result.endsWith("'")).toBe(true);
    });
  });

  describe('standalone <is*> block elements', () => {
    it('replaces standalone <isif> open/close tags with spaces', () => {
      const input = '<isif condition="${pdict.show}">\n<p>Content</p>\n</isif>';
      const result = sanitize(input);
      expect(result).not.toContain('<isif');
      expect(result).not.toContain('</isif>');
      expect(result.split('\n').length).toBe(input.split('\n').length);
    });

    it('replaces <isloop> tags', () => {
      const input = '<isloop items="${list}" var="item">\n<li>item</li>\n</isloop>';
      const result = sanitize(input);
      expect(result).not.toContain('<isloop');
      expect(result).not.toContain('</isloop>');
    });

    it('replaces <isinclude> self-closing tags', () => {
      const result = sanitize('<isinclude template="common/header" />');
      expect(result).not.toContain('<isinclude');
    });

    it('replaces <isset> self-closing tags', () => {
      const result = sanitize('<isset name="foo" value="${bar}" scope="page" />');
      expect(result).not.toContain('<isset');
    });
  });

  describe('line count preservation', () => {
    it('preserves the number of lines after sanitization', () => {
      const input = [
        '<div>',
        '  <isif condition="${x}">',
        '    <img alt="${img.alt}" src="y.jpg">',
        '  </isif>',
        '</div>',
      ].join('\n');
      const result = sanitize(input);
      expect(result.split('\n').length).toBe(input.split('\n').length);
    });

    it('preserves newlines inside multi-line <isif> tags', () => {
      const input = '<isif condition="\n  ${x}\n">\n<p>hi</p>\n</isif>';
      const result = sanitize(input);
      expect(result.split('\n').length).toBe(input.split('\n').length);
    });
  });

  describe('passthrough for plain HTML', () => {
    it('leaves valid HTML unchanged', () => {
      const input = '<img alt="photo" src="x.jpg">';
      expect(sanitize(input)).toBe(input);
    });
  });

  describe('{{...}} Mustache/Handlebars expressions', () => {
    it('replaces a fully-dynamic Mustache attribute with the sentinel', () => {
      const result = sanitize('<div aria-valuemax="{{maxVal}}">x</div>');
      expect(result).toContain('aria-valuemax="__ISML_EXPR__"');
      expect(result).not.toContain('{{');
    });

    it('replaces a partially-dynamic Mustache attribute by stripping the expression', () => {
      const result = sanitize('<a href="/base/{{slug}}">link</a>');
      expect(result).toContain('href="/base/"');
      expect(result).not.toContain('{{');
    });

    it('replaces Mustache expressions in text content with content sentinel', () => {
      const result = sanitize('<a href="/x">{{linkText}}</a>');
      expect(result).toContain('__ISML_CONTENT__');
      expect(result).not.toContain('{{linkText}}');
    });

    it('replaces block helpers with spaces (no visible output)', () => {
      const result = sanitize('{{#each items}}<li>item</li>{{/each}}');
      expect(result).not.toContain('{{#each');
      expect(result).not.toContain('{{/each}}');
    });

    it('replaces triple-stache {{{...}}} expressions', () => {
      const result = sanitize('<span>{{{htmlContent}}}</span>');
      expect(result).toContain('__ISML_CONTENT__');
      expect(result).not.toContain('{{{');
    });

    it('handles mixed ISML and Mustache in the same attribute', () => {
      const result = sanitize('<div aria-label="${ismlExpr} {{mustacheExpr}}">x</div>');
      expect(result).toContain('aria-label="__ISML_EXPR__"');
      expect(result).not.toContain('${');
      expect(result).not.toContain('{{');
    });
  });
});
