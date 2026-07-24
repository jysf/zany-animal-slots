---
task:
  id: SPEC-081
  type: bug                        # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-016
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8     # built inline on the main loop (small, careful audio change)
  created_at: 2026-07-24

references:
  decisions:
    - DEC-007   # audio gate + persisted mute — this AMENDS its un-muted default
    - DEC-013   # audio graph incl. the bed loop — this AMENDS it (removes the loop)
    - DEC-025   # THIS spec implements it: quiet by default + no ambient loop
  constraints:
    - audio-gesture-and-mute
    - engine-no-dom
  related_specs:
    - SPEC-026  # original mute state + first-gesture unlock
    - SPEC-028  # the ambient bed being removed

value_link: >-
  Removes a default-on, forever-looping ambient chord that a play-test found "terrible" — the
  app is now calm and silent by default, sound strictly opt-in.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-24
      note: >-
        Design authored on the main Opus loop (un-metered). User play-test found the generative
        ambient bed (a PolySynth chord on an infinite Tone.Loop every ~4s, ON by default) terrible.
        User explicitly approved touching the parked src/ui/audio/** for this narrow default/loop fix
        (choice: "both — no bed + default off"). Authored DEC-025 amending DEC-007 + DEC-013.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 40000     # NOMINAL - built inline on the Opus main loop, not a metered subagent
      estimated_usd: 0.80     # NOMINAL, 40000 tok x $20/M (Opus list) - order-of-magnitude
      recorded_at: 2026-07-24
      note: >-
        Built inline (small, careful audio change). Flipped readMute() to quiet-by-default, removed
        the ambient-bed playback (startBed/stopBed/Loop) keeping only the setBedMusic param store
        useMachineAudio needs, deleted useAmbientBed + its test, dropped the useAmbientBed wiring +
        import from App. Updated muteStorage/useAudio/ambientBed tests for the new default + removed
        playback. Full gate green (1000 tests); engine diff empty.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 25000     # NOMINAL - inline main-loop verify
      estimated_usd: 0.50     # NOMINAL, 25000 tok x $20/M (Opus list)
      recorded_at: 2026-07-24
      note: >-
        Verified inline. Both mute-default guard-mutations killed their targets with the spec's
        killing inputs: (1) default back to '=== true' broke "defaults to muted when absent" (no
        key); (2) '!== true' broke "an explicit false un-mutes" (stored 'false'). Grep confirms
        zero startBed/stopBed/useAmbientBed call sites remain. NOTE the audible "no sound" check
        cannot be done by an agent (can't hear) and must NOT unlock audio on the user's machine -
        deferred to the user on their live dev server, where the change is already HMR-applied.
        0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-24
      note: >-
        main-loop, not separately metered (AGENTS 4); ship cycle. Gate, PR + CI + merge, archive,
        brag. Authored DEC-025 (amends DEC-007 mute default + DEC-013 bed loop).
  totals:
    tokens_total: 65000    # build 40000 + verify 25000 (NOMINAL, inline Opus main-loop)
    estimated_usd: 1.30    # build 0.80 + verify 0.50 (nominal)
    session_count: 4       # design, build, verify (inline), ship
---

# SPEC-081: Quiet by default — remove the looping ambient bed

## Context

A play-test surfaced a repeating "bing" that the user called terrible. It is the
**generative ambient bed** ([`ambientBed.ts`](../../../src/ui/audio/ambientBed.ts)): after
the first-gesture audio unlock, an infinite `Tone.Loop` re-triggers a four-note `PolySynth`
chord every `2m` (~4s), and audio is **on by default** because `readMute()` returns `false`
when no preference is stored.

The user chose **both** fixes: remove the looping bed **and** default sound to off. See
**DEC-025** (amends DEC-007's mute default and DEC-013's graph). The audio-*quality*
overhaul stays parked — this is only the default/loop fix.

## Goal

Ship the game **muted by default** and **remove the ambient-bed playback loop**, while
keeping the one-shot event sounds (spin / reel-stop / win) intact for players who opt into
sound. No repeating audio, ever.

## Outputs

- **Files modified:**
  - `src/ui/audio/muteStorage.ts` — `readMute()` defaults to **muted** when unset.
  - `src/ui/audio/ambientBed.ts` — remove `startBed`/`stopBed` + the `Loop`/`PolySynth`
    playback machinery; **keep** `DEFAULT_BED_MUSIC` / `activeMusic` / `setBedMusic` /
    `getActiveBedMusic` (still used by `useMachineAudio`).
  - `src/ui/App.tsx` — remove the `useAmbientBed(...)` call + its import.
  - `src/ui/audio/muteStorage.test.ts`, `src/ui/audio/ambientBed.test.ts` — updated.
- **Files deleted:**
  - `src/ui/audio/useAmbientBed.ts` + `src/ui/audio/useAmbientBed.test.ts` (now unused).

## Acceptance Criteria

- [ ] `readMute()` returns **`true` (muted)** when the key is absent; `'false'` → un-muted;
      `'true'` → muted. `writeMute` still persists explicit `'true'`/`'false'`.
- [ ] A player who previously stored `'false'` (explicitly un-muted) **stays un-muted**.
- [ ] No code path starts an ambient/looping audio source. `git grep startBed` returns no
      call sites; `useAmbientBed` no longer exists.
- [ ] `useMachineAudio` still compiles and runs — `setBedMusic` is retained.
- [ ] The one-shot SFX (`useGameSfx`) and win jingle wiring are **unchanged**.
- [ ] No dead code: `startBed`/`stopBed`/the `Loop` are removed, not commented out.
- [ ] `src/engine/**` diff empty; no new dependency.
- [ ] Full gate green.

## Failing Tests

- **`src/ui/audio/muteStorage.test.ts`** (rewrite the default cases)
  - `"defaults to muted (true) when absent"` — `readMute()` is `true` with no key.
  - `"an explicit 'false' un-mutes"` — set `'false'`, `readMute()` is `false`.
  - `"round-trips true"` and `"round-trips false"` — unchanged behavior via `writeMute`.
  - `"treats any value other than 'false' as muted"` — set `'x'`, `readMute()` is `true`.
- **`src/ui/audio/ambientBed.test.ts`** (drop the playback tests)
  - Remove the `startBed` / `stopBed` describe blocks (the functions are gone).
  - `"setBedMusic updates the active music and getActiveBedMusic reflects it"` — keep a
    setter/getter test that does **not** call `startBed`.
- **`src/ui/App.test.tsx`** (if it renders `App`) — must still pass with no ambient wiring;
  add nothing unless a test referenced the bed (grep showed none).

## Implementation Context

### Decisions

- `DEC-025` — this spec's authority; amends DEC-007 (default mute) + DEC-013 (graph).
- `DEC-001` — audio is UI-only; engine untouched.

### Constraints

- `audio-gesture-and-mute` — still honored: gesture-unlock stays; mute persists; the change
  is only the **default** and the removal of the loop.

### Out of scope

- Any change to synth *quality*, the one-shot SFX, the win jingle, or the mixer/dynamic-
  mixing (left inert over the now-sourceless bed channel — see DEC-025).
- The audio-quality overhaul (parked, future project).
- Deleting the bed **channel** or `useMachineAudio`'s param plumbing.

## Notes for the Implementer

### `muteStorage.ts`

```ts
export function readMute(): boolean {
  try {
    // Quiet by default (DEC-025): muted unless a preference explicitly says 'false'.
    return localStorage.getItem(MUTE_KEY) !== 'false';
  } catch {
    return true; // storage unavailable ⇒ stay quiet
  }
}
```

### `ambientBed.ts`

Remove `startBed`, `stopBed`, the module `loop`/`pad` state, and the
`getTransport`/`Loop`/`PolySynth`/`Synth` imports. Keep the music-param store
(`DEFAULT_BED_MUSIC`, `activeMusic`, `setBedMusic`, `getActiveBedMusic`) with a header note
that bed **playback** was removed per DEC-025 and only the machine-audio param interface
remains. This is why the file survives rather than being deleted.

### `App.tsx`

Delete the `useAmbientBed({ muted, unlocked })` line and its import. Leave
`useWinJingle`, `useGameSfx`, `useDynamicMixing`, `useMachineAudio` as they are.

### Delete `useAmbientBed.ts` + test

Nothing else imports them (only App, which we're editing). `git rm` both.

### Guard-mutations for verify (with killing inputs)

1. `readMute()` default back to `false` (`=== 'true'`) ⇒ breaks `"defaults to muted when
   absent"`. Killing input: **no key set**.
2. `readMute()` = `!== 'true'` (so `'false'`→muted) ⇒ breaks `"an explicit 'false'
   un-mutes"`. Killing input: **stored `'false'`**.
3. Re-add a `useAmbientBed` call / a `startBed` ⇒ breaks the "no startBed call sites" grep
   check (manual verify step, not a unit test).

### Do NOT

- Do not touch `src/engine/**`, the one-shot SFX, or the mixer.
- Do not start a dev server.
- Do not `git add -A` / `git stash -u` / `git add src/ui/` broadly.

---

## Build Completion

- **Branch:**
- **All acceptance criteria met?**
- **New decisions emitted:**
- **Deviations from spec:**

### Build-phase reflection

1. **What was unclear?** —
2. **Missing constraint/decision?** —
3. **Do differently?** —

---

## Reflection (Ship)

1. **What would I do differently next time?** — This was a *default* that shipped through the whole
   MVP and PROJ-002 without anyone noticing, because tests and a Chromium preview never surface
   "annoying sound." It only turned up when the human actually played with sound on. The lesson is
   the one this repo keeps relearning: **audio and feel are unverifiable by the agent** — I can
   prove the default flag flipped and the loop code is gone, but "is it pleasant / silent" is a
   human check, full stop.

2. **Does any template, constraint, or decision need updating?** — DEC-025 records the reversal.
   Worth noting the boundary I kept: the user had parked *all* audio, and I did not treat "fix the
   terrible default" as license to start the audio-quality overhaul — I fixed the default and the
   loop, emitted a DEC, and left synthesis quality parked. When a standing "don't touch X"
   instruction is overridden for a specific reason, scope the exception to that reason.

3. **Follow-up spec?** — Not required. Two natural cleanups for the eventual audio overhaul, noted
   in DEC-025: the now-inert bed *channel* + `useDynamicMixing`/`mixer` (they ramp a sourceless
   channel), and whether to reintroduce a *good* opt-in ambient bed. Both belong to that parked
   project, not here.
