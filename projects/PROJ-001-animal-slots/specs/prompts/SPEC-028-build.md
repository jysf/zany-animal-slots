# SPEC-028 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-028-ambient-bed-and-audio-graph.md —
   the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (drop-in code for the engine, bed, hook, and the jingle re-route).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-013 (audio-graph architecture — authoritative), /decisions/DEC-007,
   /decisions/DEC-001.
5. /src/ui/audio/useAudio.ts, /src/ui/audio/jingle.ts + jingle.test.ts, /src/ui/App.tsx.
6. /guidance/constraints.yaml — audio-gesture-and-mute, perf-60fps,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-028 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-028-ambient-bed

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/audio/audioEngine.ts — CHANNEL_GAINS {bed,sfx,jingle}; ensureAudio()
  (void start(), try/catch); getMaster() (lazy Gain→destination, single); getChannel
  (name) (lazy Gain(level).connect(master), idempotent via a Map). Guard creation so
  no-AudioContext never throws.
- src/ui/audio/ambientBed.ts — startBed() (idempotent: if loop exists, return; else
  ensureAudio(), PolySynth on getChannel('bed'), a slow Tone Loop on getTransport(),
  transport.start()); stopBed() (stop+dispose loop+pad, null them). try/catch.
- src/ui/audio/useAmbientBed.ts — useAmbientBed({muted,unlocked}, ctl={}) with
  injectable start/stop (default the real ones); useEffect keyed on [muted,unlocked]:
  if (unlocked && !muted) start() else stop(); cleanup stop().
- src/ui/audio/jingle.ts — change new Synth().toDestination() to
  new Synth().connect(getChannel('jingle')) (import getChannel); keep notes/gating.
- src/ui/App.tsx — call useAmbientBed({ muted, unlocked }) next to useWinJingle.
- Tests:
  * useAmbientBed.test.ts — renderHook with injected {start,stop} spies (NO real
    Tone): starts when unlocked+unmuted; not when locked; not when muted; stops when
    muted after starting; stops on unmount.
  * audioEngine.test.ts — vi.mock('tone'): getChannel idempotent + connects to master;
    CHANNEL_GAINS has bed/sfx/jingle numeric levels in (0,1].
  * ambientBed.test.ts — vi.mock('tone'): startBed starts transport+loop; twice = one
    loop; stopBed stops it.
  * jingle.test.ts (UPDATE) — keep per-tier note-count assertions; update the tone
    mock so Synth has a chainable connect() (route via getChannel('jingle')); assert
    same note counts.
- Engine only via src/engine; do NOT modify engine. NO new dependency (tone already
  installed). Keep ALL existing tests green.

NO new DEC — DEC-013 authored at design. This repo's ESLint has NO react-hooks
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
4. Commit locally (message referencing SPEC-028).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
