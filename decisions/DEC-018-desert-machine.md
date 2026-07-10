---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-018
  type: decision
  confidence: 0.8
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-008 (the second themed machine).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-07
supersedes: null
superseded_by: DEC-021   # symbol-vocabulary clause ONLY; theme/audio/math below remain in force

affected_scope:
  - src/machines/desert.ts

tags:
  - machine
  - theme
  - audio
  - tuning
---

# DEC-018: Desert is the second themed machine — warm sand/amber theme, warm dry audio, its own sparse math

## Decision

> **Superseded in part by [DEC-021] (2026-07-09):** the *shared 8-symbol vocabulary* clause below is
> reversed — Desert now renders its own arid creatures (Camel / Fennec Fox / Gecko / Tortoise / Vulture /
> Elf Owl / Bighorn Ram / Sidewinder) via a per-machine `presentation.symbolDisplay`. The shared-vocabulary
> choice was an autonomous decision, not the user's; DEC-021 records the user's intent. The theme, audio,
> and tuned math described here are UNCHANGED.

Desert is the second themed machine — the shared 8-symbol vocabulary with a warm sand/amber theme,
warm dry audio, and its own sparse, higher-variance tuned math (avg RTP ~90%, hit ~28%), added as pure
data + this DEC (a sibling of DEC-017 Arctic).

## Context

SPEC-051 (Arctic) proved the data-only "add a machine" path and made the selector a real switch. Desert
reuses that mold to add variety and turn the selector into a three-option switch. Desert's identity is
*sparseness* — fewer hits than Arctic (~30%) or Wild & Whimsical (~34%), but juicier high/jackpot
payouts, giving it a warm, higher-variance feel that reads as "desert" alongside the icy Arctic.

## Alternatives Considered

- **Option A: New symbol set per machine**
  - What it is: give Desert its own icon/emoji vocabulary distinct from the others.
  - Why rejected: breaks the 8-symbol vocabulary the stage fixes (per DEC-017); multiplies art work.

- **Option B: Reuse Arctic's or W&W's math, theme/audio-only**
  - What it is: copy an existing machine's weights + paytable; vary only theme + audio.
  - Why rejected: the stage calls for *tuned math* per machine; identical math makes machines feel
    same-y and undercuts the variety thesis.

- **Option C (chosen): Shared vocabulary + per-machine warm theme + warm audio + sparse tuned math**
  - What it is: keep the 8-symbol vocabulary (`SYMBOL_DISPLAY`), give Desert its own flatter/sparser
    reel weights, a stingy-low/juicy-high paytable, warm amber theme tokens, and a warm major-chord bed.
  - Why selected: matches DEC-015 + DEC-017 — a machine is data, and each machine's data (including its
    math) is free to differ. Measured against the real simulator before pinning (SPEC-046 discipline).

## Consequences

- **Positive:** a second machine deepens the config-driven proof; Ocean (SPEC-053) is the only one left.
- **Negative:** each machine's math needs measuring (mitigated by the simulator — `just simulate desert`).
- **Neutral:** strips reused across reels (per-reel asymmetry is a future spec).

## Validation

The metrics-sanity test pins Desert's RTP band (20k/seed-1 = rtp 0.9556 / hit 0.2797); over 10 seeds ×
50k, avg RTP 89.98% (range 87.38–93.97%), jackpot ~1/21.7k. `just simulate desert` re-measures on
demand; revisit if the RTP drifts out of ~87–94% or the theme fails contrast (text-on-bg 15.76:1 today).

## References

- Related specs: SPEC-052
- Related decisions: DEC-017, DEC-015, DEC-016, DEC-013, DEC-001
