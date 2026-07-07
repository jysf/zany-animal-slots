---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-017
  type: decision
  confidence: 0.8
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-008 (the first themed machine).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-07
supersedes: null
superseded_by: null

affected_scope:
  - src/machines/arctic.ts

tags:
  - machine
  - theme
  - audio
  - tuning
---

# DEC-017: Arctic is the first themed machine — icy theme, colder audio, its own tuned math

## Decision

Arctic is the first themed machine — the shared 8-symbol vocabulary with an icy cool-blue theme,
colder audio, and its own tuned math (RTP ~91%), added as pure data + this DEC.

## Context

STAGE-008's spine (SPEC-047/048/049/050) is inert with one machine; Arctic proves the data-only
"add a machine" path and makes the selector a real switch.

## Alternatives Considered

- **Option A: New symbol set per machine**
  - What it is: give Arctic its own icon/emoji vocabulary distinct from Wild & Whimsical.
  - Why rejected: breaks the 8-symbol vocabulary the stage fixes; multiplies art/paytable work.

- **Option B: Same math as W&W, theme/audio-only**
  - What it is: reuse Wild & Whimsical's weights and paytable verbatim; vary only theme + audio.
  - Why rejected: the stage calls for *tuned math* per machine; identical math makes machines
    feel same-y.

- **Option C (chosen): Shared vocabulary + per-machine theme + audio + tuned math**
  - What it is: keep the 8-symbol vocabulary (`SYMBOL_DISPLAY`), but give Arctic its own reel
    weights, paytable, theme tokens, and audio params.
  - Why selected: matches DEC-015 + the stage direction — a machine is data, and each machine's
    data (including its math) is free to differ.

## Consequences

- **Positive:** proves the config-driven spine end-to-end; cheap to add Desert/Ocean the same way.
- **Negative:** each machine's math needs measuring (mitigated by the simulator).
- **Neutral:** strips reused across reels (per-reel asymmetry is a future spec).

## Validation

The metrics-sanity test pins Arctic's RTP band; `just simulate arctic` re-measures on demand;
revisit if the RTP drifts out of ~90–95% or the theme fails contrast.

## References

- Related specs: SPEC-051
- Related decisions: DEC-015, DEC-016, DEC-013, DEC-001
