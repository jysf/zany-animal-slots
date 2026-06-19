---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-010
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

created_at: 2026-06-19
supersedes: null
superseded_by: null

affected_scope:
  - src/ui/**
  - src/styles/**

tags:
  - presentation
  - css
  - styling
  - convention
---

# DEC-010: Style the UI with global CSS + design tokens (no CSS Modules / CSS-in-JS)

## Decision

UI styling uses plain **global CSS files** that consume the design tokens
(`var(--token)`) — no CSS Modules, no CSS-in-JS, no utility framework. Class
names are component/region-prefixed (BEM-ish, e.g. `.cabinet`,
`.cabinet__header`) to avoid collisions. React components are organized by area
under `src/ui/**` (e.g. `src/ui/regions/`), matching `docs/architecture.md`.

## Context

SPEC-003 introduces the first real styled UI (the four-region cabinet layout)
and every later UI spec (device frame, reels, controls, celebrations) needs a
consistent styling approach. `AGENTS.md` §5 allows "vanilla CSS + CSS custom
properties (or CSS modules); no UI component library." A choice had to be pinned
so the styling stays uniform and tokens remain the single source of visual truth
(DEC: the token sheet is SPEC-002).

## Alternatives Considered

- **Option A: CSS Modules (`*.module.css`)**
  - What it is: locally-scoped class names imported into components.
  - Why rejected (for now): adds per-file import bindings and ceremony for a
    small app; the global namespace is manageable at this size with prefixing.
    Scoping isn't worth the friction yet.

- **Option B: CSS-in-JS (styled-components / emotion)**
  - Why rejected: a runtime dependency and bundle cost for no benefit here;
    against the project's "no extra UI deps" leaning (cf. DEC-004). Tokens
    already give theming.

- **Option C: Utility framework (Tailwind)**
  - Why rejected: a dependency and a parallel token model that would compete
    with our CSS-custom-property design tokens (SPEC-002).

- **Option D (chosen): Global CSS files + tokens + prefixed class names**
  - Why selected: zero dependencies, tokens drive everything (single source of
    truth, enables PROJ-002 theme-swap), trivially understood, and adequate for
    an app of this size.

## Consequences

- **Positive:** No deps; tokens are consumed everywhere via `var()`; simple
  mental model; theme-swap stays a token-sheet swap.
- **Negative:** Global class namespace — collision risk as the app grows
  (mitigated by component/region prefixes). No build-enforced scoping.
- **Neutral:** If the component count grows large or collisions bite, migrating
  to CSS Modules is mechanical and can supersede this decision.

## Validation

Right if: styles stay token-driven (no hardcoded theme colors), class collisions
don't occur, and contributors find the convention obvious. Revisit if: the
global namespace causes real collisions or a component needs guaranteed scoping.

## References

- Related decisions: SPEC-002's token sheet (the tokens this consumes), DEC-001
  (presentation stays in `src/ui/**` / `src/styles/**`), DEC-004 (no extra UI deps)
- Related spec: SPEC-003 (first consumer)
- Architecture: `docs/architecture.md` (module layout)
