// Behavior/structure tests for the ReelGrid component (SPEC-012).
// SPEC-018: extended with winning-cell highlight tests.
// SPEC-041: symbolDisplay is now a required prop, sourced from the default machine's
// presentation slice; every render() call site supplies it.
// Visual appearance is verified by the orchestrator's preview screenshot check.
import { render, screen } from '@testing-library/react';
import ReelGrid from './ReelGrid';
import { SYMBOL_DISPLAY, INITIAL_GRID } from './symbols';
import { SYMBOLS } from '../../engine/index';
import type { Grid, LineWin } from '../../engine/index';
import { WILD_AND_WHIMSICAL } from '../../machines/wildAndWhimsical';

/** A minimal known 5×3 grid used across several tests. */
const TEST_GRID: Grid = [
  ['WOLF',  'DEER',  'FOX'     ],
  ['BEAR',  'EAGLE', 'OWL'     ],
  ['BISON', 'DEER',  'SQUIRREL'],
  ['FOX',   'WOLF',  'BEAR'    ],
  ['DEER',  'OWL',   'EAGLE'   ],
];

/** The default machine's symbolDisplay map — parity anchor (SPEC-041). */
const DEFAULT_DISPLAY = WILD_AND_WHIMSICAL.presentation.symbolDisplay;

describe('ReelGrid', () => {
  it('renders 15 symbol cells for a 5×3 grid', () => {
    render(<ReelGrid grid={TEST_GRID} symbolDisplay={DEFAULT_DISPLAY} />);
    expect(screen.getAllByRole('img')).toHaveLength(15);
  });

  it('renders the correct emoji and label per symbol', () => {
    render(<ReelGrid grid={TEST_GRID} symbolDisplay={DEFAULT_DISPLAY} />);

    // WOLF slot — Wild & Whimsical's jackpot creature (SPEC-065: unicorn).
    const wolfCells = screen.getAllByLabelText('Unicorn');
    expect(wolfCells.length).toBeGreaterThan(0);
    expect(wolfCells[0].textContent).toBe('🦄');

    // DEER slot (SPEC-065: frog).
    const deerCells = screen.getAllByLabelText('Frog');
    expect(deerCells.length).toBeGreaterThan(0);
    expect(deerCells[0].textContent).toBe('🐸');
  });

  it('maps every DEC-006 symbol to an emoji + label', () => {
    for (const id of SYMBOLS) {
      const entry = SYMBOL_DISPLAY[id];
      expect(entry).toBeDefined();
      expect(entry.emoji.length).toBeGreaterThan(0);
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it('lays out five reels with three cells each', () => {
    const { container } = render(<ReelGrid grid={TEST_GRID} symbolDisplay={DEFAULT_DISPLAY} />);
    const reels = container.querySelectorAll('.reel');
    expect(reels).toHaveLength(5);
    for (const reel of reels) {
      expect(reel.querySelectorAll('.reel__cell')).toHaveLength(3);
    }
  });

  it('INITIAL_GRID is a valid 5×3 grid of known symbols', () => {
    expect(INITIAL_GRID).toHaveLength(5);
    for (const reel of INITIAL_GRID) {
      expect(reel).toHaveLength(3);
      for (const cell of reel) {
        expect(SYMBOLS).toContain(cell);
      }
    }
  });

  // ── SPEC-018: winning-cell highlight ────────────────────────────────────────

  /** L1 win of count 3: reels 0,1,2 at row 1 (middle row). */
  const L1_WIN_3: LineWin = { line: 'L1', symbol: 'BEAR', count: 3, multiplier: 1, amount: 10 };

  it('highlights the winning cells when resolved', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    // L1 count=3 covers reels 0,1,2 at row 1 → exactly 3 cells win.
    const winCells = container.querySelectorAll('.reel__cell--win');
    expect(winCells).toHaveLength(3);

    // Verify the three cells are at reel 0/1/2, row 1 (middle cell of each reel).
    const reels = container.querySelectorAll('.reel');
    for (let reelIdx = 0; reelIdx < 3; reelIdx++) {
      const cells = reels[reelIdx].querySelectorAll('.reel__cell');
      expect(cells[1].classList.contains('reel__cell--win')).toBe(true);
    }
  });

  it('suppresses the highlight while spinning', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={true} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    // No cell should carry .reel__cell--win while spinning.
    expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(0);
  });

  it('no highlight when there are no wins', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[]} spinning={false} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(0);
  });

  // ── SPEC-023: paw-print trail ────────────────────────────────────────────────

  it('renders a paw on each winning cell when a trail is active', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} trailKey={1} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    // L1 count=3 covers reels 0/1/2 at row 1 → exactly 3 winning cells → 3 paws.
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(3);
  });

  it('renders no paws when there is no win', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[]} spinning={false} trailKey={1} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(0);
  });

  it('renders no paws while spinning', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={true} trailKey={1} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(0);
  });

  it('renders no paws when trailKey is null', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} trailKey={null} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(0);
  });

  it('paws are decorative (aria-hidden) and do not change the symbol count', () => {
    const { container } = render(
      <ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} trailKey={1} symbolDisplay={DEFAULT_DISPLAY} />,
    );
    // Paws must not add role="img" elements — symbol count stays at 15.
    expect(screen.getAllByRole('img')).toHaveLength(15);
    // Every paw must carry aria-hidden="true".
    const paws = container.querySelectorAll('.reel__paw');
    for (const paw of paws) {
      expect(paw.getAttribute('aria-hidden')).toBe('true');
    }
  });

  // ── SPEC-041: renders the supplied symbolDisplay map, not a hard-coded import ──

  it('renders the emoji supplied by symbolDisplay', () => {
    const stubDisplay = {
      ...DEFAULT_DISPLAY,
      WOLF: { emoji: '🎰', label: 'Slot' },
    };
    render(<ReelGrid grid={TEST_GRID} symbolDisplay={stubDisplay} />);

    // A WOLF cell renders the stub's emoji/label, proving ReelGrid renders the
    // supplied map rather than importing SYMBOL_DISPLAY directly.
    const slotCells = screen.getAllByLabelText('Slot');
    expect(slotCells.length).toBeGreaterThan(0);
    expect(slotCells[0].textContent).toBe('🎰');
  });
});
