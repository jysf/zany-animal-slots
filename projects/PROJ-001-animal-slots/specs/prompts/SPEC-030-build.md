# SPEC-030 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-030-dynamic-mixing.md — the ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in code).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-013 (channel graph), /decisions/DEC-007, /decisions/DEC-001.
5. /src/ui/audio/audioEngine.ts (getChannel('bed'), CHANNEL_GAINS), /src/ui/audio/
   useWinJingle.ts (fire-once-per-id gated pattern), /src/ui/useSlotMachine.ts
   (Celebration, WinTier), /src/ui/App.tsx.
6. /guidance/constraints.yaml — audio-gesture-and-mute, perf-60fps,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-030 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-030-dynamic-mixing

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/audio/mixer.ts — export const MIX { duckLevel:0.05, swellLevel:0.45,
  rampS:0.2, restoreS:0.6, holdMs:3000 }; export function applyMix(tier): return if
  tier not in {big,jackpot}; else (try/catch) get getChannel('bed').gain, rampTo
  duckLevel (jackpot) or swellLevel (big) over rampS, then setTimeout(holdMs) →
  rampTo CHANNEL_GAINS.bed over restoreS (inner try/catch). Never throws.
- src/ui/audio/useDynamicMixing.ts — useDynamicMixing(celebration, {muted,unlocked},
  mix=applyMix): useEffect [celebration?.id]: return if !celebration||tier==='none'||
  muted||!unlocked; else mix(celebration.tier). (Mirror useWinJingle.)
- src/ui/App.tsx — call useDynamicMixing(celebration, { muted, unlocked }) next to
  the other audio hooks.
- Tests:
  * useDynamicMixing.test.ts — renderHook, inject a mix vi.fn() (NO real Tone):
    applies on a new winning celebration (with tier); passes jackpot tier; re-applies
    on a new id; not on null; not when muted; not when locked.
  * mixer.test.ts — vi.mock('./audioEngine') so getChannel returns { gain: { rampTo:
    vi.fn() } } and exports CHANNEL_GAINS; vi.useFakeTimers(): MIX ordering invariant
    (duckLevel < CHANNEL_GAINS.bed < swellLevel); applyMix('jackpot') rampTo→duckLevel
    then (advance holdMs) rampTo→CHANNEL_GAINS.bed; applyMix('big') rampTo→swellLevel
    then restore; applyMix('small') & applyMix('none') = no rampTo; never throws.
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green.

NO new DEC — DEC-013 covers bus mixing. This repo's ESLint has NO react-hooks plugin
— do NOT add an exhaustive-deps disable. @testing-library/user-event is NOT installed
— use renderHook/fireEvent only. Write vi.fn() mock factories with no named params.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-030).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
