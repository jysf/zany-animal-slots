// UI glyph map — SymbolId → emoji + accessible label (DEC-006).
// Lives in the UI layer only; the engine is glyph-free (DEC-001).
import type { SymbolId, Grid } from '../../engine/index';

/** The UI's presentation map for each engine symbol. */
export const SYMBOL_DISPLAY: Record<SymbolId, { emoji: string; label: string }> = {
  DEER:     { emoji: '🦌', label: 'Deer' },
  FOX:      { emoji: '🦊', label: 'Fox' },
  SQUIRREL: { emoji: '🐿️', label: 'Squirrel' },
  BEAR:     { emoji: '🐻', label: 'Bear' },
  EAGLE:    { emoji: '🦅', label: 'Eagle' },
  OWL:      { emoji: '🦉', label: 'Owl' },
  BISON:    { emoji: '🦬', label: 'Bison' },
  WOLF:     { emoji: '🐺', label: 'Wolf' },
};

/**
 * Static, non-winning idle arrangement shown before the first spin.
 * Varied symbols across all 5 reels, no three-of-a-kind on any payline.
 */
export const INITIAL_GRID: Grid = [
  ['DEER',     'FOX',   'SQUIRREL'],
  ['BEAR',     'EAGLE', 'OWL'     ],
  ['BISON',    'DEER',  'FOX'     ],
  ['SQUIRREL', 'BEAR',  'EAGLE'   ],
  ['OWL',      'BISON', 'WOLF'    ],
];
