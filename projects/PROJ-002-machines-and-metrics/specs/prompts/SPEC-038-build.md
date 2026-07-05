# SPEC-038 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 typed-results, §12 tests, §14 pure-data).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-038-machine-config-types-and-default-machine-extraction.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, and Notes.
   The Notes contain COMPLETE drop-in code for all four new files + the additive
   index.ts re-exports. Use it as-is; write real code, do not improvise the shape.
3. /decisions/DEC-015-config-driven-machine-model.md (already authored at design — the
   config-driven machine model; DO NOT create or edit it, just read it).
4. Source you extract from (read, DO NOT modify): /src/engine/strips.ts,
   /src/engine/paylines.ts, /src/engine/tiers.ts, /src/engine/balance.ts,
   /src/engine/index.ts, /src/ui/reels/symbols.ts.
5. /src/test/engine-boundary.test.ts + /eslint.config.js — the engine-no-dom boundary
   you must not trip.

Before coding, branch and mark build [~] in the SPEC-038 timeline. If something needs
architect judgment, set [?] with a one-line reason and STOP.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-038-machine-config

Implement EXACTLY the spec (drop-in code is in the spec Notes):
- CREATE /src/engine/machine.ts — the MachineMath type (+ JackpotRule, TierBoundaries)
  and WILD_AND_WHIMSICAL_MATH, referencing the existing engine constants byte-identically
  (symbols: SYMBOLS, paytable: PAYTABLE, …; plus the extracted literals rows: 3,
  jackpot: { symbol: 'WOLF', count: 5 }, tiers: { bigMultiple: 5 }). NO React/DOM imports
  (engine-no-dom). This file imports only from ./strips, ./paylines, ./balance.
- MODIFY /src/engine/index.ts — ADD ONLY these re-exports (near the existing Re-exports
  blocks); change nothing else, touch no signature:
    export type { MachineMath, JackpotRule, TierBoundaries } from './machine';
    export { WILD_AND_WHIMSICAL_MATH } from './machine';
- CREATE /src/machines/types.ts — the Machine + MachinePresentation types
  (presentation holds ONLY symbolDisplay for now; theme/audio are SPEC-041).
- CREATE /src/machines/wildAndWhimsical.ts — WILD_AND_WHIMSICAL: Machine
  { id: 'wild-and-whimsical', name: 'Wild & Whimsical', math: WILD_AND_WHIMSICAL_MATH,
    presentation: { symbolDisplay: SYMBOL_DISPLAY } }.
- CREATE /src/machines/wildAndWhimsical.parity.test.ts — the data-parity contract test
  from the spec Failing Tests (8 `it` blocks). It is a .ts file (no JSX). It may import
  engine internals (../engine/strips etc.) — that is fine for a test.

HARD CONSTRAINTS (verify before you finish):
- Do NOT modify src/engine/{strips,paylines,tiers,spin,balance,rng}.ts — no signature or
  logic change. `git diff main..HEAD -- src/engine/strips.ts src/engine/paylines.ts \
  src/engine/tiers.ts src/engine/spin.ts src/engine/balance.ts src/engine/rng.ts` MUST
  be EMPTY. The only src/engine change is the NEW machine.ts + additive index.ts re-exports.
- Do NOT touch any component or hook (useSlotMachine, App, reels UI). No UI wiring here.
- NO new dependency. NO new DEC (DEC-015 already exists).
- The engine still imports no DOM: `just test` includes engine-boundary.test.ts — keep it green.

Repo toolchain gotchas (this repo's ACTUAL toolchain):
- ESLint has NO react-hooks plugin — do not add exhaustive-deps disables.
- NO @testing-library/user-event. (N/A here — no component test.)
- vi.fn() mock factories must use NO named callback params (N/A here).
- JSX test files must be .tsx — but the parity test has NO JSX, so .ts is correct.
- tsconfig include is ["src"], so all new src/** files are typechecked by tsc.

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes, and the src/engine diff guard above is EMPTY.

When done:
1. Fill "## Build Completion" in the spec (incl. 3 honest reflection answers).
2. Append a build cost session to the spec cost.sessions (cycle: build, agent:
   claude-sonnet-4-6, interface: claude-code, tokens_total: null with note
   "orchestrator to fill tokens_total from subagent_tokens", duration/notes as usual).
3. Mark build [~] in the timeline (leave verify/ship for later).
4. Commit locally with a message referencing SPEC-038.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
