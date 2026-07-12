---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-064
  type: chore                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: low
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # tiny visual asset — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-008   # the static-asset deploy (public/ → dist/) the favicon rides
  constraints:
    - no-real-money
  related_specs:
    - SPEC-063  # sibling STAGE-013 UI-polish spec

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  STAGE-013 identity polish: gives the app a recognizable slot-machine tab/bookmark icon it currently
  lacks (index.html had no <link rel=icon> at all).

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (tiny visual asset; verification is the rendered tab icon).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 12000   # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.18   # nominal, 12000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build run in the orchestrator loop (public/favicon.svg + index.html link + meta description + a
        deploy contract test). NOMINAL main-loop token estimate (SPEC-054-verify precedent). One
        preview-caught fix: the contract test's "no external URL" assertion initially tripped on the SVG
        xmlns namespace URI (not a fetch) — narrowed it to real resource refs. Full gate green (464 tests).
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000    # NOMINAL main-loop estimate
      estimated_usd: 0.12   # nominal, 8000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser: favicon.svg renders as a clean slot machine (gold cabinet, red marquee, dark
        reel window with a jackpot line, spin button, lever); GET /favicon.svg -> 200; the <link rel=icon
        type=image/svg+xml href=/favicon.svg> is present; `just build` copies it to dist/favicon.svg.
        NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 20000   # build 12000 + verify 8000 (both NOMINAL; design + ship null)
    estimated_usd: 0.30
    session_count: 4
---

# SPEC-064: Slot-machine favicon

## Context

STAGE-013 identity polish (Task: "create slot machine favico"). `index.html` currently ships **no**
`<link rel="icon">` at all, so browsers show a blank/default tab icon and `/favicon.ico` 404s. This spec
adds a self-contained SVG **slot-machine** favicon and wires it in. The user chose the "slot machine 🎰"
style (a cabinet + reels), not the animal-themed variant. Presentation/asset only — no engine, no
analytics, no security-posture change (DEC-001, DEC-005 untouched).

## Goal

Ship a crisp, self-contained SVG slot-machine favicon in `public/` and reference it from `index.html`
(`<link rel="icon" type="image/svg+xml">`), so the app has a recognizable browser-tab / bookmark identity.

## Inputs / Outputs

- **Files created:** `public/favicon.svg` — a self-contained slot-machine SVG (gold cabinet, red marquee,
  dark reel window with a three-symbol jackpot line, spin button, pull lever; transparent background so it
  reads on light or dark tab bars); `src/deploy/favicon.contract.test.ts` — guard test.
- **Files modified:** `index.html` — add `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
  (and, while here, a `<meta name="description">` the page also lacked).
- No engine / CSS-token / dependency change. CSP already allows it (`img-src 'self'`).

## Acceptance Criteria

- [ ] `public/favicon.svg` exists, is a valid self-contained SVG (inline shapes, no external resource
      fetch), and renders as a recognizable slot machine.
- [ ] `index.html` links it as `rel="icon" type="image/svg+xml" href="/favicon.svg"`; `GET /favicon.svg`
      returns 200 in the running app; `just build` copies it to `dist/favicon.svg`.
- [ ] `git diff … -- src/engine/` EMPTY; no new dependency; full gate green.

## Failing Tests

- **`src/deploy/favicon.contract.test.ts`** — `public/favicon.svg` is a valid SVG with inline
  `rect/circle/path` art and no external `<image>` / `href="http…"` / `url(http…)` refs; `index.html`
  contains the `rel="icon"` + `type="image/svg+xml"` + `href="/favicon.svg"` link. (Rendered-icon
  legibility is verified by browser preview.)

## Implementation Context

- `DEC-001` — asset/markup only; engine untouched.
- `DEC-008` — the static-asset deploy: `public/*` is copied verbatim to `dist/*` by Vite, so the favicon
  ships with no build step.
- A favicon is a standard static asset (unlike audio, which DEC-007 synthesizes) — an inline SVG keeps it
  self-contained and CSP-friendly (no remote fetch).

### Out of scope
- The emoji refresh (SPEC-065); a raster `.ico`/PNG fallback or `apple-touch-icon` (SVG favicons are
  broadly supported; add later only if a target browser needs it); any app-UI change.

## Notes for the Implementer

Verified by rendering `/favicon.svg` in the browser and confirming the app links + fetches it. Keep the
SVG bold and simple so it reads at 16px (large shapes, high contrast, transparent background).

---

## Build Completion

- **Branch:** `feat/spec-064-slot-machine-favicon`
- **All acceptance criteria met?** yes — favicon.svg renders as a clean slot machine (verified in browser);
  `GET /favicon.svg → 200`; `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` present;
  `dist/favicon.svg` produced by `just build`; full gate green (464 tests).
- **New decisions emitted:** none.
- **Deviations from spec:** the contract test's initial "no external URL" assertion tripped on the SVG
  `xmlns` namespace URI (a namespace identifier, not a fetch) — narrowed to real resource refs
  (`<image>` / `href="http…"` / `url(http…)`).
- **Follow-up work identified:** SPEC-065 (emoji refresh, awaiting the user's lists).

### Build-phase reflection
1. **What was unclear?** — Nothing; the only wrinkle was the over-broad URL regex catching `xmlns`.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — Write "self-contained" asset assertions against resource-ref patterns, not any
   `http`, from the start.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing material; a favicon is a one-shot asset. The
   preview render is the real check — an SVG that validates can still look wrong at 16px, so eyeballing it
   mattered.
2. **Does any template/constraint/decision need updating?** — No.
3. **Follow-up spec to write now?** — Only SPEC-065 (emoji refresh), already framed and awaiting input.
