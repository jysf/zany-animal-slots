// useMachineTheme.test.tsx — unit tests for the theme-applying hook (SPEC-048).
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useMachineTheme } from './useMachineTheme';
import type { ThemeTokens } from '../../machines/types';

/** A hook wrapper that mounts a real div and refs it, mirroring App's stageRef usage. */
function useThemedDiv(theme: ThemeTokens) {
  const ref = useRef<HTMLDivElement | null>(null);
  if (!ref.current) {
    ref.current = document.createElement('div');
    document.body.appendChild(ref.current);
  }
  useMachineTheme(ref, theme);
  return ref;
}

describe('useMachineTheme', () => {
  it("applies a machine's theme overrides to the ref'd element", () => {
    const { result } = renderHook(({ theme }) => useThemedDiv(theme), {
      initialProps: { theme: { '--color-bg': '#123' } as ThemeTokens },
    });
    expect(result.current.current?.style.getPropertyValue('--color-bg')).toBe('#123');
  });

  it('re-applies (and clears) when the theme changes', () => {
    const { result, rerender } = renderHook(({ theme }) => useThemedDiv(theme), {
      initialProps: { theme: { '--color-bg': '#123' } as ThemeTokens },
    });
    expect(result.current.current?.style.getPropertyValue('--color-bg')).toBe('#123');

    rerender({ theme: {} });
    expect(result.current.current?.style.getPropertyValue('--color-bg')).toBe('');
  });
});
