// Symbol vocabulary and weighted reel strips for the slot engine.
// DEC-006: 8 symbols + tiers; DEC-016: retuned reel weights (supersedes DEC-011 for W&W).
// No React/DOM imports; no Math.random() — pure data + one helper.
import { buildStrip } from './stripBuilder';

/** The 8 symbol IDs in tier order (Low → Jackpot), per DEC-006. */
export const SYMBOLS = [
  'DEER',
  'FOX',
  'SQUIRREL',
  'BEAR',
  'EAGLE',
  'OWL',
  'BISON',
  'WOLF',
] as const;

/** A symbol identifier — derived from SYMBOLS so the set has one source of truth. */
export type SymbolId = (typeof SYMBOLS)[number];

/** Symbol tier, per DEC-006. */
export type Tier = 'low' | 'mid' | 'high' | 'jackpot';

/**
 * Maps each symbol to its tier (DEC-006).
 * Low: DEER, FOX, SQUIRREL
 * Mid: BEAR, EAGLE, OWL
 * High: BISON
 * Jackpot: WOLF
 */
export const SYMBOL_TIER: Record<SymbolId, Tier> = {
  DEER: 'low',
  FOX: 'low',
  SQUIRREL: 'low',
  BEAR: 'mid',
  EAGLE: 'mid',
  OWL: 'mid',
  BISON: 'high',
  WOLF: 'jackpot',
};

/**
 * Relative appearance count per symbol on each reel (DEC-016 retune —
 * supersedes DEC-011's weights for W&W). Sum equals 42 (the reel-strip length).
 */
export const REEL_WEIGHTS: Record<SymbolId, number> = {
  DEER: 9,
  FOX: 8,
  SQUIRREL: 7,
  BEAR: 5,
  EAGLE: 4,
  OWL: 3,
  BISON: 3,
  WOLF: 3,
};

/** Number of reels in the game. */
export const REEL_COUNT = 5;

/**
 * Canonical reel strip — GENERATED from REEL_WEIGHTS via SPEC-045's `buildStrip`
 * (DEC-016; the retune's live tuning knob — a hand-authored strip made weights inert).
 * Length: 42 (sum of REEL_WEIGHTS).
 */
export const REEL_STRIP = buildStrip(SYMBOLS, REEL_WEIGHTS);

/**
 * All five reel strips — identical composition for v1 (DEC-011 symmetric strip).
 * Per-reel asymmetric strips are a clean future spec.
 */
export const STRIPS: readonly (readonly SymbolId[])[] = Array.from(
  { length: REEL_COUNT },
  () => REEL_STRIP,
);

/**
 * Return the three symbols visible at a reel stop, with wraparound.
 * `stop` must be a non-negative integer (as produced by `randomInt`).
 */
export function visibleCells(
  strip: readonly SymbolId[],
  stop: number,
): [SymbolId, SymbolId, SymbolId] {
  const n = strip.length;
  return [strip[stop % n], strip[(stop + 1) % n], strip[(stop + 2) % n]];
}
