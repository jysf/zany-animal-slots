// Tests for the Game region (SPEC-012): verifies the reel grid renders inside
// the main region with the expected 15 symbol cells.
import { render, screen } from '@testing-library/react';
import Game from './Game';

describe('Game', () => {
  it('the Game region renders the reel grid', () => {
    render(<Game />);
    const main = screen.getByRole('main');
    // 5 reels × 3 cells = 15 symbol cells with role="img"
    const cells = screen.getAllByRole('img');
    expect(cells).toHaveLength(15);
    // All cells are inside the main region
    for (const cell of cells) {
      expect(main).toContainElement(cell);
    }
  });
});
