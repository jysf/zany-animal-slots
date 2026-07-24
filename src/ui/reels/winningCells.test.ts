// Unit tests for winningCellKeys (SPEC-018).
// SPEC-075: paylines is now a required 2nd param — every case passes it explicitly.
// Tests written during design, made to pass during build (TDD, AGENTS §12).
import { describe, it, expect } from 'vitest';
import { winningCellKeys } from './winningCells';
import { PAYLINES } from '../../engine/index';
import type { LineWin, Payline } from '../../engine/index';

// Helper to build a minimal LineWin.
function win(line: LineWin['line'], count: 3 | 4 | 5): LineWin {
  return { line, symbol: 'BEAR', count, multiplier: 1, amount: 10 };
}

describe('winningCellKeys', () => {
  it('maps a single line win to its cells', () => {
    // L1 rows: [1,1,1,1,1]; count 3 → reels 0,1,2 at row 1.
    const result = winningCellKeys([win('L1', 3)], PAYLINES);
    expect(result).toEqual(new Set(['0:1', '1:1', '2:1']));
  });

  it('covers count reels (4 of a kind)', () => {
    // L2 rows: [0,0,0,0,0]; count 4 → reels 0,1,2,3 at row 0.
    const result = winningCellKeys([win('L2', 4)], PAYLINES);
    expect(result).toEqual(new Set(['0:0', '1:0', '2:0', '3:0']));
  });

  it('unions multiple winning lines', () => {
    // L1 count 3 → {0:1,1:1,2:1}; L3 count 3 → {0:2,1:2,2:2}; union = 6 cells.
    const result = winningCellKeys([win('L1', 3), win('L3', 3)], PAYLINES);
    expect(result).toEqual(
      new Set(['0:1', '1:1', '2:1', '0:2', '1:2', '2:2']),
    );
  });

  it('a V-line uses its per-reel rows', () => {
    // L4 rows: [0,1,2,1,0]; count 5 → all 5 reels at their respective rows.
    const result = winningCellKeys([win('L4', 5)], PAYLINES);
    expect(result).toEqual(
      new Set(['0:0', '1:1', '2:2', '3:1', '4:0']),
    );
  });

  it('no wins → empty set', () => {
    expect(winningCellKeys([], PAYLINES)).toEqual(new Set());
    expect(winningCellKeys([], PAYLINES).size).toBe(0);
  });

  // ── SPEC-075: paylines is a parameter, not the module-level PAYLINES ────────

  it('uses the supplied paylines, not the module-level PAYLINES', () => {
    // A custom single-line payline set whose L1 rows differ from PAYLINES's L1 ([1,1,1,1,1]).
    const customPaylines: Payline[] = [{ id: 'L1', rows: [0, 0, 0, 0, 0] }];
    const result = winningCellKeys([win('L1', 3)], customPaylines);
    // If the module-level PAYLINES were still used, this would be {"0:1","1:1","2:1"}.
    expect(result).toEqual(new Set(['0:0', '1:0', '2:0']));
  });

  it('skips a LineWin whose line id is absent from the supplied paylines', () => {
    const customPaylines: Payline[] = [{ id: 'L1', rows: [0, 0, 0, 0, 0] }];
    // L9 doesn't exist in customPaylines — tolerant behavior: no cells, no throw.
    const result = winningCellKeys([win('L9', 3)], customPaylines);
    expect(result).toEqual(new Set());
  });
});
