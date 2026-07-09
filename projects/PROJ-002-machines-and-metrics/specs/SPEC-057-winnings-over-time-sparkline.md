---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-057
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-009
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # build/verify: single-agent autonomous run (see cost notes)
  created_at: 2026-07-09

references:
  decisions:
    - DEC-001   # engine-no-dom: the sparkline is pure presentation over the recorded series; engine untouched
    - DEC-010   # global token CSS, no raw hex, prefixed classes
    - DEC-020   # the session-stats model — the cumulative-net series this plots + its bound
  constraints:
    - respect-reduced-motion
    - portrait-first
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-056  # StatsSheet — the panel this sparkline is added to (shipped)
    - SPEC-054  # sessionStats — the SessionStats.series (cumulative net) this reads (shipped)
    - SPEC-020  # PaytableSheet — the sheet idiom the panel mirrors

value_link: >-
  Closes STAGE-009's "visible sense of progress": a dependency-free SVG sparkline of the
  cumulative-net-winnings series (DEC-020) in the session-stats panel — the player SEES their
  session trend rise and fall around break-even, not just read the numbers. The last brick of the
  stage; no new dependency, no engine change.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design authored on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-09
      note: >-
        Design authored on the main Opus loop (un-metered). Pure-UI spec: no engine/simulation to
        pin — the "measure-then-pin" discipline here means pinning the computed SVG geometry against
        the exact projection math BEFORE writing the failing tests, so the build is transcription.
        Computed the polyline via a self-contained geometry script (scratchpad/geom.mjs, plain node —
        the sparkline has NO engine dependency): viewBox 0 0 100 32, PAD 2, innerW 96, innerH 28,
        x(i)=PAD+(i/(n-1))*innerW, y(v)=PAD+(1-(v-min)/(max-min))*innerH (flat→H/2), coords .toFixed(2).
        Pinned: series [10,-5,30] ⇒ points "2.00,18.00 50.00,30.00 98.00,2.00", baseline y "26.00"
        (crosses zero), trend up; [3,8,12] ⇒ "2.00,30.00 50.00,14.44 98.00,2.00", no baseline; [7,7,7]
        ⇒ flat "…,16.00" ×3; [5,-20] ⇒ trend down; <2 points ⇒ empty state. No new DEC (pure
        presentation over DEC-020's series; token-styled per DEC-010; static/non-animated render so
        respect-reduced-motion holds by construction; hand-rolled SVG so no new dep).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # single-agent autonomous run — nominal estimate recorded at ship (not separately metered)
      recorded_at: 2026-07-09
      note: >-
        Transcribed the spec's drop-ins verbatim: Sparkline.tsx + Sparkline.test.tsx (6 tests), the
        stats.css append (.stats__sparkline-* + .sparkline* token styles, no raw hex), the StatsSheet.tsx
        import + <Sparkline series={stats.series}/> mount between the metric grid and Clear button, and
        1 StatsSheet.test.tsx integration test. Full gate green: typecheck, lint, test (69 files / 408
        tests, +7 new all passing), build, validate, cost-audit. Boundary diffs vs main EMPTY:
        src/engine/ (DEC-001) and src/stats/ (DEC-020 model frozen). No new dependency, no new DEC, no
        raw hex. tokens_total left null — single-agent autonomous run, filled with a nominal estimate at
        ship per the run's cost convention.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-057: Winnings-over-time sparkline

## Context

STAGE-009 gives the player a **visible sense of progress**. SPEC-054 built the pure stats model
with a bounded **cumulative-net-winnings series** (`SessionStats.series`, DEC-020); SPEC-055 made it
reactive and recording; SPEC-056 shipped the panel with the numeric tiles + Clear-stats control —
but deliberately deferred the sparkline to this spec. This spec adds the sparkline, closing the
stage's backlog (the 4th of 4 specs).

