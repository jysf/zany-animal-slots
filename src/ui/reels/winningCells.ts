// winningCells — maps LineWin[] to a Set of "reel:row" keys (SPEC-018).
// DEC-001: consumes PAYLINES from src/engine only; no game logic in the UI.
// DEC-003: each LineWin covers reels 0..count-1 at that line's per-reel rows.
import { PAYLINES } from '../../engine/index';
import type { LineWin } from '../../engine/index';

/**
 * Return the set of "reel:row" keys that are part of at least one winning line.
 *
 * For each LineWin, the covered cells are the first `count` reels of that
 * line's PAYLINES entry, at the row that line crosses at each reel.
 *
 * Examples:
 *   L1 (rows [1,1,1,1,1]) with count 3 → {"0:1","1:1","2:1"}
 *   L4 (rows [0,1,2,1,0]) with count 5 → {"0:0","1:1","2:2","3:1","4:0"}
 */
export function winningCellKeys(lineWins: LineWin[]): Set<string> {
  const set = new Set<string>();
  for (const w of lineWins) {
    const line = PAYLINES.find(p => p.id === w.line);
    if (!line) continue;
    for (let reel = 0; reel < w.count; reel++) {
      set.add(`${reel}:${line.rows[reel]}`);
    }
  }
  return set;
}
