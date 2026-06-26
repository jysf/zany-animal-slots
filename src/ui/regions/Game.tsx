// Game region — central play area for the 5×3 reel grid (STAGE-003).
// SPEC-013: now accepts a `grid` prop from App (live hook state) so the board
// reflects each spin result. ReelGrid remains pure — it only renders what it
// is given.
// SPEC-016: threads the `spinning` prop to ReelGrid so the CSS animation can start.
// SPEC-018: threads lineWins to ReelGrid so winning cells are highlighted.
import type { Grid, LineWin } from '../../engine/index';
import ReelGrid from '../reels/ReelGrid';

interface Props {
  grid: Grid;
  spinning?: boolean;
  lineWins?: LineWin[];
}

export default function Game({ grid, spinning = false, lineWins = [] }: Props) {
  return (
    <main className="cabinet__game">
      <ReelGrid grid={grid} spinning={spinning} lineWins={lineWins} />
    </main>
  );
}
