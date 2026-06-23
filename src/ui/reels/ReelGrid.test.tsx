// Behavior/structure tests for the ReelGrid component (SPEC-012).
// Visual appearance is verified by the orchestrator's preview screenshot check.
import { render, screen } from '@testing-library/react';
import ReelGrid from './ReelGrid';
import { SYMBOL_DISPLAY, INITIAL_GRID } from './symbols';
import { SYMBOLS } from '../../engine/index';
import type { Grid } from '../../engine/index';

/** A minimal known 5×3 grid used across several tests. */
const TEST_GRID: Grid = [
  ['WOLF',  'DEER',  'FOX'     ],
  ['BEAR',  'EAGLE', 'OWL'     ],
  ['BISON', 'DEER',  'SQUIRREL'],
  ['FOX',   'WOLF',  'BEAR'    ],
  ['DEER',  'OWL',   'EAGLE'   ],
];

describe('ReelGrid', () => {
  it('renders 15 symbol cells for a 5×3 grid', () => {
    render(<ReelGrid grid={TEST_GRID} />);
    expect(screen.getAllByRole('img')).toHaveLength(15);
  });

  it('renders the correct emoji and label per symbol', () => {
    render(<ReelGrid grid={TEST_GRID} />);

    // Wolf cell
    const wolfCells = screen.getAllByLabelText('Wolf');
    expect(wolfCells.length).toBeGreaterThan(0);
    expect(wolfCells[0].textContent).toBe('🐺');

    // Deer cell
    const deerCells = screen.getAllByLabelText('Deer');
    expect(deerCells.length).toBeGreaterThan(0);
    expect(deerCells[0].textContent).toBe('🦌');
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
    const { container } = render(<ReelGrid grid={TEST_GRID} />);
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
});
