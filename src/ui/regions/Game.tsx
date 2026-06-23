// Game region — central play area for the 5×3 reel grid (STAGE-003).
// SPEC-012: renders the static idle grid; SPEC-013 will wire live spins.
import ReelGrid from '../reels/ReelGrid';
import { INITIAL_GRID } from '../reels/symbols';

export default function Game() {
  return (
    <main className="cabinet__game">
      <ReelGrid grid={INITIAL_GRID} />
    </main>
  );
}
