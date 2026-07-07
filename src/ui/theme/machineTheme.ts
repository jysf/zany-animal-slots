// machineTheme.ts — pure DOM writer for a machine's theme overrides (SPEC-048).
// Applies/clears CSS custom properties on a root element; never touches other
// inline styles. Presentation-only (DEC-001) — no engine import here.
import type { ThemeVar, ThemeTokens } from '../../machines/types';

/** Every themeable var — applyTheme clears any of these absent from a new theme (symmetric switch). */
export const THEME_VARS: readonly ThemeVar[] = [
  '--color-bg', '--color-surface', '--color-frame', '--color-text', '--color-text-muted',
  '--color-accent', '--color-coin', '--color-win-small', '--color-win-big', '--color-jackpot',
  '--color-jackpot-sky',
];

/**
 * Apply a machine's theme overrides to `el`'s inline style. Idempotent and self-clearing:
 * every THEME_VAR present in `theme` is set; every THEME_VAR absent is removed — so switching
 * from a themed machine back to one with {} fully restores the static tokens.css palette.
 * Only touches THEME_VARS; never other inline styles.
 */
export function applyTheme(el: HTMLElement, theme: ThemeTokens): void {
  for (const v of THEME_VARS) {
    const value = theme[v];
    if (value != null) el.style.setProperty(v, value);
    else el.style.removeProperty(v);
  }
}
