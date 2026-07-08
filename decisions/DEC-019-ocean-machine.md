---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-019
  type: decision
  confidence: 0.8
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-008 (the fourth and final themed machine).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-07
supersedes: null
superseded_by: null

affected_scope:
  - src/machines/ocean.ts

tags:
  - machine
  - theme
  - audio
  - tuning
---

# DEC-019: Ocean is the fourth and final themed machine — teal/deep-blue theme, flowing audio, its own steady low-variance math

## Decision

Ocean is the fourth and final themed machine — the shared 8-symbol vocabulary with a teal/deep-blue ocean
theme, flowing spacious audio, and its own steady, low-variance tuned math (the highest hit-frequency of
the four, avg RTP ~94%, hit ~37%), added as pure data + this DEC (a sibling of DEC-017 Arctic / DEC-018
Desert). It completes STAGE-008's 4-machine set.

## Context

SPEC-051 (Arctic) and SPEC-052 (Desert) proved the data-only "add a machine" path and turned the selector
into a three-option switch. Ocean is the fourth option that completes the set and lets STAGE-008 ship.
Ocean's identity is deliberately the *inverse of Desert's sparseness*: where Desert hits rarely with juicy
rare wins (high variance), Ocean hits *often* with *modest* wins — a steady, "flowing" feel that reads as
"ocean". This gives the four machines a coherent spread of character: Wild & Whimsical (balanced default),
Arctic (steady/icy), Desert (sparse/high-variance), Ocean (frequent/low-variance).

## Alternatives Considered

- **Option A: New symbol set per machine**
  - What it is: give Ocean its own icon/emoji vocabulary distinct from the others.
  - Why rejected: breaks the 8-symbol vocabulary the stage fixes (per DEC-017/018); multiplies art work.

- **Option B: Reuse an existing machine's math, theme/audio-only**
  - What it is: copy W&W's / Arctic's / Desert's weights + paytable; vary only theme + audio.
  - Why rejected: the stage calls for *tuned math* per machine; identical math makes machines feel
    same-y and undercuts the variety thesis.

- **Option C (chosen): Shared vocabulary + per-machine teal theme + flowing audio + steady low-variance tuned math**
  - What it is: keep the 8-symbol vocabulary (`SYMBOL_DISPLAY`), give Ocean its own steeper low-end reel
    weights, the gentlest high/jackpot paytable of the four, teal/deep-blue theme tokens, and a flowing
    open A-major bed.
  - Why selected: matches DEC-015 + DEC-017/018 — a machine is data, and each machine's data (including
    its math) is free to differ. Measured against the real simulator before pinning (SPEC-046 discipline).

## Consequences

- **Positive:** the fourth machine completes STAGE-008's variety thesis and lets the stage ship; the
  selector becomes a real four-option switch.
- **Negative:** each machine's math needs measuring (mitigated by the simulator — `just simulate ocean`).
- **Neutral:** strips reused across reels (per-reel asymmetry is a future spec).

## Validation

The metrics-sanity test pins Ocean's RTP band (20k/seed-1 = rtp 0.94185 / hit 0.37165); over 10 seeds ×
50k, avg RTP 94.21% (range 92.88–95.74%), hit 37.45% (the highest of the four — vs W&W 34% / Arctic 30% /
Desert 28%), jackpot ~1/26.3k. `just simulate ocean` re-measures on demand; revisit if the RTP drifts out
of ~92–96% or the theme fails contrast (text-on-bg 16.14:1 today).

## References

- Related specs: SPEC-053
- Related decisions: DEC-018, DEC-017, DEC-015, DEC-016, DEC-013, DEC-001
