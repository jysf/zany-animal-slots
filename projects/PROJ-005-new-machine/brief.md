---
project:
  id: PROJ-005
  status: active
  priority: low
  target_ship: null
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: null
value:
  thesis: >-
    Add play VARIETY, not just skins: a new machine with a distinct math personality the roster
    lacked. The four existing machines run steady-to-moderate; PROJ-005 adds a HIGH-VARIANCE
    "Farm" — fewer, bigger hits and a rarer, fatter jackpot — proving config-as-data (DEC-015)
    scales to genuinely different feels with zero engine change.
  beneficiaries:
    - "Players — a swingy machine for those who want bigger, rarer thrills."
    - "Template maintainer — a fifth exercise of the config-driven machine model + the measure-then-pin loop."
  success_signals:
    - "A fifth selectable machine (Farm) with its own theme, creatures, and HIGH-VARIANCE math (~94% RTP, ~23% hit)."
    - "Zero engine diff; passes the symbol-uniqueness + machine-parity contracts; default machine unchanged."
  risks_to_thesis:
    - "High-variance RTP is noisy to measure; the metrics-sanity band must be wide enough to be stable yet tight enough to catch drift."
---

# PROJ-005: A new machine

## What This Project Is

One new machine, **Farm** (barnyard theme, high-variance math), plus the roadmap for a few more
themes to follow. Machines are config-as-data (DEC-015), so each is a data file + registration + a
test + a DEC — no engine change.

## Why Now

The user greenlit a new machine for variety; the roster had no notably swingy option. Cheap to add,
and it dogfaces the config-driven model a fifth time.

## Stage Plan

- [x] STAGE-018 (shipped) — **Farm machine**: high-variance barnyard machine (SPEC-090). DEC-026.

**Count:** 1 shipped / 0 active / 0 pending

## Roadmap / more machines (deferred)

Themes the owner wants as future machines (each ~1 spec + a DEC; reskin or tuned):

- **Food & Drink** — the parked PROJ-002 fast-follow (🍕🍔🌮🍩🍺… jackpot 🎂?). Warm palette.
- **Space / Cosmic** — 🚀🛸🪐⭐🌙☄️👽 + 🌟 jackpot. Deep indigo/violet, high contrast; the boldest
  visual departure.

Pick a math personality per machine (the roster now has steady Ocean, moderate W&W/Arctic/Desert,
and swingy Farm — a generous/high-hit-rate machine is the remaining obvious gap).

## Dependencies

### Depends on
- PROJ-002 (shipped) — the config-driven machine model (DEC-015), the machine registry + selector,
  the theme/audio presentation slices, and the `just simulate` metrics tool.

### Enables
- A steady cadence of new machines as pure data.

## Project-Level Reflection

*Filled in when status moves to shipped.*
