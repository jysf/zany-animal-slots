// ReelGrid — renders a 5×3 Grid of SymbolIds as emoji cells (SPEC-012).
// SPEC-016: accepts a `spinning` prop. When true, adds .reel--spinning on each
// reel and .reel-grid--spinning on the wrapper so CSS can animate the spin. Each
// reel also carries an inline --reel-index custom property so the CSS can stagger
// animation delays left→right (the reel-stop bounce cascades column by column).
// SPEC-018: accepts lineWins; adds .reel__cell--win to winning cells when not
// spinning. While spinning the highlight is suppressed so no stale win shows.
// SPEC-041: reads symbolDisplay from a prop (the machine's presentation slice)
// instead of importing the module-level emoji/label map from ./symbols.
// Pure function of its props; no internal state.
import type { Grid, LineWin } from '../../engine/index';
import type { SymbolDisplay } from '../../machines/types';
import { winningCellKeys } from './winningCells';
import './reels.css';

// A stable empty set so the reference never changes when lineWins is empty.
const EMPTY = new Set<string>();

interface Props {
  grid: Grid;
  spinning?: boolean;
  lineWins?: LineWin[];
  /** Key from celebration.id; when non-null, paw overlays render on winning cells.
   *  A new id value remounts the paw spans so the pop-in animation replays (SPEC-023). */
  trailKey?: number | null;
  /** Per-symbol emoji + label map, sourced from the active machine's presentation slice (SPEC-041). */
  symbolDisplay: SymbolDisplay;
}

export default function ReelGrid({ grid, spinning = false, lineWins = [], trailKey, symbolDisplay }: Props) {
  // Suppress the highlight while spinning so a stale win doesn't flash mid-spin.
  const winKeys = spinning ? EMPTY : winningCellKeys(lineWins);

  return (
    <div className={`reel-grid${spinning ? ' reel-grid--spinning' : ''}`}>
      {grid.map((cells, reelIndex) => (
        <div
          key={reelIndex}
          className={`reel${spinning ? ' reel--spinning' : ''}`}
          // --reel-index drives the staggered animation-delay in CSS.
          style={{ ['--reel-index' as string]: reelIndex }}
        >
          {cells.map((symbolId, rowIndex) => {
            const { emoji, label } = symbolDisplay[symbolId];
            const isWin = winKeys.has(`${reelIndex}:${rowIndex}`);
            return (
              <span
                key={rowIndex}
                className={`reel__cell${isWin ? ' reel__cell--win' : ''}`}
                role="img"
                aria-label={label}
              >
                {emoji}
                {isWin && trailKey != null && (
                  <span className="reel__paw" aria-hidden="true" key={`paw-${trailKey}`}>🐾</span>
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
