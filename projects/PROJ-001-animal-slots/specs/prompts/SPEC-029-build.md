# SPEC-029 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-029-sfx-set.md — the ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in code).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-013 (audio graph), /decisions/DEC-007, /decisions/DEC-001.
5. /src/ui/audio/audioEngine.ts (getChannel('sfx')), /src/ui/audio/jingle.ts (+test,
   the synth-through-channel + try/catch + mocked-tone pattern), /src/ui/audio/
   useWinJingle.ts (fire-once-per-id pattern), /src/ui/useSlotMachine.ts (isSpinning,
   Celebration), /src/ui/App.tsx.
6. /guidance/constraints.yaml — audio-gesture-and-mute, perf-60fps,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-029 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-029-sfx-set

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/audio/sfx.ts — SfxName 'spin'|'reelStop'|'win'; REEL_STOP_CLUNKS=5;
  playSfx(name): ensureAudio(); synth.connect(getChannel('sfx')) (NEVER toDestination);
  'spin' = a short noise whoosh; 'reelStop' = REEL_STOP_CLUNKS staggered membrane
  hits; 'win' = a short metal/synth ting. All wrapped in try/catch (never throws).
- src/ui/audio/useGameSfx.ts — useGameSfx(isSpinning, celebration, {muted,unlocked},
  play=playSfx): effect [isSpinning] with a prev ref → no fire on mount, gate on
  muted/unlocked, play('spin') on false→true, play('reelStop') on true→false; effect
  [celebration?.id] → if celebration && tier!=='none' && !muted && unlocked → play('win').
- src/ui/App.tsx — call useGameSfx(isSpinning, celebration, { muted, unlocked }) next
  to useAmbientBed / useWinJingle.
- Tests:
  * useGameSfx.test.ts — renderHook, inject a play vi.fn() (NO real Tone): plays
    'spin' on false→true edge; 'reelStop' on true→false; no fire on mount; 'win' on a
    new winning celebration (and again on a new id); no 'win' on null; nothing when
    muted; nothing when locked.
  * sfx.test.ts — vi.mock('tone'): REEL_STOP_CLUNKS===5; playSfx routes via
    getChannel('sfx') (mock the engine or assert the sfx channel is the connect
    target), triggers ≥1; reelStop triggers 5 staggered hits; playSfx never throws.
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green.

NO new DEC — DEC-013 covers the channel. This repo's ESLint has NO react-hooks
plugin — do NOT add an exhaustive-deps disable. @testing-library/user-event is NOT
installed — use renderHook/fireEvent only.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-029).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
