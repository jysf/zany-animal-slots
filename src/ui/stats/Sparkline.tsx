// Sparkline.tsx — dependency-free SVG sparkline of the winnings-over-time series (SPEC-057).
// Pure presentation: takes the bounded cumulative-net series (SessionStats.series, DEC-020) and
// draws one polyline, a dashed zero baseline when the session crosses break-even, and an up/down
// color by the final net sign. Static (non-animated) render — respects prefers-reduced-motion by
// construction. DEC-010: token colors via prefixed classes, no raw hex. DEC-001: engine untouched.
import './stats.css';

// A 100×32 unitless viewBox; the svg stretches to its CSS box (preserveAspectRatio="none") and the
// stroke is kept constant via vector-effect. PAD insets the drawing so the line never clips.
const VIEW_W = 100;
const VIEW_H = 32;
const PAD = 2;
const INNER_W = VIEW_W - PAD * 2; // 96
const INNER_H = VIEW_H - PAD * 2; // 28

/** A trend line needs at least two points; below that we show an empty state. */
const MIN_POINTS = 2;

export interface SparklineProps {
  /** Cumulative-net-per-spin series (DEC-020), already FIFO-bounded to SERIES_CAP by the model. */
  series: number[];
}

export function Sparkline({ series }: SparklineProps) {
  if (series.length < MIN_POINTS) {
    return (
      <p className="sparkline__empty" data-testid="sparkline-empty">
        Spin a few times to see your winnings over time.
      </p>
    );
  }

  const n = series.length;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const flat = max === min;

  const xAt = (i: number) => (n === 1 ? VIEW_W / 2 : PAD + (i / (n - 1)) * INNER_W);
  const yAt = (v: number) => (flat ? VIEW_H / 2 : PAD + (1 - (v - min) / (max - min)) * INNER_H);

  const points = series.map((v, i) => `${xAt(i).toFixed(2)},${yAt(v).toFixed(2)}`).join(' ');

  // A dashed break-even reference, only when the series actually straddles zero.
  const crossesZero = !flat && min < 0 && max > 0;
  const baselineY = crossesZero ? yAt(0).toFixed(2) : null;

  const net = series[series.length - 1];
  const trend = net >= 0 ? 'up' : 'down';

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Winnings over time: net ${net >= 0 ? 'up' : 'down'} ${Math.abs(net)} across ${n} spins`}
      data-testid="sparkline"
    >
      {baselineY !== null && (
        <line
          className="sparkline__baseline"
          x1={PAD}
          x2={VIEW_W - PAD}
          y1={baselineY}
          y2={baselineY}
          vectorEffect="non-scaling-stroke"
          data-testid="sparkline-baseline"
        />
      )}
      <polyline
        className={`sparkline__line sparkline__line--${trend}`}
        points={points}
        vectorEffect="non-scaling-stroke"
        data-testid="sparkline-line"
      />
    </svg>
  );
}
