// PaylineMap — small per-line shape diagrams for the Paytable's "How wins work"
// section. Purely data-driven from the engine's PAYLINES (DEC-003 mechanics;
// DEC-016 widens the set to 20 lines): each line's `rows` array gives the active
// row per reel, so the drawn shape can never drift from the evaluator. No
// animation → no reduced-motion / perf-contract surface.
// DEC-010: token colors only (set via CSS classes in paytable.css).
// DEC-016: 20 lines can't be enumerated in a Record<LineId, string> — labels are
// derived from the line's index in PAYLINES instead (`Line N` / `Payline N`).
import { PAYLINES } from '../engine/index';

const COLS = 5;
const ROWS = 3;
const CELL = 10; // SVG units per cell
const HALF = CELL / 2;
const cx = (reel: number) => reel * CELL + HALF;
const cy = (row: number) => row * CELL + HALF;

export default function PaylineMap() {
  return (
    <ul className="payline-map" aria-label="Paylines">
      {PAYLINES.map((line, i) => {
        const points = line.rows.map((row, reel) => `${cx(reel)},${cy(row)}`).join(' ');
        return (
          <li key={line.id} className="payline-map__item">
            <svg
              className="payline-map__grid"
              viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
              role="img"
              aria-label={`Payline ${i + 1}`}
              data-line={line.id}
            >
              {Array.from({ length: COLS }).flatMap((_, reel) =>
                Array.from({ length: ROWS }).map((__, row) => {
                  const on = line.rows[reel] === row;
                  return (
                    <circle
                      key={`${reel}-${row}`}
                      className={on ? 'payline-map__dot payline-map__dot--on' : 'payline-map__dot'}
                      cx={cx(reel)}
                      cy={cy(row)}
                      r={on ? 2.6 : 1.5}
                      data-on={on ? 'true' : undefined}
                    />
                  );
                }),
              )}
              <polyline className="payline-map__path" points={points} fill="none" />
            </svg>
            <span className="payline-map__label">{`Line ${i + 1}`}</span>
          </li>
        );
      })}
    </ul>
  );
}
