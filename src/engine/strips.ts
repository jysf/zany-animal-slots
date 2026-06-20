// Symbol vocabulary and weighted reel strips for the slot engine.
// DEC-006: 8 symbols + tiers; DEC-011: reel weights + strip composition.
// No React/DOM imports; no Math.random() — pure data + one helper.

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
 * Relative appearance count per symbol on each reel (DEC-011).
 * Sum equals 35 (the reel-strip length).
 */
export const REEL_WEIGHTS: Record<SymbolId, number> = {
  DEER: 7,
  FOX: 7,
  SQUIRREL: 6,
  BEAR: 4,
  EAGLE: 4,
  OWL: 4,
  BISON: 2,
  WOLF: 1,
};

/** Number of reels in the game. */
export const REEL_COUNT = 5;

/**
 * Canonical reel strip — a well-spread arrangement of DEC-011 weights
 * with no adjacent duplicates, pinned to lock spin reproducibility (SPEC-007).
 * Length: 35 (sum of REEL_WEIGHTS).
 */
export const REEL_STRIP = [
  'DEER', 'FOX', 'SQUIRREL', 'BEAR', 'EAGLE', 'OWL', 'DEER', 'FOX', 'SQUIRREL', 'BISON',
  'DEER', 'FOX', 'BEAR', 'EAGLE', 'OWL', 'SQUIRREL', 'DEER', 'FOX', 'WOLF', 'SQUIRREL',
  'BEAR', 'EAGLE', 'OWL', 'DEER', 'FOX', 'SQUIRREL', 'BISON', 'DEER', 'FOX', 'BEAR',
  'EAGLE', 'OWL', 'SQUIRREL', 'DEER', 'FOX',
] as const satisfies readonly SymbolId[];

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
