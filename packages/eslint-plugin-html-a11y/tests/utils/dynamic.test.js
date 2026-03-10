import { describe, it, expect } from 'vitest';
import { getMarkers, isDynamicValue } from '../../lib/utils/dynamic.js';

describe('isDynamicValue', () => {
  it('returns true when the value contains the marker', () => {
    expect(isDynamicValue('__DYNAMIC__', '__DYNAMIC__')).toBe(true);
    expect(isDynamicValue('prefix__DYNAMIC__suffix', '__DYNAMIC__')).toBe(true);
  });

  it('returns false for static values when marker is set', () => {
    expect(isDynamicValue('true', '__DYNAMIC__')).toBe(false);
    expect(isDynamicValue('', '__DYNAMIC__')).toBe(false);
    expect(isDynamicValue('en', '__DYNAMIC__')).toBe(false);
  });

  it('returns false for non-string inputs', () => {
    expect(isDynamicValue(null, '__DYNAMIC__')).toBe(false);
    expect(isDynamicValue(undefined, '__DYNAMIC__')).toBe(false);
    expect(isDynamicValue(true, '__DYNAMIC__')).toBe(false);
  });

  it('returns false when marker is null (no dynamic sentinel configured)', () => {
    expect(isDynamicValue('__DYNAMIC__', null)).toBe(false);
    expect(isDynamicValue('anything', null)).toBe(false);
  });
});

describe('getMarkers', () => {
  it('returns null markers when no settings are provided', () => {
    const context = {};
    expect(getMarkers(context)).toEqual({ valueMarker: null, contentMarker: null });
  });

  it('returns null markers when html-a11y settings are absent', () => {
    const context = { settings: {} };
    expect(getMarkers(context)).toEqual({ valueMarker: null, contentMarker: null });
  });

  it('returns configured markers from context.settings', () => {
    const context = {
      settings: {
        'html-a11y': {
          dynamicValueMarker: '__DYNAMIC__',
          dynamicContentMarker: '__CONTENT__',
        },
      },
    };
    expect(getMarkers(context)).toEqual({
      valueMarker: '__DYNAMIC__',
      contentMarker: '__CONTENT__',
    });
  });

  it('returns partial markers when only one is configured', () => {
    const context = {
      settings: { 'html-a11y': { dynamicValueMarker: '__V__' } },
    };
    const { valueMarker, contentMarker } = getMarkers(context);
    expect(valueMarker).toBe('__V__');
    expect(contentMarker).toBeNull();
  });
});
