// Game region — central play area for the 5×3 reel grid (STAGE-003).
// SPEC-013: now accepts a `grid` prop from App (live hook state) so the board
// reflects each spin result. ReelGrid remains pure — it only renders what it
// is given.
// SPEC-016: threads the `spinning` prop to ReelGrid so the CSS animation can start.
// SPEC-018: threads lineWins to ReelGrid so winning cells are highlighted.
// SPEC-019 (repositioned): the WinBadge no longer overlays the board — it now
// lives in the .cabinet__winbanner band under the header (see App), so the reels
// stay unobstructed on a win.
// SPEC-023: accepts celebration and passes trailKey to ReelGrid for paw-print trail.
// SPEC-024: renders ParticleBurst overlay — leaves/acorns erupt on a win, count scaled by tier.
import type { Grid, LineWin } from '../../engine/index';
import type { Celebration } from '../useSlotMachine';
import ReelGrid from '../reels/ReelGrid';
import ParticleBurst from '../reels/ParticleBurst';

interface Props {
  grid: Grid;
  spinning?: boolean;
  lineWins?: LineWin[];
  /** One-shot win signal; paws render on winning cells when celebration != null (SPEC-023). */
  celebration?: Celebration | null;
}

export default function Game({ grid, spinning = false, lineWins = [], celebration }: Props) {
  return (
    <main className="cabinet__game">
      <ReelGrid grid={grid} spinning={spinning} lineWins={lineWins} trailKey={celebration?.id ?? null} />
      <ParticleBurst celebration={celebration} />
    </main>
  );
}
