# SPEC-057 — BUILD prompt

> Single-agent autonomous run (user present, "finish it"). LOCAL ONLY during build: branch + local
> commits; NO push/PR/gh/advance-cycle until ship. A visible UI addition (winnings-over-time
> sparkline in the session-stats panel) — pure presentation (DEC-001), token-styled (DEC-010),
> hand-rolled SVG (no new dep), static render (respect-reduced-motion by construction).

```
Cycle: build. The spec file is the context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-057-winnings-over-time-sparkline.md — the ENTIRE
   Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes have COMPLETE
   drop-in code for Sparkline.tsx, the StatsSheet.tsx mount, the stats.css append, Sparkline.test.tsx,
   and the StatsSheet.test.tsx addition. Implement it VERBATIM (coordinates are pinned).
3. /decisions/DEC-001, DEC-010, DEC-020 (read only).
4. Source (read to edit): src/ui/stats/StatsSheet.tsx, src/ui/stats/stats.css,
   src/ui/stats/StatsSheet.test.tsx; (read only) src/stats/sessionStats.ts.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-057-winnings-sparkline

Implement EXACTLY the spec. New files:
- src/ui/stats/Sparkline.tsx — Sparkline({ series }): <2 points ⇒ sparkline-empty <p>; else an
  <svg data-testid="sparkline"> with an optional dashed zero baseline (sparkline-baseline, only when
  min<0<max) and a <polyline data-testid="sparkline-line"> classed sparkline__line--up/down by the
  final net sign; viewBox 0 0 100 32, PAD 2, coords .toFixed(2), vector-effect non-scaling-stroke.
- src/ui/stats/Sparkline.test.tsx — the 6 tests from Failing Tests (pinned coordinates).
Modified files:
- src/ui/stats/StatsSheet.tsx — import { Sparkline }; mount <div class="stats__sparkline-wrap"> with a
  label + <Sparkline series={stats.series} /> between the stats__grid </div> and the Clear button.
- src/ui/stats/stats.css — append the .stats__sparkline-* + .sparkline* token styles (no raw hex).
- src/ui/stats/StatsSheet.test.tsx — add the 1 integration test (sparkline mounts with SEEDED series).

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001).
- `git diff main..HEAD -- src/stats/` MUST be EMPTY (SPEC-054 model frozen; DEC-020).
- No new dependency (hand-rolled SVG). No new DEC. No raw hex in stats.css (DEC-010) — token vars only.
- No animation on the sparkline (respect-reduced-motion by construction).

Repo toolchain gotchas: ESLint has NO react-hooks plugin. NO @testing-library/user-event (use
render/fireEvent/rerender). JSX test files are .tsx. tsconfig include is ["src"]. App.test renders
<App/> WITHOUT a StatsProvider — StatsSheet's useStats() returns the no-op empty default (series []),
so the sparkline renders its empty state and App.test stays green (do NOT wrap it). Pinned coordinates
(derived via scratchpad/geom.mjs against the exact projection math): [10,-5,30] ⇒
"2.00,18.00 50.00,30.00 98.00,2.00" (baseline "26.00", up); [3,8,12] ⇒
"2.00,30.00 50.00,14.44 98.00,2.00" (no baseline); [7,7,7] ⇒ "2.00,16.00 50.00,16.00 98.00,16.00";
[5,-20] ⇒ down.

Gate (all exit 0): just typecheck && just lint && just test && just build && just validate && just cost-audit
Confirm the new tests ran and passed and the full existing suite is still green.

When done: fill "## Build Completion" (+3 reflection answers); replace the build cost session
placeholder (recorded_at 2026-07-09, note what you did); mark build [x] in the timeline; commit
locally referencing SPEC-057 (end with the Co-Authored-By line). Do NOT stage untracked reports/.
DO NOT push / open a PR / run gh / run just advance-cycle.
```
