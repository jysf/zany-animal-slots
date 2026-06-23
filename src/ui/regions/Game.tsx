// Game region — central play area for the 5×3 reel grid (STAGE-003).
// SPEC-013: now accepts a `grid` prop from App (live hook state) so the board
// reflects each spin result. ReelGrid remains pure — it only renders what it
// is given.
import type { Grid } from '../../engine/index';
import ReelGrid from '../reels/ReelGrid';

interface Props {
  grid: Grid;
}

export default function Game({ grid }: Props) {
  return (
    <main className="cabinet__game">
      <ReelGrid grid={grid} />
    </main>
  );
}
