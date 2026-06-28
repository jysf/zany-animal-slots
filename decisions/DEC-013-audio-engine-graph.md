---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-013
  type: decision
  confidence: 0.8
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-001
repo:
  id: animal-slots

created_at: 2026-06-27
supersedes: null
superseded_by: null

affected_scope:
  - src/ui/audio/**

tags:
  - presentation
  - audio
  - tonejs
  - architecture
---

# DEC-013: Audio is a shared singleton graph — master bus + named channels + Tone.Transport

## Decision

STAGE-005's audio suite is built on a small **shared singleton audio graph** in
`src/ui/audio/` rather than ad-hoc per-sound output:

- A lazily-created **master** `Gain` → destination.
- **Named channel** gains feeding the master: `bed`, `sfx`, `jingle` (more may be
  added). Every audio source connects to its channel, never directly to
  destination.
- **`Tone.Transport`** drives looped/ambient audio (the bed); one-shots (jingle,
  SFX) are scheduled against `Tone.now()` on their channels.
- The graph is created lazily/idempotently and only after the gesture unlock; all
  audio stays gated by `useAudio` (`muted` + `unlocked`, SPEC-026), and creation
  is wrapped so a missing `AudioContext` never throws into the app.

This refines (does not supersede) DEC-007: still synthesized-only, no asset
pipeline, win-jingle-plus-suite scope.

## Context

SPEC-027 shipped the jingle as fire-and-forget (`new Synth().toDestination()` per
win). That's fine for one sound, but the suite (ambient bed, SFX, dynamic mixing)
needs **channels to mix**: SPEC-030 must duck the bed under the jackpot and swell
it on a big win, which requires bus-level gain control the per-sound approach
can't provide. A shared graph with named channels is the smallest structure that
makes mixing a gain change on one node instead of a rewrite. Tone.Transport gives
the looping bed correct musical timing for free.

## Alternatives Considered

- **Per-sound `toDestination()` (status quo from SPEC-027)** — rejected for the
  suite: no shared bus to duck/swell, no transport for loops, levels uncontrollable
  as a group.
- **A full third-party mixer/abstraction layer** — rejected: unnecessary weight;
  Tone already provides `Gain`, `Transport`, and scheduling.
- **Chosen: a tiny in-repo singleton graph (master + channel gains + Transport).**

## Consequences

- **Positive:** mixing (SPEC-030) becomes a gain tween on a channel; levels are
  balanced in one place; loops get correct timing; testable by mocking `tone` and
  by injecting start/stop into the React hooks.
- **Negative:** a singleton holds module-level audio state — tests must treat it
  carefully (mock `tone`; gate real creation behind the unlock); a leaked
  Transport/loop must be stopped on unmount.
- **Neutral:** the jingle (SPEC-027) gets re-routed from `toDestination()` onto the
  `jingle` channel — same notes, same gating, just through the bus.

## Validation

Right if: the ambient bed, SFX, and jingle all play through the shared graph and
SPEC-030 can duck/swell at the bus with a single gain change; everything stays
gated and synthesized. Revisit if: the singleton causes test flakiness or the
perf pass (SPEC-034) shows the audio graph costs frame budget.

## References

- Refines: DEC-007 (synthesized Tone.js, gated, win-jingle + suite).
- Related constraint: `audio-gesture-and-mute`, `perf-60fps`.
- Related specs: SPEC-026 (`useAudio` gate), SPEC-027 (jingle, re-routed here),
  SPEC-028 (this graph + the ambient bed), SPEC-029 (SFX), SPEC-030 (mixing).
