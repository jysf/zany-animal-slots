---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-069
  type: bug                        # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # CSS bug fix — diagnosed + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-010   # token-only CSS
    - DEC-004   # slide-up + reduced-motion fallback preserved
  constraints:
    - engine-no-dom
    - portrait-first
  related_specs:
    - SPEC-063  # the overlay-sheet anchoring this completes (its desktop path was the bug)
    - SPEC-066  # the box-sizing reset the sheets rely on

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  Fixes a user-reported bug: on first-run (help auto-open) at some viewports the overlay sheet clipped
  its own title + close button off-screen, stranding the close control.

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
      note: Design + build + verify in the orchestrator session (CSS bug; verification is the rendered sheet at multiple viewports).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 28000   # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.42   # nominal, 28000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Diagnosed in-browser (getBoundingClientRect vs innerHeight): the SPEC-063 desktop override made
        the sheets position:absolute inside the centered overflow:hidden cabinet, where `bottom:0` did NOT
        resolve to the cabinet bottom — so on first-run/tall-content the sheet rested with its title/close
        clipped above the frame. Fix: removed the `@media(min-width:640px)` position:absolute override in
        help/paytable/stats.css so all sizes use the base `position:fixed` (viewport-anchored, max-width
        430px centred, max-height:100dvh + box-sizing:border-box + overflow-y:auto). NOMINAL main-loop
        estimate. Full gate green (471, worktree excluded); engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 12000   # NOMINAL main-loop estimate
      estimated_usd: 0.18   # nominal, 12000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified the first-run help auto-open at three viewports — 918x1054, 918x600 (the reported
        short-viewport config), and 390x667 mobile: the title + close are always fully visible at the top
        and the body scrolls; no clipping. The SPEC-063 overlay-sheet-scroll contract test still passes
        (base rule unchanged: fixed + dvh cap + overflow-y). NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 40000   # build 28000 + verify 12000 (both NOMINAL; design + ship null)
    estimated_usd: 0.60
    session_count: 4
---

# SPEC-069: Overlay-sheet clip fix — viewport-fixed at all sizes

## Context

A user-reported bug from playing the live build: the **first time Help opens** (it auto-opens on first
run), the overlay sheet **clipped its own title + × close button off the top of the screen**, leaving the
close control unreachable.

Root cause (diagnosed in-browser with `getBoundingClientRect` vs `innerHeight`): SPEC-063 fixed the
overlay sheets by anchoring them to the **viewport** with `position: fixed` on phones, but added a
`@media (min-width: 640px)` **desktop override** that switched them back to `position: absolute` inside
the centered, `overflow: hidden` device-frame cabinet. On that desktop path, `bottom: 0` did **not**
resolve to the cabinet's bottom edge, so a first-run / tall-content sheet rested with its top (title +
close) **above** the frame — clipped by the cabinet's `overflow: hidden` and the viewport top.

Presentation-only (DEC-001), CSS only.

## Goal

Make the overlay sheets (Help / Paytable / Stats) **never clip their title + close button**, at any
viewport size, by anchoring them to the **viewport** (`position: fixed`) uniformly — removing the desktop
`position: absolute` override.

## Outputs

- **Files modified (CSS only):** `src/ui/help/help.css`, `src/ui/paytable.css`, `src/ui/stats/stats.css`
  — removed each sheet's `@media (min-width: 640px)` `position: absolute` override (backdrop + sheet), so
  all sizes use the base `position: fixed` rule.
- No engine / dependency / DEC / test change (the SPEC-063 `overlay-sheet-scroll.contract.test.ts` already
  asserts the base rule is `fixed` + `dvh` cap + `overflow-y` — still true, still green).

## Acceptance Criteria

- [ ] On first-run (help auto-open) at a short viewport (e.g. 918×600) AND a tall one (918×1054) AND
      mobile (390×667), the sheet's title + × close are fully visible at the top; the body scrolls; the
      close is always reachable.
- [ ] The fixed sheet stays width-constrained (`max-width: 430px`, centred) — it does not span the whole
      desktop viewport.
- [ ] Reduced-motion fallback + slide-up still work; `git diff … -- src/engine/` EMPTY; full gate green.

## Failing Tests / guards

- Verified by **browser preview** at three viewports (the meaningful check for a layout clip). The
  existing `overlay-sheet-scroll.contract.test.ts` continues to guard the base rule (fixed + viewport cap
  + scroll) in source.

## Implementation Context

- `DEC-001` / `DEC-010` — CSS only, token-driven, engine untouched.
- The desktop override existed to keep the sheet nested inside the framed cabinet on desktop; but the
  base fixed rule is already `max-width: 430px; margin-inline: auto`, so on desktop it renders as a
  430px-wide bottom sheet centred over the cabinet column — never full-viewport-width, and never clipped.
  Functional (reachable close) beats cosmetic (nested in the frame).

### Out of scope
- Any redesign of the sheets beyond the positioning fix; the `JackpotMoment` wolf (flagged).

## Notes for the Implementer

The tell was `getComputedStyle(sheet).transform` + `getBoundingClientRect().top` measured against
`window.innerHeight`: on the desktop path the sheet's layout top was negative (above the viewport). Fix
verified by driving the first-run auto-open at short/tall/mobile viewports.

---

## Build Completion

- **Branch:** `feat/spec-069-sheet-clip-fix`
- **All acceptance criteria met?** yes — first-run help shows title + close at 918×1054, 918×600, and
  390×667 (screenshots); body scrolls; no clip. Full gate green (471, worktree excluded); engine diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** none. On desktop the sheet is now a 430px bottom sheet anchored to the viewport
  (not nested in the centered frame) — an intentional, documented trade-off (reachable close > cosmetic nesting).
- **Follow-up identified:** none for close-out.

### Build-phase reflection
1. **What was unclear?** — Why the desktop `absolute` path clipped; diagnosed with getBoundingClientRect vs
   innerHeight (layout top was negative). The lesson: a bottom sheet should be viewport-`fixed`, full stop.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — In SPEC-063 I over-engineered the desktop path (absolute-in-frame) to keep the
   sheet nested; a single viewport-fixed rule for all sizes is simpler and correct. Prefer the simple
   robust rule over the clever one.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Not split a modal's positioning by breakpoint. A
   bottom-sheet/modal wants to be `position: fixed` to the viewport at all sizes; the SPEC-063 desktop
   `absolute`-in-cabinet variant was the source of two rounds of clipping. One rule, viewport-anchored.
2. **Does any template/constraint/decision need updating?** — No DEC. Worth an AGENTS/UI note: overlays
   (sheets, modals, toasts) anchor to the viewport with `position: fixed`, not to an in-page container —
   a container with `overflow:hidden` or a non-obvious containing block will clip or mis-place them.
3. **Follow-up spec to write now?** — None for close-out.
