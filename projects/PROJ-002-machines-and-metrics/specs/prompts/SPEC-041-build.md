# SPEC-041 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. First UI-touching STAGE-007 spec —
> visual parity is the gate.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests, §14 pure-data, plus the UI/React conventions).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-041-presentation-symbol-display-per-machine.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes. The
   Notes contain drop-in changes for every file. Use them verbatim.
3. /decisions/DEC-015 + /decisions/DEC-006 (read only).
4. Source: /src/machines/types.ts, /src/machines/wildAndWhimsical.ts, /src/ui/reels/ReelGrid.tsx,
   /src/ui/regions/Game.tsx, /src/ui/paytable.ts, /src/ui/PaytableSheet.tsx,
   /src/ui/reels/symbols.ts (SYMBOL_DISPLAY stays here). Plus the tests you will update.

Before coding, branch and mark build [~] in the SPEC-041 timeline. If any existing
component-test rendered expectation would have to change to pass, STOP and set build [?]
(a changed rendered emoji/label = a visual regression).

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-041-presentation-symbol-display

Implement EXACTLY the spec (drop-in in the Notes):
- src/machines/types.ts — add `export type SymbolDisplay = Record<SymbolId, { emoji: string;
  label: string }>` and type MachinePresentation.symbolDisplay as SymbolDisplay (shape unchanged).
- src/ui/reels/ReelGrid.tsx — add `symbolDisplay: SymbolDisplay` to Props; render
  `symbolDisplay[symbolId]`; remove `import { SYMBOL_DISPLAY } from './symbols'`; add
  `import type { SymbolDisplay } from '../../machines/types'`.
- src/ui/regions/Game.tsx — import WILD_AND_WHIMSICAL; pass
  `symbolDisplay={WILD_AND_WHIMSICAL.presentation.symbolDisplay}` to <ReelGrid>.
- src/ui/paytable.ts — `paytableRows(symbolDisplay: SymbolDisplay)`; use it; drop the
  SYMBOL_DISPLAY import; add `import type { SymbolDisplay } from '../machines/types'`.
- src/ui/PaytableSheet.tsx — call `paytableRows(WILD_AND_WHIMSICAL.presentation.symbolDisplay)`.
- Update tests: ReelGrid.test.tsx / paytable.test.ts / PaytableSheet.test.tsx / Game.test.tsx
  (if it renders ReelGrid) — pass the machine's symbolDisplay at call sites; keep every
  existing rendered expectation identical. ADD the two "supplied map" cases from the spec
  Failing Tests (a stub map overriding one symbol's emoji → ReelGrid/paytable render the
  stub) proving the components render the SUPPLIED map, not a hard-coded import.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (no engine change).
- `grep -rn 'SYMBOL_DISPLAY' src/ui/reels/ReelGrid.tsx src/ui/paytable.ts` finds NOTHING
  (both now read the machine's map). src/ui/reels/symbols.ts STILL defines+exports
  SYMBOL_DISPLAY (the default machine references it) — do not delete it.
- Do NOT touch tokens.css / audioEngine.ts / mixer.ts, and do NOT add theme/audio fields to
  MachinePresentation (deferred to STAGE-008).
- No registry / no useSlotMachine change (that's SPEC-042). No new dependency. No new DEC.
- Every pre-existing component-test rendered expectation stays byte-identical.

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables); NO
@testing-library/user-event (use render/fireEvent from @testing-library/react); vi.fn()
factories use no named params; JSX test files must be .tsx (ReelGrid/PaytableSheet/Game
tests are .tsx; paytable.test.ts is .ts, no JSX — keep it .ts); tsconfig include is ["src"].

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes; the src/engine diff is EMPTY; the SYMBOL_DISPLAY grep
in the two consumers is empty.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-041.
DO NOT git push / open a PR / run gh / run just advance-cycle. (The orchestrator does the
preview visual check + ship.)
```
