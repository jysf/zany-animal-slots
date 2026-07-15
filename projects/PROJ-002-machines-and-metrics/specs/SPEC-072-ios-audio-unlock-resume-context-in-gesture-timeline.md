# SPEC-072 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-072-<cycle>.md`.

## Instructions

_(Timeline will be populated as the architect writes each cycle's prompt.)_

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): fixed user-reported "no audio on
      iPhone". Root cause: useAudio's first-gesture handler only set the `unlocked` React flag; the
      AudioContext resume (Tone.start via ensureAudio) ran later in effects — iOS Safari requires resume in
      the gesture stack. Fix: call ensureAudio() synchronously in the pointerdown/keydown handler + a test
      asserting it. Browser-verified by patching AudioContext.prototype.resume — post-fix resume() fires
      synchronously on the gesture (1 call), no console errors. Engine diff EMPTY; full gate green (472,
      worktree excluded). iPhone playback needs a device re-test (silent switch is a separate hardware
      caveat). **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #NN (squash-merged; CI green; branch deleted).
