// ReelGrid — renders a 5×3 Grid of SymbolIds as emoji cells (SPEC-012).
// Pure function of its grid prop; no internal state (SPEC-013 feeds live spins).
import type { Grid } from '../../engine/index';
import { SYMBOL_DISPLAY } from './symbols';
import './reels.css';

interface Props {
  grid: Grid;
}

export default function ReelGrid({ grid }: Props) {
  return (
    <div className="reel-grid">
      {grid.map((cells, reelIndex) => (
        <div key={reelIndex} className="reel">
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
