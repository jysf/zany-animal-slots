---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-070
  type: chore                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # tiny presentation change — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-010   # token-only CSS
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-068  # made the paytable trigger icon-only (this changes which icon)
    - SPEC-069  # the viewport-fixed sheets this adds a Safari vh fallback to

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  Small live-testing polish: the Paytable header icon becomes a money bag (💰), and a vh fallback for
  dvh hardens the overlay sheets for older Safari.

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
      tokens_total: null
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (tiny presentation change).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 10000   # NOMINAL main-loop estimate
      estimated_usd: 0.15   # nominal, 10000 tok x ~$15/M (Opus list)
      recorded_at: 2026-07-12
      note: >-
        Changed the Paytable trigger ℹ → 💰 (and the matching "Paytable" reference in the help sheet's
        WHERE TO FIND THINGS list); added `max-height: 100vh` before `100dvh` on all three overlay sheets
        as a fallback for older Safari (<15.4) that ignores dvh. NOMINAL main-loop estimate. Full gate
        green (471, worktree excluded); engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 6000    # NOMINAL main-loop estimate
      estimated_usd: 0.09   # nominal, 6000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser: the header Paytable icon renders as 💰 (one clean row preserved) and the help
        sheet shows "💰 Paytable"; sheets still open with title + close visible. The overlay-sheet clip
        itself was fixed by SPEC-069 (position:fixed everywhere) — this adds the vh fallback as older-Safari
        insurance (not directly testable in the Chromium preview). NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 16000   # build 10000 + verify 6000 (both NOMINAL; design + ship null)
    estimated_usd: 0.24
    session_count: 4
---

# SPEC-070: Money-bag Paytable icon + Safari dvh fallback

## Context

Two small items from live testing on Safari:

1. **Paytable icon** — the user asked to change the header Paytable trigger from the info glyph `ℹ` to a
   money bag `💰` (more on-theme for a payouts table).
2. **Safari overlay robustness** — the overlay-sheet clip the user saw was the SPEC-063 desktop-`absolute`
   bug, fixed by SPEC-069 (`position: fixed` at all sizes). As belt-and-suspenders for **older Safari
   (<15.4)** — which ignores the `dvh` unit and would drop `max-height: 100dvh` entirely (leaving the
   sheet uncapped) — add a `100vh` fallback before the `dvh` value.

Presentation-only (DEC-001), CSS/markup only.

## Outputs

- **Files modified:**
  - `src/ui/PaytableSheet.tsx` — trigger content `ℹ` → `💰` (aria-label/title "Paytable" unchanged).
  - `src/ui/help/HelpSheet.tsx` — the WHERE-TO-FIND-THINGS "ℹ Paytable" → "💰 Paytable" (consistency).
  - `src/ui/help/help.css`, `src/ui/paytable.css`, `src/ui/stats/stats.css` — `max-height: 100vh;` fallback
    line before `max-height: 100dvh;`.
- No engine / dependency / DEC / test change.

## Acceptance Criteria

- [ ] The header Paytable trigger shows 💰 (keeps aria-label "Paytable" + the hover title); the help sheet
      shows "💰 Paytable"; the header stays on one clean row.
- [ ] Each overlay sheet declares `max-height: 100vh` immediately before `max-height: 100dvh` (older-Safari
      fallback); modern browsers still use dvh.
- [ ] `git diff … -- src/engine/` EMPTY; full gate green.

## Failing Tests / guards

- Verified by browser preview (the money-bag icon renders; sheets open with title + close). The Paytable
  trigger is queried by `aria-label` in tests, so the glyph swap keeps them green.

## Implementation Context

- `DEC-001` / `DEC-010` — markup + token CSS only; engine untouched.
- The clip fix itself is SPEC-069 (`position: fixed`); this only adds the `vh` fallback + the icon swap.

### Out of scope
- The `JackpotMoment` wolf (flagged); any further Safari-specific work beyond the dvh fallback (re-test
  needed on real Safari — not available in the Chromium preview).

## Notes for the Implementer

Trivial swap + a CSS fallback line. Verified the icon in the header + help sheet at 375px.

---

## Build Completion

- **Branch:** `feat/spec-070-safari-sheet-and-money-icon`
- **All acceptance criteria met?** yes — header shows 💰 (one clean row kept), help shows "💰 Paytable",
  all three sheets have the `100vh`→`100dvh` fallback. Full gate green (471, worktree excluded); engine diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** none.
- **Follow-up identified:** re-test the overlay sheets on real Safari (SPEC-069 fix + this fallback) — I
  can't drive Safari from the Chromium preview.

### Build-phase reflection
1. **What was unclear?** — Whether the Safari clip needed more than SPEC-069; concluded SPEC-069's
   position:fixed is the fix and dvh needs a vh fallback for old Safari — added defensively.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — Pair `vh` + `dvh` from the start whenever using dvh.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Always write `max-height: 100vh; max-height: 100dvh;`
   together — the progressive-enhancement pair — so no browser is left with an uncapped panel.
2. **Does any template/constraint/decision need updating?** — No DEC. Worth an AGENTS/UI note: pair `vh`
   with `dvh` (and test on Safari, which the Chromium preview can't stand in for).
3. **Follow-up spec to write now?** — None; awaiting the user's Safari re-test.
