# SPEC-051 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. Adds the Arctic machine as pure DATA + a DEC.
> The math is MEASURED — transcribe it verbatim; do NOT re-tune.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-051-arctic-machine.md — the ENTIRE Acceptance
   Criteria, Failing Tests, Implementation Context, and Notes. The Notes have COMPLETE drop-in code
   for src/engine/index.ts (2 added re-exports), src/machines/arctic.ts, src/machines/registry.ts,
   and the DEC-017 body. Implement VERBATIM — the weights/paytable/theme/audio are measured pins.
3. /decisions/DEC-001, DEC-013, DEC-015, and decisions/_template.md + decisions/DEC-016-* (DEC format).
4. Source (read only unless editing): src/machines/wildAndWhimsical.ts, src/machines/types.ts,
   src/engine/machine.ts, src/ui/reels/symbols.ts.

Before coding, branch and mark build [~] in the SPEC-051 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-051-arctic-machine

Implement EXACTLY the spec (drop-ins in the Notes):
- EDIT src/engine/index.ts — add REEL_COUNT to the `from './strips'` re-export and add
  `export { buildStrip } from './stripBuilder';`. Nothing else in the engine changes.
- CREATE src/machines/arctic.ts — ARCTIC: Machine VERBATIM from the Notes (ARCTIC_WEIGHTS,
  ARCTIC_PAYTABLE, ARCTIC_STRIP = buildStrip(...), ARCTIC_MATH, theme, audio; symbolDisplay = SYMBOL_DISPLAY).
- EDIT src/machines/registry.ts — import ARCTIC, add `[ARCTIC.id]: ARCTIC` to MACHINES (W&W stays first).
- CREATE decisions/DEC-017-arctic-machine.md — from _template.md, with the fields + body in the Notes.
- CREATE src/machines/arctic.test.ts — the 6 tests from the Failing Tests section (registration,
  8-symbol vocabulary, RTP band via simulateMachine, strip count-exact + no adjacent dups, distinct
  from W&W, theme contrast ≥ AA). Import simulateMachine from '../engine/metrics', SYMBOLS from the
  engine, WILD_AND_WHIMSICAL from './wildAndWhimsical', SYMBOL_DISPLAY from '../ui/reels/symbols'.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/spin.ts src/engine/paylines.ts src/engine/tiers.ts
  src/engine/balance.ts src/engine/strips.ts src/engine/machine.ts` MUST be EMPTY (only
  src/engine/index.ts changes in the engine — two added re-exports). DEC-001 intact.
- No new dependency. No re-tuning of the pinned weights/paytable — transcribe them.
- Do NOT modify Wild & Whimsical or its parity tests.

Repo toolchain gotchas: ESLint restricts only src/engine/** (no React/DOM). arctic.test.ts is plain
.ts (no JSX). tsconfig include is ["src"]. The contrast helper in the test is a small inline sRGB→
luminance→ratio function (no dependency). If the RTP-band test fails, you transcribed a weight/paytable
number wrong — fix the transcription, do NOT change the test bounds.

Gate (all exit 0): just typecheck && just lint && just test && just build && just validate
Then confirm: `just cost-audit` passes; `just simulate arctic --spins 50000` runs and prints Arctic's
RTP (~90–95%); the engine-logic guard diff above is EMPTY; DEC-017 validates.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers; note DEC-017 emitted).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: 2026-07-07, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-051.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
