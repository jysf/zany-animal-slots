// useMachineTheme.ts — applies the active machine's theme to a ref'd root element (SPEC-048).
import { useEffect, type RefObject } from 'react';
import type { ThemeTokens } from '../../machines/types';
import { applyTheme } from './machineTheme';

/** Apply the active machine's theme to a root element whenever the theme changes. */
export function useMachineTheme(ref: RefObject<HTMLElement | null>, theme: ThemeTokens): void {
  useEffect(() => {
    const el = ref.current;
    if (el) applyTheme(el, theme);
  }, [ref, theme]);
}
