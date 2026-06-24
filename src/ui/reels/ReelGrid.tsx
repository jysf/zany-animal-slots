// ReelGrid — renders a 5×3 Grid of SymbolIds as emoji cells (SPEC-012).
// SPEC-016: accepts a `spinning` prop. When true, adds .reel--spinning on each
// reel and .reel-grid--spinning on the wrapper so CSS can animate the spin. Each
// reel also carries an inline --reel-index custom property so the CSS can stagger
// animation delays left→right (the reel-stop bounce cascades column by column).
// Pure function of its props; no internal state.
import type { Grid } from '../../engine/index';
import { SYMBOL_DISPLAY } from './symbols';
import './reels.css';

interface Props {
  grid: Grid;
  spinning?: boolean;
}

export default function ReelGrid({ grid, spinning = false }: Props) {
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
            const { emoji, label } = SYMBOL_DISPLAY[symbolId];
            return (
              <span
                key={rowIndex}
                className="reel__cell"
                role="img"
                aria-label={label}
              >
                {emoji}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
