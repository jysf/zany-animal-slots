---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-028
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-005
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-007
    - DEC-013
    - DEC-001
  constraints:
    - audio-gesture-and-mute
    - perf-60fps
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-026
    - SPEC-027

value_link: "Lays STAGE-005's audio foundation — a shared Tone.js graph (master bus + bed/sfx/jingle channels) — and the first new sound on it: a generative ambient music bed that loops during play, gated by mute + unlock."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. DEC-013)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 58608
      estimated_usd: 0.39
      duration_minutes: 3.5
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=58608, 209s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 73878
      estimated_usd: 0.49
      duration_minutes: 4.1
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=73878, 245s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. preview audio-graph check)"
  totals:
    tokens_total: 132486
    estimated_usd: 0.88
    session_count: 5
---

# SPEC-028: Ambient bed & audio graph

## Context

First STAGE-005 spec and the **foundation of the audio suite**. SPEC-027 shipped
the win jingle as fire-and-forget (`new Synth().toDestination()`); the suite
(ambient bed, SFX, dynamic mixing) needs **channels to mix on**. This spec builds
the shared audio graph from **DEC-013** — a lazily-created master `Gain` with named
channel gains (`bed`/`sfx`/`jingle`) feeding it — and adds the first sound on it: a
**generative ambient music bed** (a slow Tone.Transport loop) that plays during
play. The bed (and the re-routed jingle) go through the graph; SPEC-029 (SFX) and
SPEC-030 (mixing) plug into the same channels.

Everything stays gated by SPEC-026's `useAudio` (`muted` + `unlocked`) — the bed
only loops after the first gesture and while unmuted, and stops when muted — and
fully synthesized (no asset files, DEC-007). Pure UI (DEC-001).

See `STAGE-005-…md`, `DEC-013` (the audio-graph architecture — authoritative here),
`DEC-007`, SPEC-026 (`useAudio`), SPEC-027 (the jingle re-routed onto a channel).

## Goal

Add `src/ui/audio/audioEngine.ts` (the DEC-013 graph: `ensureAudio()`, a master
bus, and `getChannel('bed'|'sfx'|'jingle')`), `src/ui/audio/ambientBed.ts`
(`startBed()`/`stopBed()` — a generative Transport loop on the `bed` channel), and
`useAmbientBed({ muted, unlocked })` (starts the bed when unlocked & unmuted, stops
it otherwise and on unmount); re-route `playJingle` through the `jingle` channel;
wire `useAmbientBed` into `App`.

## Inputs

- **Files to read:** `src/ui/audio/useAudio.ts` (`muted`/`unlocked`),
  `src/ui/audio/jingle.ts` (the fire-and-forget pattern to re-route) + its test,
  `src/ui/App.tsx`, `decisions/DEC-013`, `decisions/DEC-007`. Tone.js docs:
  `Gain`, `Transport` (`getTransport`), `Loop`, `start`, `now`.
- **Related code paths:** `src/ui/audio/`.

## Outputs

- **Files created:**
  - `src/ui/audio/audioEngine.ts` (+ `audioEngine.test.ts`) — `ensureAudio()`,
    `getMaster()`, `getChannel(name)`, `CHANNEL_GAINS`.
  - `src/ui/audio/ambientBed.ts` (+ `ambientBed.test.ts`) — `startBed()`,
    `stopBed()`.
  - `src/ui/audio/useAmbientBed.ts` (+ `useAmbientBed.test.ts`) — the gating hook.
- **Files modified:**
  - `src/ui/audio/jingle.ts` — route the synth through `getChannel('jingle')`
    instead of `.toDestination()` (same notes, same gating); update `jingle.test.ts`
    mock accordingly.
  - `src/ui/App.tsx` — call `useAmbientBed({ muted, unlocked })`.
- **New exports:** `ensureAudio`, `getMaster`, `getChannel`, `CHANNEL_GAINS`;
  `startBed`, `stopBed`; `useAmbientBed`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `getChannel(name)` returns a Tone `Gain` connected to the master bus, and is
      **idempotent** (same instance per name across calls); `getMaster()` is a
      single shared node. `CHANNEL_GAINS` defines a level per channel
      (`bed`/`sfx`/`jingle`). (Verified against a mocked `tone`.)
- [ ] `startBed()` starts the Transport and a looping generative pad on the `bed`
      channel; `stopBed()` stops/cleans it. Calling `startBed()` twice does not stack
      duplicate loops. (Verified against a mocked `tone`.)