It is the "visible sense of progress" **visual**: a dependency-free SVG polyline of the series in
the `StatsSheet`, drawn with a zero baseline when the session crosses break-even and colored by the
final net sign, plus an empty-state for a session with fewer than two recorded spins. Pure
presentation — no engine change (DEC-001, the series is already recorded), token-styled global CSS
with no raw hex (DEC-010), hand-rolled SVG so no new charting dependency
(`no-new-top-level-deps-without-decision`), and a **static (non-animated)** render so
`respect-reduced-motion` holds by construction. **No new DEC.**

## Goal

Add a `Sparkline` component that renders `SessionStats.series` (cumulative net winnings, DEC-020) as
a dependency-free SVG polyline inside the session-stats panel, with a zero baseline, up/down trend
color, and a sub-two-points empty state.

## Inputs

- **Files to read:** `src/stats/sessionStats.ts` (the `series: number[]` shape + `SERIES_CAP`),
  `src/ui/stats/StatsSheet.tsx` (the panel to mount into), `src/ui/stats/stats.css` (the token CSS
  to extend), `decisions/DEC-020-session-stats-model.md` (the series is cumulative-net, bounded 200).
- **Related code paths:** `src/ui/stats/`.

## Outputs

- **Files created:**
  - `src/ui/stats/Sparkline.tsx` — the SVG sparkline component (`Sparkline({ series })`).
  - `src/ui/stats/Sparkline.test.tsx` — 6 failing tests (below).
- **Files modified:**
  - `src/ui/stats/StatsSheet.tsx` — mount `<Sparkline series={stats.series} />` under a labelled
    wrapper, between the metric grid and the Clear-stats button.
  - `src/ui/stats/stats.css` — append the `.stats__sparkline-*` + `.sparkline*` token styles.
  - `src/ui/stats/StatsSheet.test.tsx` — add 1 integration test (sparkline mounts with a seeded series).
- **New exports:** `Sparkline(props: { series: number[] }): JSX.Element`.

## Acceptance Criteria

- [ ] A session with **≥ 2** series points renders an `<svg data-testid="sparkline">` containing a
      `<polyline data-testid="sparkline-line">` whose `points` match the pinned projection.
- [ ] A session with **< 2** points renders `data-testid="sparkline-empty"` and **no** `sparkline` svg.
- [ ] The polyline is colored **up** (`sparkline__line--up`) when the final series value is `≥ 0`,
      **down** (`sparkline__line--down`) otherwise.
- [ ] A **dashed zero baseline** (`data-testid="sparkline-baseline"`) is drawn iff the series strictly
      crosses zero (`min < 0 < max`); it is absent when every point is on one side of zero.
- [ ] A flat series (all equal) is drawn on the vertical midline (y `16.00`).
- [ ] The sparkline is mounted in `StatsSheet` and visible when the panel is open.
- [ ] Render is **static** (no SVG/CSS animation) — `respect-reduced-motion` holds by construction.
- [ ] No new top-level dependency; no raw hex in CSS; `git diff main..HEAD -- src/engine/` EMPTY.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.

## Failing Tests

Written during **design**, BEFORE build. Coordinates pinned via the geometry script (see the design
cost note). `.tsx` (JSX). `render`/`screen`/`rerender` only — no `userEvent`.

- **`src/ui/stats/Sparkline.test.tsx`** (new — 6 tests)
  - `"shows an empty state below two points"` — `series={[]}` ⇒ `sparkline-empty` present, `sparkline`
    absent; `rerender` `series={[5]}` ⇒ still `sparkline-empty`, `sparkline` absent.
  - `"plots pinned polyline points for a mixed series"` — `series={[10, -5, 30]}` ⇒
    `sparkline-line`.points === `"2.00,18.00 50.00,30.00 98.00,2.00"`.
  - `"draws a dashed zero baseline when the series crosses break-even"` — `series={[10, -5, 30]}` ⇒
    `sparkline-baseline` present with `y1` === `y2` === `"26.00"`.
  - `"omits the baseline when every point is on one side of zero"` — `series={[3, 8, 12]}` ⇒
    no `sparkline-baseline`; `sparkline-line`.points === `"2.00,30.00 50.00,14.44 98.00,2.00"`.
  - `"colors an up trend and a down trend by the final net"` — `series={[10, -5, 30]}` ⇒ class contains
    `sparkline__line--up`; `rerender` `series={[5, -20]}` ⇒ class contains `sparkline__line--down`.
  - `"centers a flat series on the vertical midline"` — `series={[7, 7, 7]}` ⇒ `sparkline-line`.points
    === `"2.00,16.00 50.00,16.00 98.00,16.00"`.
