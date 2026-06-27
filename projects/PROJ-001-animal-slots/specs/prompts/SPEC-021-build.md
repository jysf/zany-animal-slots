# SPEC-021 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-021-win-state-router.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-001, /decisions/DEC-005.
5. /src/ui/useSlotMachine.ts + /src/ui/useSlotMachine.test.tsx, /src/engine/index.ts
   (SpinResult: tier, totalWin, lineWins).
6. /guidance/constraints.yaml — test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-021 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-021-win-state-router

Implement EXACTLY the spec (hook-only — NO CSS, NO rendering change):
- useSlotMachine.ts:
  * export interface Celebration { id: number; tier: WinTier; totalWin: number;
    lineWins: LineWin[] } (WinTier/LineWin already imported from ../engine/index).
  * Add state `const [celebration, setCelebration] = useState<Celebration | null>(null)`
    and a monotonic id ref `const celebrationIdRef = useRef(0)`.
  * In the spin-resolve setTimeout body (next to setLastWin(outcome.totalWin)):
    if outcome.totalWin > 0 → celebrationIdRef.current += 1; setCelebration({ id:
    celebrationIdRef.current, tier: outcome.tier, totalWin: outcome.totalWin,
    lineWins: outcome.lineWins }); else setCelebration(null).
  * reset(): add setCelebration(null). Do NOT reset celebrationIdRef.
  * Add `celebration: Celebration | null` to UseSlotMachineResult and return it.
- useSlotMachine.test.tsx: add the six celebration tests from the spec's Failing
  Tests (starts null; set on win seed 276 → tier 'big'/totalWin 55/lineWins 3;
  null after loss seed 12345; jackpot seed 407947 → tier 'jackpot'/totalWin 2000;
  id strictly increases across two seed-276 wins; reset clears). Use fake timers +
  advance SPIN_DURATION_MS, pin via opts.nextSeed (mirror existing hook tests).
- Engine only via src/engine; do NOT modify engine code. No new deps. Do NOT touch
  App.tsx / regions / any CSS. Keep ALL existing tests green.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.
 This spec has no visible output anyway.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
