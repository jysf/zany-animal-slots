// winningCells — maps LineWin[] to a Set of "reel:row" keys (SPEC-018).
// SPEC-075: paylines is now a REQUIRED parameter rather than the module-level
// PAYLINES import. A trophy is STORED and outlives the line set that produced it
// (DEC-024); deriving cells from the machine's OWN math.paylines keeps a saved
// win correct even if a future machine ships a different payline set (DEC-021's
// per-machine-identity spirit applied to paylines, not just symbols).
// DEC-001: consumes Payline data from src/engine only; no game logic in the UI.
// DEC-003: each LineWin covers reels 0..count-1 at that line's per-reel rows.
import type { LineWin, Payline } from '../../engine/index';

/**
 * Return the set of "reel:row" keys that are part of at least one winning line.
 *
 * For each LineWin, the covered cells are the first `count` reels of the
 * matching entry in the supplied `paylines`, at the row that line crosses at
 * each reel. A LineWin whose line id is absent from `paylines` is skipped
 * (tolerant — it contributes no cells rather than throwing).
 *
 * Examples:
 *   L1 (rows [1,1,1,1,1]) with count 3 → {"0:1","1:1","2:1"}
 *   L4 (rows [0,1,2,1,0]) with count 5 → {"0:0","1:1","2:2","3:1","4:0"}
 */
export function winningCellKeys(lineWins: LineWin[], paylines: readonly Payline[]): Set<string> {
  const set = new Set<string>();
  for (const w of lineWins) {
    const line = paylines.find((p) => p.id === w.line);
    if (!line) continue; // tolerant: unknown line id contributes nothing
    for (let reel = 0; reel < w.count; reel++) {
      set.add(`${reel}:${line.rows[reel]}`);
    }
  }
  return set;
}
