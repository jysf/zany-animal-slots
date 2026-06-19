---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-006
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
  - src/engine/strips.ts
  - src/ui/reels/**

tags:
  - presentation
  - game-design
  - symbols
---

# DEC-006: Emoji symbol set for v1; illustrated/SVG art deferred

## Decision

Symbols are rendered as Unicode emoji for v1. The set, by tier:

- **Low:** 🦌 Deer, 🦊 Fox, 🐿️ Squirrel
- **Mid:** 🐻 Bear, 🦅 Eagle, 🦉 Owl
- **High:** 🦬 Bison
- **Jackpot:** 🐺 Wolf

Custom illustrated / SVG art is explicitly a future project.

## Context

The wildlife theme needs recognizable symbols, but bespoke art is a large,
separate effort that does not test the project thesis (logic/presentation
separation, animation feel, template dogfood). Emoji give an instant,
zero-asset, on-theme symbol set so the team can focus on engine and juice.

## Alternatives Considered

- **Option A: Custom illustrated/SVG symbols now**
  - Why rejected: significant design effort and an asset pipeline for no MVP
    learning; deferred to a future project.

- **Option B: Abstract shapes/letters**
  - Why rejected: loses the wildlife theme and the charm that motivates the
    "Wild & Whimsical" framing.

- **Option C (chosen): Unicode emoji as placeholder symbols**
  - Why selected: zero assets, instantly themed, trivially renderable, and a
    clean swap target when real art arrives.

## Consequences

- **Positive:** No asset pipeline; fast; on-theme; symbols are just data
  (engine uses symbol IDs, UI maps IDs → emoji).
- **Negative:** Emoji rendering varies by platform/font; not brandable; the
  high/jackpot tiers (single Bison / Wolf) lean on emoji recognizability.
- **Neutral:** Because symbols are IDs in the engine, replacing emoji with SVGs
  later is a presentation-only change behind the DEC-001 boundary.

## Validation

Right if: symbols read clearly across target devices and the ID→glyph mapping
stays a presentation concern. Note: colorblind-safe *shapes* (not just emoji
color) are a STAGE-005 audit item, which may motivate the eventual art project.

## References

- Related decisions: DEC-001 (symbols are engine IDs; rendering is UI-side)
- Game rules: `/projects/PROJ-001-animal-slots/brief.md`
- Related constraint (future): colorblind-safe shapes (STAGE-005)
