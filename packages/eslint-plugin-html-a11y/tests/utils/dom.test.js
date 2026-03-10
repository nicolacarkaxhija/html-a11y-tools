import { describe, it, expect } from 'vitest';
import {
  getAttr,
  getTextContent,
  hasVisibleTextContent,
  hasAriaLabel,
  isAriaHidden,
  isNativelyFocusable,
  isInteractiveRole,
  getImplicitRole,
} from '../../lib/utils/dom.js';

/** Minimal Tag node factory for unit tests. */
function tag(name, attrs = {}, children = []) {
  return {
    type: 'Tag',
    name,
    attributes: Object.entries(attrs).map(([key, value]) => ({
      key: { value: key },
      value: value !== undefined ? { value } : undefined,
    })),
    children,
  };
}

function text(value) {
  return { type: 'Text', value };
}

function comment(value) {
  return { type: 'Comment', value };
}

describe('getAttr', () => {
  it('returns undefined when attribute is absent', () => {
    expect(getAttr(tag('div'), 'id')).toBeUndefined();
  });

  it('returns undefined when node has no attributes property', () => {
    expect(getAttr({ name: 'div' }, 'id')).toBeUndefined();
  });

  it('returns the string value when present', () => {
    expect(getAttr(tag('input', { id: 'email' }), 'id')).toBe('email');
  });

  it('returns true for boolean attributes (no value)', () => {
    const node = { attributes: [{ key: { value: 'checked' }, value: undefined }] };
    expect(getAttr(node, 'checked')).toBe(true);
  });

  it('is case-insensitive for attribute names', () => {
    expect(getAttr(tag('div', { ARIA_LABEL: 'x' }), 'aria_label')).toBe('x');
  });

  it('returns undefined when an attribute has a null key (defensive: malformed AST)', () => {
    const node = { attributes: [{ key: null, value: { value: 'foo' } }] };
    expect(getAttr(node, 'id')).toBeUndefined();
  });

  it('returns undefined when an attribute key has null value (defensive: malformed AST)', () => {
    const node = { attributes: [{ key: { value: null }, value: { value: 'foo' } }] };
    expect(getAttr(node, 'id')).toBeUndefined();
  });
});

describe('getTextContent', () => {
  it('returns empty string when node has no children', () => {
    expect(getTextContent(tag('div'))).toBe('');
  });

  it('returns empty string when children is not an array', () => {
    expect(getTextContent({ children: null })).toBe('');
  });

  it('collects text from direct Text children', () => {
    const node = tag('p', {}, [text('hello ')]);
    expect(getTextContent(node)).toBe('hello ');
  });

  it('recursively collects text from nested Tags', () => {
    const inner = tag('span', {}, [text('world')]);
    const outer = tag('p', {}, [text('hello '), inner]);
    expect(getTextContent(outer)).toBe('hello world');
  });

  it('ignores non-Text, non-Tag children (e.g. comments)', () => {
    const node = tag('div', {}, [comment('a comment'), text('real')]);
    expect(getTextContent(node)).toBe('real');
  });

  it('returns empty string for a Text node with falsy value', () => {
    const node = tag('p', {}, [{ type: 'Text', value: null }]);
    expect(getTextContent(node)).toBe('');
  });
});

describe('hasVisibleTextContent', () => {
  it('returns false for empty elements', () => {
    expect(hasVisibleTextContent(tag('h1'))).toBe(false);
  });

  it('returns false for whitespace-only text', () => {
    expect(hasVisibleTextContent(tag('h1', {}, [text('   ')]))).toBe(false);
  });

  it('returns true for non-empty text', () => {
    expect(hasVisibleTextContent(tag('h1', {}, [text('Title')]))).toBe(true);
  });

  it('returns true when text contains the content marker', () => {
    expect(hasVisibleTextContent(tag('h1', {}, [text('__CONTENT__')]), '__CONTENT__')).toBe(true);
  });

  it('returns true for non-empty text even without a configured content marker', () => {
    expect(hasVisibleTextContent(tag('h1', {}, [text('__CONTENT__')]))).toBe(true);
  });
});

describe('hasAriaLabel', () => {
  it('returns false when neither aria-label nor aria-labelledby is present', () => {
    expect(hasAriaLabel(tag('input'))).toBe(false);
  });

  it('returns true for non-empty aria-label', () => {
    expect(hasAriaLabel(tag('input', { 'aria-label': 'Email' }))).toBe(true);
  });

  it('returns false for empty aria-label', () => {
    expect(hasAriaLabel(tag('input', { 'aria-label': '' }))).toBe(false);
  });

  it('returns false for whitespace aria-label', () => {
    expect(hasAriaLabel(tag('input', { 'aria-label': '   ' }))).toBe(false);
  });

  it('returns false when aria-label is a boolean attribute (no value)', () => {
    const node = { attributes: [{ key: { value: 'aria-label' }, value: undefined }] };
    expect(hasAriaLabel(node)).toBe(false);
  });

  it('returns true for non-empty aria-labelledby', () => {
    expect(hasAriaLabel(tag('input', { 'aria-labelledby': 'some-id' }))).toBe(true);
  });

  it('returns false when aria-labelledby is boolean (no value)', () => {
    const node = { attributes: [{ key: { value: 'aria-labelledby' }, value: undefined }] };
    expect(hasAriaLabel(node)).toBe(false);
  });
});

describe('isAriaHidden', () => {
  it('returns true for aria-hidden="true"', () => {
    expect(isAriaHidden(tag('div', { 'aria-hidden': 'true' }))).toBe(true);
  });

  it('returns false for aria-hidden="false"', () => {
    expect(isAriaHidden(tag('div', { 'aria-hidden': 'false' }))).toBe(false);
  });

  it('returns false when aria-hidden is absent', () => {
    expect(isAriaHidden(tag('div'))).toBe(false);
  });
});

describe('isNativelyFocusable', () => {
  it('returns true for natively focusable elements', () => {
    expect(isNativelyFocusable('a')).toBe(true);
    expect(isNativelyFocusable('button')).toBe(true);
    expect(isNativelyFocusable('input')).toBe(true);
  });

  it('returns false for non-focusable elements', () => {
    expect(isNativelyFocusable('div')).toBe(false);
    expect(isNativelyFocusable('span')).toBe(false);
  });
});

describe('isInteractiveRole', () => {
  it('returns true for interactive roles', () => {
    expect(isInteractiveRole('button')).toBe(true);
    expect(isInteractiveRole('link')).toBe(true);
    expect(isInteractiveRole('checkbox')).toBe(true);
  });

  it('returns false for non-interactive roles', () => {
    expect(isInteractiveRole('dialog')).toBe(false);
    expect(isInteractiveRole('region')).toBe(false);
  });
});

describe('getImplicitRole', () => {
  it('returns the implicit role for semantic elements', () => {
    expect(getImplicitRole('nav')).toBe('navigation');
    expect(getImplicitRole('button')).toBe('button');
    expect(getImplicitRole('main')).toBe('main');
  });

  it('returns undefined for elements with no implicit role', () => {
    expect(getImplicitRole('div')).toBeUndefined();
    expect(getImplicitRole('span')).toBeUndefined();
    expect(getImplicitRole('unknown-tag')).toBeUndefined();
  });

  it('is case-insensitive', () => {
    expect(getImplicitRole('NAV')).toBe('navigation');
  });
});
