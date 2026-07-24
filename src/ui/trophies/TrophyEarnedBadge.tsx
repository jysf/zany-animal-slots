// TrophyEarnedBadge — announces a spin that entered the trophy case, with a distinct
// "new best" treatment at rank 1 (SPEC-077). Renders nothing when trophyRank is null —
// the badge must never claim a trophy was earned when it wasn't (the whole hazard this
// spec exists to avoid).
//
// trophyRank is computed pre-record by the pure trophyRank() predicate in sessionStats.ts,
// which shares insertTopWin's semantics by construction (DEC-024) — this component only
// renders what it is told, no re-derivation (DEC-001).
//
// Mirrors WinBadge's idiom: role="status" for assistive tech, a data-* attribute as a
// colorblind-safe cue (not color alone), CSS keyframe pop-in with a prefers-reduced-motion
// off-switch. It is mounted in .cabinet__winbanner alongside WinBadge (SPEC-019) — that band
// sits under the header and never overlays the reel grid, so the lit winning cells stay
// visible (portrait-first constraint).
import './trophies.css';

interface Props {
  /** 1-based trophy-case rank, or null if this spin did not earn a trophy. */
  trophyRank: number | null;
}

export default function TrophyEarnedBadge({ trophyRank }: Props) {
  // Guard: no trophy, no badge. This is the load-bearing "never lie" behavior.
  if (trophyRank === null) return null;

  const isNewBest = trophyRank === 1;

  return (
    <div className="trophy-earned-badge" data-rank={isNewBest ? 'best' : 'trophy'} role="status">
      {isNewBest ? 'NEW BEST!' : `TROPHY #${trophyRank}`}
    </div>
  );
}
