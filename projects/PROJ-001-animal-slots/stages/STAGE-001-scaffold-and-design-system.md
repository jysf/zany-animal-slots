---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-001                     # stable, zero-padded within the project
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: null

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Advances the "small web app with game logic cleanly separable from
    presentation" half of the thesis by standing up the app shell, the
    engine/presentation boundary (enforced in tooling), and the design-token
    system before any game logic exists — so later stages inherit the split
    instead of re-deciding it.
  delivers:
    - "A themed, empty slot cabinet that boots in the browser via the dev server."
    - "Design tokens (colors, type scale, spacing) as CSS custom properties."
    - "A four-region portrait layout (Header / Game / Status / Action) that renders correctly 375–430px wide and centers in a device frame on desktop."
    - "An ESLint import-boundary rule that will keep src/engine/** free of React/DOM imports once the engine exists."
  explicitly_does_not:
    - "Implement any spin, RNG, payline, or win logic (that is STAGE-002)."
    - "Render reels, symbols, or any interactive game control (STAGE-003)."
    - "Add any animation or celebration (STAGE-003 / STAGE-004)."
    - "Add audio of any kind (STAGE-004 / STAGE-005)."
---

# STAGE-001: Scaffold & design system

## What This Stage Is

The empty, themed cabinet. This stage stands up the project — Vite + React +
TypeScript boots and serves — and establishes the two things every later stage
depends on: the **design-token system** (colors, type scale, and spacing from
the design spec, expressed as CSS custom properties) and the **four-region
portrait layout** (Header / Game / Status / Action). The layout renders
correctly at phone widths (375–430px) and centers inside a device frame on
desktop. Tooling also lays down the **engine/presentation boundary** — an
ESLint import rule that will forbid React/DOM imports under `src/engine/**` —
so that when STAGE-002 introduces the engine, the wall is already standing.
When this stage ships, you can load the app in a browser and see a themed,
empty slot machine with no game logic behind it.

## Why Now

It is the foundation: nothing in STAGE-002…005 can land safely until the app
boots, the token system exists, and the layout regions are defined. Doing the
design tokens and the engine/presentation import boundary up front is what
makes the project's central claim — clean separation of logic from
presentation — structurally true from the first commit rather than something
we try to retrofit later. Establishing it now also keeps the dogfood signal
honest: if the template fights ordinary frontend scaffolding work, we want to
learn that on the cheapest stage.

## Success Criteria

- `npm install` then `npm run dev` serves the app, and the browser shows the
  themed four-region cabinet shell.
- Design tokens are defined once as CSS custom properties and consumed by the
  layout — no hard-coded colors/spacing in component styles.
- The shell renders correctly across 375–430px portrait widths and is centered
  in a device frame on desktop (constraint `portrait-first`).
- `npm run lint` and `npm run typecheck` pass, and the ESLint config already
  carries the `engine-no-dom` import-boundary rule (even though `src/engine/**`
  is empty until STAGE-002).
- CI runs lint + typecheck + test on every PR.

## Scope

### In scope
- Project scaffold: Vite + React 18 + TypeScript (strict), Node 20.
- Tooling: ESLint (incl. the `no-restricted-imports` / import-boundary rule for
  `engine-no-dom`) + Prettier; Vitest + React Testing Library wired and runnable.
- CI pipeline: lint + typecheck + test on every PR.
- Design-token sheet: colors, type scale, spacing as CSS custom properties.
- Four-region portrait layout skeleton (Header / Game / Status / Action).
- Desktop device-frame wrapper that centers the portrait cabinet.

### Explicitly out of scope
- Any game logic — RNG, reels, paylines, paytable, bet/balance (STAGE-002).
- Any reel/symbol rendering or interactive control (STAGE-003).
- Any animation, transition, or celebration (STAGE-003 / STAGE-004).
- Any audio (STAGE-004 / STAGE-005).
- Accessibility audit beyond not actively breaking it — the formal
  reduced-motion / contrast / 44px / colorblind audit is STAGE-005.

## Spec Backlog

Ordered list of specs composing this stage. One-liners for now; each is
expanded into a full spec via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [x] SPEC-001 (shipped on 2026-06-18) — Project scaffold + tooling: Vite + React + TS (strict), ESLint w/ `engine-no-dom` import boundary, Prettier, Vitest + RTL, CI (lint/typecheck/test). **[M]**
- [ ] (not yet written) — Design-token sheet: colors, type scale, spacing from the design spec as CSS custom properties, with a small test that a token resolves. **[S]**
- [ ] (not yet written) — Four-region portrait layout skeleton (Header / Game / Status / Action), responsive and correct 375–430px, built on the tokens. **[M]**
- [ ] (not yet written) — Desktop device-frame wrapper: centers the portrait cabinet in a device frame at desktop widths without disturbing the phone layout. **[S]**

**Count:** 1 shipped / 0 active / 3 pending

## Design Notes

- **Module layout (mirrors `docs/architecture.md`):** presentation lives under
  `src/ui/**`, shared styles/tokens under `src/styles/**`
  (e.g. `src/styles/tokens.css`). `src/engine/**` is created but stays empty
  this stage; the import-boundary rule guards it from day one.
- **Tokens are the single source of truth for visual values.** Components
  reference `var(--token)`, never literal hex/px for themed values. This is
  what lets PROJ-002's theme-swap work later by swapping the token sheet.
- **The first spec must wire the `engine-no-dom` ESLint rule even though the
  engine is empty** — adding it later means retrofitting a boundary against
  existing imports. See `DEC-001` (engine/presentation separation) and the
  `engine-no-dom` constraint.
- Layout uses CSS (flex/grid + custom properties), not a component library —
  see the tech stack in `AGENTS.md §5`.
- Keep interactive-control affordances ≥ 44px even in the empty shell so
  STAGE-003 inherits compliant targets (constraint `touch-targets-44`).

## Dependencies

### Depends on
- None. This is the foundational stage of PROJ-001.

### Enables
- STAGE-002 — the engine lands behind the import boundary established here.
- STAGE-003 — reels/controls render into the four layout regions and consume
  the tokens.
- Every later visual/audio stage inherits the token system and layout.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*

- **Did we deliver the outcome in "What This Stage Is"?** <not yet>
- **How many specs did it actually take?** <not yet>
- **What changed between starting and shipping?** <not yet>
- **Lessons that should update AGENTS.md, templates, or constraints?** <not yet>
- **Should any spec-level reflections be promoted to stage-level lessons?** <not yet>
