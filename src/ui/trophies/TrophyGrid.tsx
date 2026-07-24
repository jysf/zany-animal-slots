// TrophyGrid — renders a saved TopWin as a reel grid in its ORIGINATING machine's
// identity (DEC-021), not the currently-active machine's. Presentation only: reads the
// trophy the stats layer already stored (DEC-001); no engine or storage change (SPEC-075).
import { MACHINES, getMachine } from '../../machines/registry';
import type { TopWin } from '../../stats/sessionStats';
import ReelGrid from '../reels/ReelGrid';
import './trophies.css';

export interface TrophyGridProps {
  trophy: TopWin;
  /** Presentational size — 'card' (default, hero card) or 'thumb' (compact row). SPEC-076 composes these. */
  size?: 'card' | 'thumb';
  /** Forwarded to ReelGrid (SPEC-078 replay). When true, plays the spin animation and
   *  suppresses the winning-cell highlight, exactly as the live reels do while spinning. */
  spinning?: boolean;
  /** Forwarded to ReelGrid (SPEC-078 replay). A new value remounts the paw overlays so the
   *  pop-in animation replays (SPEC-023 idiom). */
  trailKey?: number | null;
}

export default function TrophyGrid({
  trophy,
  size = 'card',
  spinning = false,
  trailKey = null,
}: TrophyGridProps) {
  // getMachine() falls back to the default machine for an unknown id, which would
  // silently misattribute a saved win's creatures (DEC-021). Detect the miss and say so
  // rather than lying about provenance.
  const isKnown = Object.prototype.hasOwnProperty.call(MACHINES, trophy.machineId);
  const machine = getMachine(trophy.machineId);
  const name = isKnown ? machine.name : `Unknown machine (${trophy.machineId})`;
  const label = `${trophy.amount} coins on ${name}, ${trophy.tier} win`;

  return (
    <div
      className={`trophy-grid${isKnown ? '' : ' trophy-grid--unknown-machine'}`}
      role="img"
      aria-label={label}
    >
      <ReelGrid
        grid={trophy.grid}
        lineWins={trophy.lineWins}
        paylines={machine.math.paylines}
        symbolDisplay={machine.presentation.symbolDisplay}
        size={size}
        spinning={spinning}
        trailKey={trailKey}
      />
    </div>
  );
}
