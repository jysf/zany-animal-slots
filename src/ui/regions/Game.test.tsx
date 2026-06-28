// Tests for the Game region (SPEC-012): verifies the reel grid renders inside
// the main region with the expected 15 symbol cells.
// SPEC-013: Game now takes a `grid` prop; pass INITIAL_GRID in the test.
// SPEC-023: threads celebration into paw trail via ReelGrid.
// SPEC-024: ParticleBurst is rendered inside .cabinet__game on a win.
import { render, screen } from '@testing-library/react';
import Game from './Game';
import { INITIAL_GRID } from '../reels/symbols';
import type { Grid, LineWin } from '../../engine/index';
import type { Celebration } from '../useSlotMachine';
import { PARTICLE_COUNTS } from '../reels/ParticleBurst';

/** A minimal known 5×3 grid used across several tests. */
const TEST_GRID: Grid = [
  ['WOLF',  'DEER',  'FOX'     ],
  ['BEAR',  'EAGLE', 'OWL'     ],
  ['BISON', 'DEER',  'SQUIRREL'],
  ['FOX',   'WOLF',  'BEAR'    ],
  ['DEER',  'OWL',   'EAGLE'   ],
];

/** L1 win of count 3: reels 0,1,2 at row 1 (middle row). */
const L1_WIN_3: LineWin = { line: 'L1', symbol: 'BEAR', count: 3, multiplier: 1, amount: 10 };

describe('Game', () => {
  it('the Game region renders the reel grid', () => {
    render(<Game grid={INITIAL_GRID} />);
    const main = screen.getByRole('main');
    // 5 reels × 3 cells = 15 symbol cells with role="img"
    const cells = screen.getAllByRole('img');
    expect(cells).toHaveLength(15);
    // All cells are inside the main region
    for (const cell of cells) {
      expect(main).toContainElement(cell);
    }
  });

  // ── SPEC-023: paw-trail threading ───────────────────────────────────────────

  it('threads the celebration into a paw trail on a win', () => {
    const celebration: Celebration = { id: 1, tier: 'small', totalWin: 10, lineWins: [L1_WIN_3] };

    // With celebration: 3 paws (L1 count-3 covers reels 0/1/2 at row 1).
    const { container, rerender } = render(
      <Game grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} celebration={celebration} />,
    );
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(3);

    // Without celebration: no paws.
    rerender(<Game grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} />);
    expect(container.querySelectorAll('.reel__paw')).toHaveLength(0);
  });

  // ── SPEC-033: tier threading into the win badge ─────────────────────────────

  it('threads the tier into the win badge', () => {
    const celebration: Celebration = {
      id: 1,
      tier: 'jackpot',
      totalWin: 2000,
      lineWins: [],
    };
    render(
      <Game
        grid={INITIAL_GRID}
        spinning={false}
        lastWin={2000}
        celebration={celebration}
      />,
    );
    expect(screen.getByRole('status').textContent).toContain('JACKPOT');
  });

  // ── SPEC-024: particle burst threading ──────────────────────────────────────

  it('renders a particle burst on a win', () => {
    const celebration: Celebration = { id: 1, tier: 'small', totalWin: 10, lineWins: [] };

    // With celebration: PARTICLE_COUNTS.small particles.
    const { container, rerender } = render(
      <Game grid={INITIAL_GRID} celebration={celebration} />,
    );
    expect(container.querySelectorAll('.particle')).toHaveLength(PARTICLE_COUNTS.small);

    // Without celebration: no particles.
    rerender(<Game grid={INITIAL_GRID} />);
    expect(container.querySelectorAll('.particle')).toHaveLength(0);
  });
});
