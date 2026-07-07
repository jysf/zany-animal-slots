// A machine = pure config: a MATH slice (engine) + a PRESENTATION slice (UI).
// SPEC-038 pinned symbolDisplay in the presentation slice; SPEC-041 threads it into
// ReelGrid/paytable via props/params. SPEC-048 adds the theme + audio slices deferred
// by SPEC-041 — still pure data; the engine never sees them (DEC-001, DEC-015).
import type { SymbolId, MachineMath } from '../engine/index';

/** Per-symbol emoji + accessible label — the UI presentation map (DEC-006). */
export type SymbolDisplay = Record<SymbolId, { emoji: string; label: string }>;

/** The themeable semantic color tokens (a subset of tokens.css :root vars). */
export type ThemeVar =
  | '--color-bg'
  | '--color-surface'
  | '--color-frame'
  | '--color-text'
  | '--color-text-muted'
  | '--color-accent'
  | '--color-coin'
  | '--color-win-small'
  | '--color-win-big'
  | '--color-jackpot'
  | '--color-jackpot-sky';

/** Runtime CSS custom-property overrides applied on the app root (theme swap). Empty = use tokens.css. */
export type ThemeTokens = Partial<Record<ThemeVar, string>>;

/** Per-machine audio params the singleton reads (DEC-013 graph unchanged — params only). */
export interface MachineAudio {
  /** Bus gains for the bed / sfx / jingle channels. */
  channelGains: { bed: number; sfx: number; jingle: number };
  /** Bed automation levels + timings for big-win swell / jackpot duck. */
  mix: { duckLevel: number; swellLevel: number; rampS: number; restoreS: number; holdMs: number };
  /** Generative ambient bed: the chord and its note/loop timing (Tone notation). */
  music: { chord: string[]; noteDuration: string; loopInterval: string };
}

export interface MachinePresentation {
  symbolDisplay: SymbolDisplay;
  theme: ThemeTokens;
  audio: MachineAudio;
}

export interface Machine {
  id: string;
  name: string;
  math: MachineMath;
  presentation: MachinePresentation;
}