- **`src/ui/stats/StatsSheet.test.tsx`** (add 1 test)
  - `"renders the winnings-over-time sparkline when opened with a series"` — `writeStats(SEEDED)`
    (SEEDED.series `[10, -5, 30]`), open the panel ⇒ `sparkline` present and `sparkline-line`.points
    === `"2.00,18.00 50.00,30.00 98.00,2.00"`.

## Implementation Context

### Decisions that apply
- `DEC-001` — engine untouched; the sparkline reads `stats.series` the seam already recorded.
- `DEC-010` — global token CSS via `stats.css`, prefixed classes, **no raw hex**.
- `DEC-020` — `series` is **cumulative net** per spin, FIFO-bounded to `SERIES_CAP` (200); cash-ins do
  not append a point. Plotting it is honest "progress" (cash-in-independent, per DEC-020's axis choice).

### Constraints that apply
- `respect-reduced-motion` — the render is **static** (no animation), satisfying this by construction.
- `portrait-first` — the svg is `width:100%`, fixed `height:var(--space-8)` (64px), legible at 375px.
- `no-new-top-level-deps-without-decision` — hand-rolled SVG; **no** charting library.

### Prior related work
- `SPEC-056` (shipped, PR #66) — `StatsSheet`; this mounts into it. `SPEC-054` (shipped) — the series.

### Out of scope (for this spec specifically)
- Any interactivity (hover tooltips, point markers, axis labels) — a static trend line only.
- Animation / draw-in transition — deliberately omitted (reduced-motion + simplicity).
- Per-machine series or any model change — the model is fixed (DEC-020); this is pure presentation.

## Notes for the Implementer

Drop-in code follows. Transcribe verbatim; the coordinates are pinned.

### `src/ui/stats/Sparkline.tsx` (new)

```tsx
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
```

### `src/ui/stats/StatsSheet.tsx` — mount (between the grid `</div>` and the Clear button)

Add the import near the other local imports:
```tsx
import { Sparkline } from './Sparkline';
```
Insert directly after the `</div>` that closes `stats__grid` and before the Clear-stats `<button>`:
```tsx
            <div className="stats__sparkline-wrap">
              <span className="stats__sparkline-label">Winnings over time</span>
              <Sparkline series={stats.series} />
            </div>
```

### `src/ui/stats/stats.css` — append

```css
/* ─── Winnings-over-time sparkline (SPEC-057) ────────────────────────────────── */

.stats__sparkline-wrap {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stats__sparkline-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

/* Static, non-animated render — respects prefers-reduced-motion by construction (SPEC-057). */
.sparkline {
  display: block;
  width: 100%;
  height: var(--space-8); /* 64px */
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
}

.sparkline__line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sparkline__line--up {
  stroke: var(--color-coin);
}

.sparkline__line--down {
  stroke: var(--color-accent);
}

.sparkline__baseline {
  stroke: var(--color-text-muted);
  stroke-width: 1;
  stroke-dasharray: 2 2;
  opacity: 0.6;
}

.sparkline__empty {
  padding: var(--space-5) var(--space-3);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-base);
}
```

### `src/ui/stats/Sparkline.test.tsx` (new)

```tsx
// Sparkline rendering tests — SPEC-057 failing tests (written at design). Coordinates pinned via
// the geometry script. render/rerender only (no userEvent).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('shows an empty state below two points', () => {
    const { rerender } = render(<Sparkline series={[]} />);
    expect(screen.getByTestId('sparkline-empty')).toBeTruthy();
    expect(screen.queryByTestId('sparkline')).toBeNull();

    rerender(<Sparkline series={[5]} />);
    expect(screen.getByTestId('sparkline-empty')).toBeTruthy();
    expect(screen.queryByTestId('sparkline')).toBeNull();
  });

  it('plots pinned polyline points for a mixed series', () => {
    render(<Sparkline series={[10, -5, 30]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,18.00 50.00,30.00 98.00,2.00',
    );
  });

  it('draws a dashed zero baseline when the series crosses break-even', () => {
    render(<Sparkline series={[10, -5, 30]} />);
    const baseline = screen.getByTestId('sparkline-baseline');
    expect(baseline.getAttribute('y1')).toBe('26.00');
    expect(baseline.getAttribute('y2')).toBe('26.00');
  });

  it('omits the baseline when every point is on one side of zero', () => {
    render(<Sparkline series={[3, 8, 12]} />);
    expect(screen.queryByTestId('sparkline-baseline')).toBeNull();
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,30.00 50.00,14.44 98.00,2.00',
    );
  });

  it('colors an up trend and a down trend by the final net', () => {
    const { rerender } = render(<Sparkline series={[10, -5, 30]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('class')).toContain(
      'sparkline__line--up',
    );

    rerender(<Sparkline series={[5, -20]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('class')).toContain(
      'sparkline__line--down',
    );
  });

  it('centers a flat series on the vertical midline', () => {
    render(<Sparkline series={[7, 7, 7]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,16.00 50.00,16.00 98.00,16.00',
    );
  });
});
```

### `src/ui/stats/StatsSheet.test.tsx` — add one test (inside the existing `describe`)

```tsx
  it('renders the winnings-over-time sparkline when opened with a series', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByTestId('sparkline')).toBeTruthy();
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,18.00 50.00,30.00 98.00,2.00',
    );
  });
```

Adversarial guard-mutations for verify (each must fail exactly its target, then revert):
1. Break the y-inversion (drop the `1 -` in `yAt`) ⇒ "plots pinned polyline points" fails.
2. Loosen the empty threshold (`MIN_POINTS` 2 → 1) ⇒ "shows an empty state below two points" fails on `[5]`.
3. Drop the baseline `crossesZero` guard (always render, or never) ⇒ baseline present/absent tests fail.
4. Flip the trend test (`net >= 0` → `net < 0`) ⇒ "colors an up trend and a down trend" fails.
5. Break flat centering (`VIEW_H / 2` → `0`) ⇒ "centers a flat series" fails.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-057-winnings-sparkline`
- **PR (if applicable):** opened at ship.
- **All acceptance criteria met?** Yes — all 9 boxes. New `Sparkline` renders the pinned polyline for
  ≥2 points, the empty state below 2, up/down color by final net, the dashed zero baseline iff the
  series crosses break-even, flat series on the midline; mounted + visible in `StatsSheet`; static
  (no animation); no new dep, no raw hex; engine + stats-model diffs EMPTY; full gate green (69 files /
  408 tests).
- **New decisions emitted:** none (pure presentation over DEC-020).
- **Deviations from spec:** none — drop-ins transcribed verbatim; pinned coordinates matched on first run.
- **Follow-up work identified:** none for this stage. (A future PROJ-003 spec could add point markers /
  a hover read-out or a per-machine series once DEC-020's versioned `perMachine` dimension lands.)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing. Pinning the SVG geometry against a self-contained node script before writing the tests
   made the build pure transcription; every pinned coordinate matched on the first `just test`.
2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-001/010/020 + respect-reduced-motion + no-new-dep covered the surface exactly; the
   "measure-then-pin against the *geometry*" note correctly flagged there is no engine to measure here.
3. **If you did this task again, what would you do differently?**
   — Nothing material. Choosing a viewBox (100×32) whose projection yields clean round coordinates for
   the seed series made the pinned strings readable — worth doing deliberately for any pinned-SVG spec.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   —
2. **Does any template, constraint, or decision need updating?**
   —
3. **Is there a follow-up spec I should write now before I forget?**
   —
