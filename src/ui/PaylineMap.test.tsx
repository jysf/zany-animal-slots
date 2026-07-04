// PaylineMap tests — the diagrams must stay in lockstep with the engine's
// PAYLINES (they are the source of truth for line shapes, DEC-003).
import { render, screen } from '@testing-library/react';
import PaylineMap from './PaylineMap';
import { PAYLINES } from '../engine/index';

describe('PaylineMap', () => {
  it('renders one diagram per engine payline', () => {
    const { container } = render(<PaylineMap />);
    const grids = container.querySelectorAll('.payline-map__grid');
    expect(grids).toHaveLength(PAYLINES.length);
  });

  it('highlights exactly the active cell per reel for each line', () => {
    const { container } = render(<PaylineMap />);
    for (const line of PAYLINES) {
      const grid = container.querySelector(`.payline-map__grid[data-line="${line.id}"]`);
      expect(grid, `diagram for ${line.id} must exist`).not.toBeNull();
      // One active dot per reel = one per column.
      const on = grid!.querySelectorAll('.payline-map__dot--on');
      expect(on).toHaveLength(line.rows.length);
      // The connecting path passes through each active cell (one point per reel).
      const points = grid!.querySelector('.payline-map__path')!.getAttribute('points')!;
      expect(points.trim().split(/\s+/)).toHaveLength(line.rows.length);
    }
  });

  it('exposes an accessible label per line', () => {
    render(<PaylineMap />);
    // Every line renders an SVG with role=img and a descriptive name.
    const imgs = screen.getAllByRole('img');
    expect(imgs.length).toBeGreaterThanOrEqual(PAYLINES.length);
    expect(imgs.some((el) => /middle row/i.test(el.getAttribute('aria-label') ?? ''))).toBe(true);
  });
});
