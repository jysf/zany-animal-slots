# SPEC-057 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-057-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-09 (Opus): the **last brick of STAGE-009** — a dependency-free
      SVG sparkline (`src/ui/stats/Sparkline.tsx`) of the cumulative-net winnings series
      (`SessionStats.series`, DEC-020) added to the `StatsSheet` panel (SPEC-056) between the metric
      grid and the Clear-stats button. Followed the measure-then-pin discipline against the *geometry*
      (no engine dependency): computed the SVG projection via a self-contained script
      (`scratchpad/geom.mjs`, plain node) and pinned exact polyline coordinates BEFORE writing the
      failing tests — viewBox `0 0 100 32`, PAD 2, `x=PAD+(i/(n-1))*96`, `y=PAD+(1-(v-min)/(max-min))*28`
      (flat→`H/2`), coords `.toFixed(2)`. Pinned: `[10,-5,30]` ⇒ `"2.00,18.00 50.00,30.00 98.00,2.00"`
      + dashed zero baseline `y "26.00"` (crosses break-even) + up-trend color; `[3,8,12]` ⇒
      `"2.00,30.00 50.00,14.44 98.00,2.00"` (no baseline); `[7,7,7]` ⇒ `"…,16.00"` ×3 (midline);
      `[5,-20]` ⇒ down-trend color; `<2` points ⇒ empty state. Up/down color = final-net sign
      (`--color-coin` / `--color-accent`). **Static, non-animated** render so `respect-reduced-motion`
      holds by construction. Pure presentation — **no new DEC** (DEC-001 engine untouched; DEC-020
      series frozen; DEC-010 token-only CSS, no raw hex; hand-rolled SVG so no new dependency). Complete
      drop-in `Sparkline.tsx` + `stats.css` append + `Sparkline.test.tsx` (6 tests) + the `StatsSheet.tsx`
      mount + 1 `StatsSheet.test.tsx` integration test, all in the spec's Notes. Five adversarial
      guard-mutations specified for verify (break y-inversion, loosen empty threshold, drop baseline
      guard, flip trend sign, break flat centering). **[S]** Build prompt written to
      `prompts/SPEC-057-build.md`.
- [x] **build** — completed 2026-07-09 (Opus, single-agent autonomous run, branch
      feat/spec-057-winnings-sparkline): transcribed the spec's drop-ins verbatim — `Sparkline.tsx`
      (SVG: <2 points → empty state; else polyline + optional dashed zero baseline, up/down color by
      final net, `.toFixed(2)` coords, `vector-effect: non-scaling-stroke`), `Sparkline.test.tsx`
      (6 tests), the `stats.css` append (`.stats__sparkline-*` + `.sparkline*` token styles, no raw
      hex), the `StatsSheet.tsx` import + `<Sparkline series={stats.series}/>` mount between the metric
      grid and the Clear button, and 1 `StatsSheet.test.tsx` integration test. Full gate green:
      typecheck, lint, test (69 files / 408 tests — +7 new all passing), build, validate, cost-audit.
      Boundary diffs vs main EMPTY: `src/engine/` (DEC-001) and `src/stats/` (DEC-020 model frozen).
      No new dependency, no new DEC, no raw hex. All coordinates matched their pins on first run; zero
      deviations.
- [x] **verify** — completed 2026-07-09 (Opus, cold review): full gate re-run green (typecheck, lint,
      test 69 files / 408 tests, build, validate, cost-audit — all exit 0). All 5 spec'd adversarial
      guard-mutations broke exactly their target test(s) then reverted clean: (1) drop the `1 -`
      y-inversion → the 3 coordinate-asserting tests fail; (2) `MIN_POINTS` 2→1 → empty-state test fails
      on the single-point case; (3) `crossesZero=false` → baseline test fails; (4) flip the trend sign →
      up/down color test fails; (5) flat centering `VIEW_H/2`→`0` → flat test fails. `git diff main..HEAD`
      on `src/engine/` and `src/stats/` EMPTY; no raw hex; no `.only`/`.skip`. Preview check: seeded a
      13-point crossing series into `localStorage` `zany:stats`, reloaded, opened 📊 Stats — a rising
      `sparkline__line--up` polyline (stroke = active Ocean theme `--color-coin`, fill none, 2px) with
      the dashed break-even baseline rendered; "Clear stats" degraded it to the empty state with all
      tiles zeroed. Zero defects.
