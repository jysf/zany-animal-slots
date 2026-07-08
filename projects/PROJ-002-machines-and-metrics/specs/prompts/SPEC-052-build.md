# SPEC-052 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. Adds the Desert machine as pure DATA + a DEC.
> The math is MEASURED — transcribe it verbatim; do NOT re-tune. Mirrors SPEC-051 (Arctic) exactly.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-052-desert-machine.md — the ENTIRE Acceptance
   Criteria, Failing Tests, Implementation Context, and Notes. The Notes have COMPLETE drop-in code
   for src/machines/desert.ts, src/machines/registry.ts, and the DEC-018 body. Implement VERBATIM —
   the weights/paytable/theme/audio are measured pins.
3. /decisions/DEC-001, DEC-013, DEC-015, DEC-017, and decisions/_template.md (DEC format).
4. Source to MIRROR (read only): src/machines/arctic.ts, src/machines/arctic.test.ts (the exact
   template for this spec), src/machines/wildAndWhimsical.ts, src/machines/types.ts.

Before coding, branch and mark build [~] in the SPEC-052 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-052-desert-machine

Implement EXACTLY the spec (drop-ins in the Notes):
- CREATE src/machines/desert.ts — DESERT: Machine VERBATIM from the Notes (DESERT_WEIGHTS,
  DESERT_PAYTABLE, DESERT_STRIP = buildStrip(...), DESERT_MATH, theme, audio; symbolDisplay =
  SYMBOL_DISPLAY). Imports come from '../engine/index' (buildStrip + REEL_COUNT already exported
  there since SPEC-051 — do NOT touch src/engine/).
- EDIT src/machines/registry.ts — import DESERT, add `[DESERT.id]: DESERT` to MACHINES AFTER Arctic
  (W&W stays first/default; order: W&W, Arctic, Desert).
- CREATE decisions/DEC-018-desert-machine.md — from _template.md, with the fields + body in the Notes.
  (A ready-to-commit DEC-018 already exists in decisions/ from design — confirm it matches the Notes;
  if present and correct, leave it.)
- CREATE src/machines/desert.test.ts — the 6 tests from the Failing Tests section. Mirror
  src/machines/arctic.test.ts exactly, but ALSO import ARCTIC from './arctic' and add the
  "distinct from Arctic" assertions (paytable/weights/chord not equal to Arctic's), and use
  listMachines() length >= 3. The inline WCAG contrast helper is copied verbatim from arctic.test.ts.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY. Desert touches ONLY src/machines/ + decisions/.
  DEC-001 intact.
- No new dependency. No re-tuning of the pinned weights/paytable — transcribe them.
- Do NOT modify Wild & Whimsical, Arctic, or their parity tests.

Repo toolchain gotchas: ESLint restricts only src/engine/** (no React/DOM). desert.test.ts is plain
.ts (no JSX). tsconfig include is ["src"]. The contrast helper in the test is a small inline sRGB→
luminance→ratio function (no dependency). If the RTP-band test fails, you transcribed a weight/paytable
number wrong — fix the transcription, do NOT change the test bounds.

Gate (all exit 0): just typecheck && just lint && just test && just build && just validate
Then confirm: `just cost-audit` passes; `just simulate desert --spins 50000` runs and prints Desert's
RTP (~87–94%, single-seed varies); the engine guard diff above is EMPTY; DEC-018 validates.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers; note DEC-018 emitted).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: 2026-07-07, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-052.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
