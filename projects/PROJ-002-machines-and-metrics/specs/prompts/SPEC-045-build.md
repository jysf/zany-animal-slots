# SPEC-045 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. Purely ADDITIVE engine infra —
> it touches NO machine and changes NO game behavior (no frozen-seed re-baseline here).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-045-deterministic-strip-builder.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The
   Notes contain the COMPLETE drop-in code for src/engine/stripBuilder.ts and the `counts`
   test helper. Implement stripBuilder.ts VERBATIM — the pinned example
   (['DEER','FOX','DEER','WOLF','FOX','DEER']) and the strip SPEC-046 depends on were
   produced by this exact algorithm, so any deviation breaks downstream pins.
3. /decisions/DEC-001 + /decisions/DEC-002 (read only).
4. Source (read only, DO NOT modify): /src/engine/strips.ts (SymbolId, SYMBOLS, REEL_WEIGHTS),
   /src/engine/index.ts.

Before coding, branch and mark build [~] in the SPEC-045 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-045-deterministic-strip-builder

Implement EXACTLY the spec (drop-in in the Notes):
- CREATE src/engine/stripBuilder.ts — `buildStrip(symbols, weights)` VERBATIM from the Notes
  (pure: imports only the `SymbolId` type from ./strips; DEC-001 engine-no-dom; no RNG).
- CREATE src/engine/stripBuilder.test.ts — the 7 tests from the Failing Tests section:
  count-exact on the tuned profile (len 42), count-exact across 3 more profiles,
  determinism (deep-equal), the PINNED example, no-linear-adjacent-dups on realistic
  weights, zero/absent-weight omitted, degenerate single-symbol. Use the `counts` helper
  from the Notes.
- NO other file changed. NO machine touched. NO retune. NO payline/paytable/strip data edit.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/machines/ src/engine/strips.ts src/engine/paylines.ts
  src/engine/machine.ts src/engine/spin.ts src/engine/index.ts` MUST be EMPTY (only the two
  new stripBuilder files are added — no behavior change anywhere).
- No new dependency. No new DEC.

If the pinned-example test FAILS, you deviated from the drop-in algorithm (fractional keys
`(k + 0.5) / c`, sort `a.key - b.key || a.ord - b.ord`, the adjacency-fix loop) — fix the
code to match the Notes, do NOT edit the pin.

Repo toolchain gotchas: plain .ts test (NO JSX — keep .ts). tsconfig include is ["src"] so
both new files are typechecked. ESLint has no react-hooks plugin (N/A). Do not re-export
buildStrip from src/engine/index.ts (engine-internal infra).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` passes; the new stripBuilder tests ran and passed; the
`git diff main..HEAD` production/machine guard above is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-045.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
