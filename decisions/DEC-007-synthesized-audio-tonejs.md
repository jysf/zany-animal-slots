---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-007
  type: decision
  confidence: 0.85
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

created_at: 2026-06-18
supersedes: null
superseded_by: null

affected_scope:
  - src/ui/audio/**

tags:
  - presentation
  - audio
  - tonejs
---

# DEC-007: Synthesized audio via Tone.js, no asset pipeline; v1 ships only a tier-scaled win jingle

## Decision

All audio is **synthesized at runtime with Tone.js** — no audio asset files and
no asset pipeline. v1 (this project) ships exactly one piece of audio: a
tier-scaled **win jingle** keyed off the engine's existing win-tier output
(short arpeggio for small, longer flourish for big, triumphant run for jackpot).
It is gated behind a **first user gesture** (browser autoplay policy) and a
**global mute toggle** whose state persists. The full audio suite (ambient bed,
complete SFX set, dynamic mixing) is deferred to STAGE-005 / PROJ-002.

## Context

Audio adds a lot of juice but also a lot of surface (asset sourcing, licensing,
loading, mixing). Synthesizing with Tone.js avoids files and licensing entirely
and keeps audio as code. Shipping only the win jingle in a core stage keeps
STAGE-004 focused while still proving the "feel" half of the thesis with sound;
the rest of audio is explicitly a later concern. Browser autoplay policy forbids
sound before a user gesture, and a play-money game should never trap the user in
noise — hence the gesture gate and always-available, persisted mute.

## Alternatives Considered

- **Option A: Pre-recorded audio assets**
  - Why rejected: file sourcing, licensing review, loading, and bundle weight
    for the MVP. (The one plausible exception — a single CC0 wolf-howl sample —
    is parked for PROJ-002, not v1.)

- **Option B: Web Audio API by hand**
  - Why rejected: Tone.js gives scheduling, synths, and transport for far less
    code; the `no-new-top-level-deps-without-decision` cost is paid here.

- **Option C (chosen): Tone.js synthesis, win-jingle only, gesture + mute gated**
  - Why selected: no assets/licensing, audio-as-code, scoped to one shippable
    piece, and compliant with autoplay policy by construction.

## Consequences

- **Positive:** No asset/licensing pipeline; audio is versionable code; scope is
  contained; autoplay-compliant.
- **Negative:** Synthesized audio has a distinctive (less "produced") character;
  a real wolf howl may eventually want a sample (parked).
- **Neutral:** The jingle keys off the engine's win tier — no new game math, and
  per the taste note, nothing faked.

## Validation

Right if: the win jingle ships behind a working gesture-unlock + persisted mute,
with no audio files in the repo. Revisit if: synthesized audio proves too thin
for the showpiece moments (then consider a single CC0 sample in a later project).

## References

- Related constraint: `audio-gesture-and-mute` in `/guidance/constraints.yaml`
- Related decisions: DEC-005 (play-money taste note — no faked anticipation)
- Related stages: STAGE-004 (win jingle), STAGE-005 / PROJ-002 (full suite)
