---
insight:
  id: DEC-025
  type: decision
  confidence: 0.9
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-003
repo:
  id: animal-slots

created_at: 2026-07-24
supersedes: null
superseded_by: null

# Amends the audio posture set by DEC-007 (gesture + persisted mute) and DEC-013
# (the audio graph, incl. the generative bed loop).
affected_scope:
  - src/ui/audio/muteStorage.ts
  - src/ui/audio/ambientBed.ts
  - src/ui/audio/useAmbientBed.ts
  - src/ui/App.tsx

tags:
  - audio
  - defaults
  - ux
  - amends-dec-007
  - amends-dec-013
---

# DEC-025: Quiet by default — remove the looping ambient bed

## Decision

The game ships **muted by default** (sound is opt-in via the existing toggle), and the
**generative ambient "bed" loop is removed** entirely. One-shot event sounds (spin,
reel-stop, win) remain, and play only once the player un-mutes. This **amends DEC-007**
(whose persisted-mute default was un-muted) and **DEC-013** (which included the bed loop
in the graph).

## Context

Reported by the user while play-testing: after the first spin, the game "bings over and
over — it's terrible." Diagnosis: two compounding defaults, not a runaway bug.

1. `muteStorage.readMute()` returned `false` (un-muted) when no preference was stored — so
   a first-time player had audio **on** without choosing it.
2. The first pointer/key gesture unlocks the `AudioContext` (browser autoplay policy — this
   is why it "starts after the first spin"), after which `ambientBed.startBed()` runs an
   **infinite `Tone.Loop`** that re-triggers a four-note `PolySynth` chord every `2m`
   (~4 seconds at the default tempo), forever.

That ~4-second chord swell on infinite repeat is the "bing over and over." It is *working
as written* — the loop is a single correctly-guarded instance — but "a synth chord every
four seconds by default, forever" is a bad default that ships to every player until they
find the mute toggle.

The audio-**quality** overhaul remains parked (DEC-013's synths still sound cheap). This
decision is narrower: it fixes the **defaults and the loop**, not the synthesis.

## Alternatives Considered

- **A: Leave it; players can mute.** Rejected — it ships a persistent, unpleasant,
  default-on loop to every first-time player. "There's a mute button" is not a defense for
  a bad default.
- **B: Default-mute only (keep the bed).** Rejected — the loop would still play the moment
  a player opts into sound, so the "terrible" experience is one tap away rather than gone.
- **C: Remove the bed only (keep sound-on default).** Rejected — the one-shot SFX are
  fine, but the user explicitly wanted the app **calm/silent by default**, not merely
  loop-free.
- **D (chosen): Both — remove the bed loop AND default to muted.** The app is silent on
  load; a player who opts into sound gets event SFX (spin/reel-stop/win) and **never** a
  loop. Most conservative, and matches the user's stated intent.

## Consequences

- **Positive:** No repeating audio, ever. Silent, calm first load. The bad default that
  would have shipped to real players is gone.
- **Positive:** The change is small and self-contained; the audio-quality overhaul is
  unaffected and still available as a future project.
- **Negative (accepted):** Existing players who had sound on *by the old default* (no
  stored preference) become muted after this change. Intended — that is what "quiet by
  default" means. Anyone who deliberately set a preference (stored `'true'`/`'false'`)
  keeps it.
- **Neutral / noted:** `useDynamicMixing` + `mixer` still ramp the **bed channel** gain on
  a win, but that channel now has no source, so the automation is inaudible. Left in place
  to keep this change contained; it is a natural cleanup target for the audio overhaul.
  `ambientBed.setBedMusic` / `getActiveBedMusic` are **retained** (not dead) because
  `useMachineAudio` still calls the setter through the machine-audio param interface — only
  the *playback* (`startBed`/`stopBed`/the `Loop`) is removed.

## Validation

Right if: the game is silent on first load and after the first spin, and un-muting produces
only one-shot event sounds with no repeating tone. Revisit as part of the audio-quality
overhaul, which may re-introduce a *good* ambient bed deliberately (opt-in, not default-on)
or remove the now-inert bed channel + mixer entirely.

## References

- Amends: DEC-007 (gesture + persisted mute), DEC-013 (audio graph incl. the bed)
- Related specs: SPEC-081 (implements), SPEC-026/028 (original mute + bed), SPEC-048 (machine audio params)
- Parked: the audio-quality overhaul (a future project; see the PROJ-003 brief's Parked section)
