// UI glyph map — SymbolId → emoji + accessible label (DEC-006).
// Lives in the UI layer only; the engine is glyph-free (DEC-001).
import type { SymbolId, Grid } from '../../engine/index';

/**
 * Wild & Whimsical's reel identity — a bright, whimsical menagerie (SPEC-065). This is the default
 * machine's symbolDisplay (its only consumer, per DEC-021's per-machine identity model), so its symbols
 * live here in the canonical UI symbol map. The keys are engine SymbolIds (stable tokens); the emoji are
 * pure presentation — the "DEER" slot showing a frog is fine, exactly as Arctic's "WOLF" slot shows a
 * polar bear. WOLF is the jackpot slot (five-of-a-kind), so it gets the unicorn.
 */
export const SYMBOL_DISPLAY: Record<SymbolId, { emoji: string; label: string }> = {
  DEER:     { emoji: '🐸', label: 'Frog' },
  FOX:      { emoji: '🐝', label: 'Bee' },
  SQUIRREL: { emoji: '🐞', label: 'Ladybug' },
  BEAR:     { emoji: '🦋', label: 'Butterfly' },
  EAGLE:    { emoji: '🦜', label: 'Parrot' },
  OWL:      { emoji: '🦩', label: 'Flamingo' },
  BISON:    { emoji: '🦚', label: 'Peacock' },
  WOLF:     { emoji: '🦄', label: 'Unicorn' },
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
