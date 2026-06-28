# SPEC-034 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-034-performance-pass-60fps.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-004, /decisions/DEC-010, /decisions/DEC-001.
5. The animation CSS: /src/ui/reels/reels.css, win-badge.css, particles.css,
   /src/ui/jackpot.css, /src/ui/paytable.css. The sweep pattern to mirror:
   /src/ui/reduced-motion.contract.test.tsx. /guidance/constraints.yaml (perf-60fps).
6. /docs/ (where perf-notes.md goes).

Before coding, branch and mark build `[~]` in the SPEC-034 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-034-perf-pass

Implement EXACTLY the spec:
- src/ui/perf.contract.test.ts:
  * "every keyframe animates only compositor-friendly properties" — discover all
    src/**/*.css (import.meta.glob('/src/**/*.css', { query:'?raw', eager:true }) or a
    Node fs walk); for each file, extract each @keyframes block, then within each
    percentage step's `{ ... }` body collect property names via /([a-z-]+)\s*:/ and
    assert each ∈ ALLOWED = {'transform','opacity','filter'} (include file+prop in the
    failure message). Track and assert >= 5 keyframe-bearing files checked.
  * "the guard is load-bearing" — run the SAME extraction logic over an inline string
    '@keyframes bad { from { height: 0 } to { height: 100px } }' and assert it detects
    'height' as NOT allowed (proves the check isn't vacuous).
  * "the spin animation has a compositor hint" — reels.css (fs) contains a
    `.reel--spinning` rule with a `will-change` including `transform`.
- src/ui/reels/reels.css — add `will-change: transform;` to the `.reel--spinning`
  rule (next to its animation: declaration). No raw hex introduced.
- docs/perf-notes.md — write the perf pass doc per the spec's Notes (Target, Approach
  (DEC-004), Static guarantee w/ the 5 files, In-preview measurement section with a
  clearly-marked PLACEHOLDER for numbers the orchestrator fills, the mid-tier-device
  caveat, Conclusion: DEC-004 holds / no revisit).
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green (incl. the reduced-motion sweep and per-file CSS contracts).

NO new DEC (validates DEC-004). This repo's ESLint has NO react-hooks plugin — no
exhaustive-deps disable. @testing-library/user-event is NOT installed.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" — INCLUDING the "Perf result" line (files swept, all
   compositor-only, will-change added) + 3 honest reflection answers.
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-034).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
