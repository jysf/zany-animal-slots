# SPEC-056 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A visible UI addition (header session-stats
> panel) — pure presentation (DEC-001), token-styled (DEC-010), ≥44px (touch-targets-44).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-056-session-stats-panel-ui.md — the ENTIRE
   Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes have COMPLETE
   drop-in code for StatsSheet.tsx, stats.css, StatsSheet.test.tsx, plus the Header.tsx + touch-target
   test edits. Implement it VERBATIM.
3. /decisions/DEC-001, DEC-010, DEC-020 (read only).
4. Source (read to edit): src/ui/regions/Header.tsx, src/ui/controls.touch-target.test.ts;
   (read only, to mirror) src/ui/PaytableSheet.tsx, src/ui/paytable.css, src/ui/stats/StatsProvider.tsx,
   src/stats/sessionStats.ts, src/machines/registry.ts.

Before coding, branch and mark build [~] in the SPEC-056 timeline (append a `- [~] **build** …` line).

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-056-session-stats-panel

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/stats/StatsSheet.tsx — trigger + slide-up dialog mirroring PaytableSheet; reads
  { stats, resetStats } = useStats() + deriveMetrics(stats); 5 tiles with data-testids
  (stat-spins / stat-winrate / stat-net / stat-cashins / stat-biggest); formatNet helper; "Clear stats"
  button calling resetStats(); getMachine() names the biggest-win machine.
- src/ui/stats/stats.css — token-only, prefixed stats__, no raw hex, ≥44px trigger/close/clear,
  prefers-reduced-motion fallback, 2-up tile grid.
- src/ui/stats/StatsSheet.test.tsx — the 6 tests from Failing Tests (closed-by-default, tiles from
  SEEDED, empty-state em dash, Clear stats zeroes, close on ✕, close on backdrop + Escape).
Modified files:
- src/ui/regions/Header.tsx — import { StatsSheet } and render <StatsSheet /> after <PaytableSheet />.
- src/ui/controls.touch-target.test.ts — add STATS_CSS fixture + the .stats__trigger and .stats__clear
  entries to CONTROLS.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001).
- No new dependency. No new DEC. No raw hex in stats.css (DEC-010) — token vars only.
- Do NOT modify src/stats/** or src/ui/stats/StatsProvider.tsx (SPEC-054/055 shipped/frozen).

Repo toolchain gotchas: ESLint has NO react-hooks plugin. NO @testing-library/user-event (use
render/fireEvent). JSX test files are .tsx. tsconfig include is ["src"]. App.test renders <App/>
WITHOUT a StatsProvider — StatsSheet's useStats() returns the no-op empty default, so the trigger
renders with zeros and App.test stays green (do NOT wrap it). The em dash in the empty-state test and
in the component must be the SAME character (— U+2014). Pinned metric strings were derived against the
real deriveMetrics(): SEEDED ⇒ spins "10", winrate "40%", net "+30", cashins "2", biggest "40".

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new tests ran and passed; the full
existing suite is still green; `git diff main..HEAD -- src/engine/` is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session — REPLACE the placeholder build entry (tokens_total: null #filled…,
   recorded_at: null) so it reads cycle: build, interface: claude-code, model: claude-sonnet-4-6,
   tokens_total: null, recorded_at: 2026-07-08, note: <what you did>. Leave tokens_total null (the
   orchestrator fills it from your subagent_tokens at ship).
3. Mark build [x] in the timeline with a completed summary (match SPEC-055's build line style).
4. Commit locally with a message referencing SPEC-056 (end with the Co-Authored-By line for
   `Claude Opus 4.8 (1M context) <noreply@anthropic.com>`). Do NOT stage the untracked reports/ files.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
