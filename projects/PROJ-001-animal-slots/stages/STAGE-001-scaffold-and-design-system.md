---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-001                     # stable, zero-padded within the project
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-06-19

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
- [x] SPEC-002 (shipped on 2026-06-19) — Design-token sheet: colors, type scale, spacing as CSS custom properties (`:root`), imported globally, with a token-contract test. **[S]**
- [x] SPEC-003 (shipped on 2026-06-19) — Four-region portrait layout skeleton (Header / Game / Status / Action), responsive and correct 375–430px, built on the tokens. **[M]**
- [x] SPEC-004 (shipped on 2026-06-19) — Desktop device-frame wrapper: centers the portrait cabinet in a device frame at desktop widths without disturbing the phone layout. **[S]**

**Count:** 4 shipped / 0 active / 0 pending — backlog complete (Stage Ship pending)

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

*Shipped 2026-06-19. All four specs in `specs/done/`.*

### Success criteria — did we deliver?

All five met:
- ✅ `npm install` → `npm run dev` serves the themed four-region cabinet (verified
  in-browser at 375px and desktop during SPEC-003/004).
- ✅ Design tokens are CSS custom properties consumed via `var()`; a token-contract
  test and a no-raw-hex check in the frame CSS keep literals out of components.
- ✅ Renders correctly 375–430px portrait and centers in a rounded, shadowed device
  frame on desktop (SPEC-004), without disturbing the phone layout.
- ✅ `lint` + `typecheck` pass; `eslint.config.js` carries the `engine-no-dom`
  `no-restricted-imports` boundary, standing before any engine code (SPEC-001).
- ✅ CI runs lint + typecheck + test (plus the `cost-data` audit job) on every PR.

### value_contribution — delivered as claimed?

Yes, all four deliverables landed and each spec's `value_link` traces cleanly:
the app shell + dev server (SPEC-001), tokens (SPEC-002), four-region portrait
layout (SPEC-003), desktop device frame (SPEC-004). The `engine-no-dom` wall was
deliberately built empty in SPEC-001 — its real test comes in STAGE-002, but it
is in place exactly as the contribution promised. No spec over-claimed.

### 3-sentence summary

Built exactly the four specs planned, in order, with no scope added or dropped —
the empty themed cabinet boots, is tokenized, lays out in four portrait regions,
and frames on desktop. It moved fast (all four shipped across 2026-06-18→19) and
the cycle structure mostly stayed out of the way on this small, mechanical stage.
The one emergent friction was process, not product: a build sub-agent returned a
truncated mid-task message and a stale timeline marker claimed a build had run
when git showed none — both caught by trusting git/disk over self-reports
(dogfood finding #11).

### Stage-Level Reflection answers

- **Did we deliver the outcome in "What This Stage Is"?** Yes — a themed, empty
  slot cabinet that boots in the browser, full-screen on phones and framed on
  desktop, with the engine/presentation boundary enforced in tooling from commit
  one.
- **How many specs did it actually take?** Four, exactly as the backlog planned
  (no splits, no additions).
- **What changed between starting and shipping?** Nothing in scope. The only
  additions were small and anticipated: `@types/node` + DEC-009 (so the CSS-source
  tests type-check) and the radius/shadow tokens deferred from SPEC-002 to SPEC-004
  "until first needed." A `.claude/launch.json` was added for preview/visual checks.
- **Lessons that should update AGENTS.md, templates, or constraints?** No mandatory
  template change. The accumulated dogfood findings (esp. #10 trivial-dev-dep
  tension, #11 sub-agent self-report reliability) are the candidates to promote at
  the next `just weekly-review`; recording them in the feedback log is the right
  home for now rather than churning AGENTS.md mid-project.
- **Should any spec-level reflections be promoted to stage-level lessons?** Yes —
  the "trust git/disk over any agent self-report" lesson (from SPEC-004's build)
  generalizes beyond one spec and is the stage's most reusable takeaway.

### Follow-up flags

- **Next:** STAGE-002 (slot engine) — its `engine-no-dom` boundary and the game
  rules it implements (now authoritative in brief.md's Game-Design Spec + DEC-011)
  are ready. Framing it active is the immediate next step.
- No new stage needed here; no spec to defer into a later stage; nothing punted to
  a future project from STAGE-001.
