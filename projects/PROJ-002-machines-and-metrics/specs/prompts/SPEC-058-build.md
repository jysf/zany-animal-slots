# SPEC-058 — BUILD prompt

> Single-agent interactive run (user asked for per-machine reel symbols). LOCAL ONLY during build:
> branch + local commits; NO push/PR/gh/advance-cycle until ship. Presentation-only data change
> (DEC-021, DEC-001) — engine + W&W untouched.

```
Cycle: build. The spec file is the context.

Read in order:
1. /AGENTS.md (§5 build flow, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-058-per-machine-reel-symbol-identity.md — the
   ENTIRE Failing Tests + Implementation Context + Notes. The Notes have COMPLETE drop-in code for the
   three themed symbol maps, the machine edits, and the three test flips. Implement VERBATIM.
3. /decisions/DEC-021 (the decision), DEC-001, DEC-006 (read only).
4. Source (read to edit): src/machines/{arctic,desert,ocean}.ts + their .test.ts; src/machines/types.ts
   (SymbolDisplay), src/ui/reels/symbols.ts (SYMBOL_DISPLAY) read-only.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-058-per-machine-symbols

Implement EXACTLY the spec:
- arctic.ts / desert.ts / ocean.ts: swap `import { SYMBOL_DISPLAY }` + `import type { Machine }` for
  `import type { Machine, SymbolDisplay } from './types';`; add the themed map (ARCTIC_SYMBOLS /
  DESERT_SYMBOLS / OCEAN_SYMBOLS); point `presentation.symbolDisplay` at it.
- arctic.test.ts / desert.test.ts / ocean.test.ts: replace the "keeps the 8-symbol vocabulary" test
  with the "keeps the 8 engine symbols but themes their display" test (not.toBe SYMBOL_DISPLAY; 8 keys;
  WOLF.label = 'Polar Bear' / 'Sidewinder' / 'Shark').

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001).
- Do NOT touch src/machines/wildAndWhimsical.ts or wildAndWhimsical.parity.test.ts (W&W keeps
  SYMBOL_DISPLAY — the parity contract). Do NOT touch any machine's math (weights/paytable/strips/jackpot).
- No new dependency. DEC-021 is already authored — do not write a new DEC.
- Object literals prettier-canonical (one entry/line, single space after colon), NOT column-aligned.

Gate (all exit 0): just typecheck && just lint && just test && just build && just validate && just cost-audit
Confirm the three flipped tests pass and the full existing suite (incl. metrics-sanity, strip, parity)
is still green.

When done: fill "## Build Completion" (+3 reflection answers); replace the build cost session placeholder
(recorded_at 2026-07-09, note what you did); mark build [x] in the timeline; commit locally referencing
SPEC-058 (end with the Co-Authored-By line). Do NOT stage untracked reports/. DO NOT push / PR / gh /
advance-cycle.
```
