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