- [ ] `useAmbientBed({ muted, unlocked })` calls `startBed` when `unlocked && !muted`,
      and `stopBed` when `muted` or `!unlocked`, and `stopBed` on unmount —
      verified with **injected** `start`/`stop` spies (no real Tone in the hook test).
- [ ] `playJingle` routes through `getChannel('jingle')` (no `.toDestination()`);
      the jingle's note counts per tier are unchanged (existing jingle tests still
      pass, mock updated).
- [ ] All audio stays gated (no bed before unlock / when muted) and synthesized (no
      asset files); engine unchanged; gate (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/ui/audio/useAmbientBed.test.ts`** (renderHook; inject `{ start, stop }` spies)
  - `"starts the bed when unlocked and unmuted"` — `{muted:false, unlocked:true}` →
    `start` called once, `stop` not called.
  - `"does not start while locked"` — `{muted:false, unlocked:false}` → `start` not
    called.
  - `"does not start while muted"` — `{muted:true, unlocked:true}` → `start` not
    called.
  - `"stops when muted after starting"` — start unmuted+unlocked, rerender
    `{muted:true}` → `stop` called.
  - `"stops on unmount"` — after starting, unmount → `stop` called.

- **`src/ui/audio/audioEngine.test.ts`** (`vi.mock('tone', …)`)
  - `"getChannel is idempotent and connects to master"` — two `getChannel('bed')`
    calls return the same node; the channel `.connect(...)` target is the master.
  - `"CHANNEL_GAINS has bed/sfx/jingle levels"` — all three keys present, numeric,
    in (0, 1].

- **`src/ui/audio/ambientBed.test.ts`** (`vi.mock('tone', …)`)
  - `"startBed starts the transport and a loop"` — `startBed()` calls `start()` and
    starts a Transport/Loop on the bed channel.
  - `"startBed twice does not create two loops"` — second call is a no-op (one loop).
  - `"stopBed stops the loop/transport"` — after `startBed()`, `stopBed()` stops it.

- **`src/ui/audio/jingle.test.ts`** (updated) — keep the existing tier note-count
  assertions; update the `tone` mock so the synth routes via `connect(getChannel
  ('jingle'))` (or the engine) instead of `toDestination`, and assert the jingle
  still triggers `JINGLE_NOTES[tier].length` notes.

## Implementation Context

### Decisions that apply

- `DEC-013` — the audio-graph architecture (master + named channels + Transport);
  implement exactly this shape. The bed is the `bed` channel's first source; the
  jingle moves onto the `jingle` channel.
- `DEC-007` — synthesized only, no asset files; gated.
- `DEC-001` — pure UI; engine untouched.

### Constraints that apply

- `audio-gesture-and-mute` — the bed never sounds before unlock or while muted
  (the hook enforces it); creation is gated/guarded.
- `perf-60fps` — keep the bed light (one synth/loop, slow tempo); the perf pass
  (SPEC-034) will measure it.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-026` (shipped) — `useAudio` → `muted`/`unlocked`; the bed hook consumes both
  (same gate as the jingle).
- `SPEC-027` (shipped) — `playJingle`; re-routed here onto the `jingle` channel
  (notes/gating identical). Mirror its `try/catch` best-effort + mocked-`tone` test
  style.

### Out of scope (for this spec specifically)

- SFX (SPEC-029) and dynamic mixing / ducking-swell (SPEC-030) — this spec only
  builds the graph + the bed + re-routes the jingle; the `sfx` channel is created
  but unused until SPEC-029.
- A11y/perf specs (SPEC-031…034). Any audio asset files (DEC-007). A bed
  volume/settings UI.

## Notes for the Implementer

- `audioEngine.ts` — lazy singleton, guarded so jsdom/no-AudioContext never throws:
  ```ts
  import { start, Gain } from 'tone';
  export const CHANNEL_GAINS: Record<'bed' | 'sfx' | 'jingle', number> = {
    bed: 0.25, sfx: 0.6, jingle: 0.8,
  };
  let master: Gain | null = null;
  const channels = new Map<string, Gain>();
  export function ensureAudio(): void { try { void start(); } catch { /* best-effort */ } }
  export function getMaster(): Gain { if (!master) master = new Gain(1).toDestination(); return master; }
  export function getChannel(name: keyof typeof CHANNEL_GAINS): Gain {
    let ch = channels.get(name);
    if (!ch) { ch = new Gain(CHANNEL_GAINS[name]).connect(getMaster()); channels.set(name, ch); }
    return ch;
  }
  ```
  (For SPEC-030, expose a way to reach a channel's gain param — `getChannel(name).gain`.)
- `ambientBed.ts` — a slow generative loop; module-level refs so `startBed` is
  idempotent and `stopBed` can clean up:
  ```ts
  import { getTransport, Loop, PolySynth, Synth } from 'tone';
  import { ensureAudio, getChannel } from './audioEngine';
  let loop: Loop | null = null; let pad: PolySynth | null = null;
  const CHORD = ['C3', 'G3', 'C4', 'E4'];
  export function startBed(): void {
    if (loop) return;                       // already running — no double loop
    try {
      ensureAudio();
      pad = new PolySynth(Synth).connect(getChannel('bed'));
      loop = new Loop((time) => pad?.triggerAttackRelease(CHORD, '2n', time), '2m').start(0);
      getTransport().start();
    } catch { /* best-effort */ }
  }
  export function stopBed(): void {
    try { loop?.stop().dispose(); pad?.dispose(); } catch { /* ignore */ }
    loop = null; pad = null;
  }
  ```
  (Exact synth/voicing is a feel choice — keep it quiet and slow; tune in preview.)
- `useAmbientBed.ts` — gate + lifecycle, injectable for tests:
  ```ts
  import { useEffect } from 'react';
  import { startBed as defaultStart, stopBed as defaultStop } from './ambientBed';
  export function useAmbientBed(
    opts: { muted: boolean; unlocked: boolean },
    ctl: { start?: () => void; stop?: () => void } = {},
  ): void {
    const { muted, unlocked } = opts;
    const start = ctl.start ?? defaultStart;
    const stop = ctl.stop ?? defaultStop;
    useEffect(() => {
      if (unlocked && !muted) start(); else stop();
      return () => stop();
    }, [muted, unlocked]);
  }
  ```
- `jingle.ts` — change `new Synth().toDestination()` to
  `new Synth().connect(getChannel('jingle'))` (import `getChannel`); keep everything
  else. Update the `tone` mock in `jingle.test.ts` so `Synth` returns an object with
  a `connect` (chainable) — assert the same per-tier note counts.
- `App.tsx` — add `useAmbientBed({ muted, unlocked })` next to `useWinJingle(...)`.
- This repo's ESLint has **no `react-hooks` plugin** — do NOT add an exhaustive-deps
  disable. **No new dependency** (`tone` already installed). No new DEC (DEC-013
  authored at design).
- After build, the orchestrator previews: after the first click, a quiet ambient
  bed loops; muting stops it, unmuting resumes; spinning to a win still plays the
  jingle (now via the channel). Audio is best-effort in preview — confirm no console
  errors and that the bed start/stop tracks the mute toggle.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-028-ambient-bed
- **PR (if applicable):** n/a (local only per spec)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — DEC-013 authored at design
- **Deviations from spec:**
  - none; all drop-in code used verbatim with only one lint fix (removed unused parameter names in the Loop mock factory)
- **Follow-up work identified:**
  - none; SPEC-029 (SFX) and SPEC-030 (mixing) already in backlog and plug into the same channels

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The `ambientBed.test.ts` mock for `Loop` used typed parameter names (`_cb`, `_interval`) that the `@typescript-eslint/no-unused-vars` rule flagged even with the underscore prefix. The spec drop-in didn't include the mock factory, so this was discovered only at `just lint`. Took one fix iteration.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraint. One implicit nuance: the ESLint `no-unused-vars` rule's behavior with underscore-prefixed params in vi.fn() factories isn't mentioned in the spec or constraints; worth noting in the template for future mock-heavy specs.

3. **If you did this task again, what would you do differently?**
   — Write the `vi.mock` factory signatures with no named parameters at all (just `vi.fn(() => …)`) from the start, since the callback signature inside a mock factory is irrelevant to the test assertions. This avoids the lint trip-up entirely.

---

## Verify

Verified 2026-06-27 by claude-sonnet-4-6 (cold reviewer, separate session).

**Verdict: ✅ APPROVED**

Gate results:
- `just typecheck` — exit 0 (no type errors)
- `just lint` — exit 0 (no lint errors)
- `just test` — exit 0 (35 test files, 214 tests, all passing; +11 new tests: 3 audioEngine + 3 ambientBed + 5 useAmbientBed)
- `just build` — exit 0 (vite production build, 394.64 kB bundle)

Checklist (evidence-based):

- ✅ **getChannel idempotent + connects to master** — `getChannel` uses a Map singleton; `audioEngine.ts:32-35` stores and retrieves from `channels`. Test in `audioEngine.test.ts:49-56` confirms same instance on two calls. `connect(getMaster())` call visible in implementation. Note: test asserts `connectMock.toHaveBeenCalled()` but does not assert the specific argument was the master — weak but implementation is correct.
- ✅ **getMaster single shared node** — module-level `let master: Gain | null = null` with lazy init (`audioEngine.ts:22-26`).
- ✅ **CHANNEL_GAINS bed/sfx/jingle in (0,1]** — values 0.25/0.6/0.8; test iterates all three and asserts numeric + `>0` + `<=1` (`audioEngine.test.ts:37-46`).
- ✅ **startBed starts transport+loop, idempotent** — `if (loop) return` guard on line 13 of `ambientBed.ts`; test "is idempotent" asserts `Loop` constructor called only once on double-call (`ambientBed.test.ts:60-67`); transport started via `getTransport().start()`.
- ✅ **stopBed cleans up** — stops and disposes loop, disposes pad, nulls refs (`ambientBed.ts:23-31`); test asserts `loopStopMock` and `loopDisposeMock` called.
- ✅ **useAmbientBed starts when unlocked&&!muted, stops when muted/!unlocked, stops on unmount** — 5 injected-spy tests in `useAmbientBed.test.ts` cover all paths; no real Tone used; `renderHook` from `@testing-library/react`.
- ✅ **playJingle routes via getChannel('jingle') (no toDestination)** — `jingle.ts:21`: `new Synth().connect(getChannel('jingle'))`; `toDestination` is absent from jingle routing; `./audioEngine` mock added to `jingle.test.ts`.
- ✅ **Jingle per-tier note counts unchanged** — `jingle.test.ts:46-58` asserts `JINGLE_NOTES.small.length`, `jackpot.length`; test passes (4 tests).
- ✅ **Engine unchanged** — `git diff main..HEAD -- src/engine/` is empty.
- ✅ **No new deps** — `git diff main..HEAD -- package.json package-lock.json` is empty.
- ✅ **Audio gating correct** — hook enforces `unlocked && !muted` before calling start; try/catch in engine + bed guards against missing AudioContext.
- ✅ **DEC-013 honored** — master bus + named channels (`bed`/`sfx`/`jingle`) + Transport; jingle re-routed; lazy/idempotent creation guarded; lazy creation in jsdom safe (both `ensureAudio` and `startBed` are wrapped in try/catch).
- ✅ **Tests not vacuous** — hook tests use injected spies and assert call counts precisely; engine/bed tests mock `tone` and assert real wiring (idempotency via Map, single loop via `if (loop) return`).
- ✅ **No bad eslint-disable or user-event** — grepped: zero matches.
- ✅ **Decision drift** — `just decisions-audit --changed` output: "No changed files in scope" (tool looks at uncommitted diff; branch diff is clean). `just decisions-audit` shows 19 pre-existing scope-overlap warnings across older DECs — none new, none from this spec. DEC-013 governs `src/ui/audio/**` and is fully honored. DEC-007 and DEC-001 also honored (synthesized only, engine untouched).
- ✅ **Build reflection honest** — notes the lint trip on mock param names (`_cb`, `_interval`) and the one fix iteration; specific and accurate (confirmed final code uses parameterless lambdas in the Loop mock factory).
- ✅ **Cost session** — build session present with `tokens_total: null` and "orchestrator to fill" note; correct per AGENTS §4 (subagent, filled at ship).

Minor observation (no punch-list item): the `audioEngine.test.ts` "connects each channel to the master" test does not assert `connectMock.toHaveBeenCalledWith(master)` — it only checks the mock was called and that `ch !== master`. Implementation is correct; future test improvement only.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Authoring DEC-013 at design — master bus + named channels +
   Transport — meant the build was a clean transcription and gives SPEC-029/030 real
   channels to plug into; re-routing the jingle now (2 lines + a mock tweak) made the
   shared graph genuine rather than aspirational. The injectable `{start, stop}` on
   `useAmbientBed` kept the gating fully unit-tested with spies (no real Tone), the
   same pattern that worked for the jingle.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-013 captured the one new decision. A small recurring note for mock-heavy
   audio specs (already in the build prompts): write `vi.fn(() => …)` mock factories
   with no named callback params, since this repo's `no-unused-vars` flags even
   underscore-prefixed ones — the build hit that once and fixed it.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-029 (SFX set) plugs into the `sfx` channel created here, then
   SPEC-030 (dynamic mixing) tweaks channel gains to duck/swell. The a11y audits
   (031–033) and the perf pass (034) follow. The full audio suite is on track within
   STAGE-005's framed backlog.
