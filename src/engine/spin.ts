// 5×3 spin resolver for the slot engine.
// DEC-001: pure engine, no React/DOM. DEC-002: all randomness via injected Rng.

import { type Rng, randomInt } from './rng';
import { type SymbolId, STRIPS, visibleCells } from './strips';

/**
 * The visible 5×3 grid produced by a spin.
 * Indexed grid[reel][row]: 5 reels × 3 rows, row 0 = top, 1 = mid, 2 = bottom.
 */
export type Grid = SymbolId[][];

/**
 * Draw one stop index per reel in order (reel 0→4), each consuming exactly one
 * PRNG draw via randomInt. Returns five stop indices, one per reel.
 *
 * Draw order is left-to-right (reel 0 first) — do not reorder or the pinned
 * seed fixtures (and all future seeds) will produce wrong stops.
 */
export function resolveStops(
  rng: Rng,
  strips: readonly (readonly SymbolId[])[] = STRIPS,
): number[] {
  return strips.map((strip) => randomInt(rng, strip.length));
}

/**
 * Resolve the visible 5×3 Grid for a spin.
 * Reuses resolveStops (one draw per reel, reel 0→4) then maps each stop through
 * visibleCells — no double-draw.
 */
export function resolveGrid(
  rng: Rng,
  strips: readonly (readonly SymbolId[])[] = STRIPS,
): Grid {
  const stops = resolveStops(rng, strips);
  return stops.map((stop, reel) => visibleCells(strips[reel], stop) as SymbolId[]);
}
