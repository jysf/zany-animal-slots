// machineTheme.test.ts — unit tests for the pure DOM theme writer (SPEC-048).
import { describe, it, expect } from 'vitest';
import { applyTheme, THEME_VARS } from './machineTheme';

describe('applyTheme', () => {
  it('sets each supplied custom property on the element', () => {
    const el = document.createElement('div');
    applyTheme(el, { '--color-bg': '#012', '--color-accent': '#0ff' });
    expect(el.style.getPropertyValue('--color-bg')).toBe('#012');
    expect(el.style.getPropertyValue('--color-accent')).toBe('#0ff');
  });

  it('removes theme vars absent from the new theme (self-clearing switch)', () => {
    const el = document.createElement('div');
    applyTheme(el, { '--color-bg': '#012' });
    expect(el.style.getPropertyValue('--color-bg')).toBe('#012');

    applyTheme(el, {});
    expect(el.style.getPropertyValue('--color-bg')).toBe('');
    for (const v of THEME_VARS) {
      expect(el.style.getPropertyValue(v)).toBe('');
    }
  });

  it('only touches THEME_VARS, never arbitrary properties', () => {
    const el = document.createElement('div');
    el.style.color = 'red';
    applyTheme(el, {});
    expect(el.style.color).toBe('red');
  });
});
