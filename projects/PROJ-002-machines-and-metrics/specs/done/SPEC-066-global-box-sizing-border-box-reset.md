---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-066
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
  implementer: claude-opus-4-8     # tiny CSS reset — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched (git diff -- src/engine/ EMPTY)
    - DEC-010   # token-only global CSS; the reset is a base layer, adds no colors/tokens
  constraints:
    - portrait-first     # verified 375px + 375×500 render correctly with the reset
    - touch-targets-44   # reset changes no target sizes
  related_specs:
    - SPEC-063  # patched box-sizing locally on the 3 overlay sheets; this generalizes it
    - SPEC-064  # sibling STAGE-013 presentation-only spec (favicon)

# One sentence on what this spec contributes to its stage's
# value_contribution.
value_link: >-
  STAGE-013 "make the existing surfaces feel finished": removes the root cause of a class of layout bug
  (max-height silently defeated by content-box padding) so future fixed/scrolled panels don't re-hit the
  trap SPEC-063 patched locally.

# Self-reported AI cost per cycle. See AGENTS.md §4 and docs/cost-tracking.md.
# This is a visual/layout spec: a blind metered subagent can't SEE a clip, so
# build+verify ran in the orchestrator loop and carry NOMINAL main-loop token
# estimates (SPEC-054-verify / SPEC-064 precedent), not metered subagent counts.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: >-
        Design + build + verify in one orchestrator session (tiny CSS reset whose only honest verification
        is the rendered viewport). Followed the SPEC-063 signal recommendation verbatim.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 9000    # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.14   # nominal, 9000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build in the orchestrator loop: src/styles/reset.css + main.tsx import + a 3-assertion CSS-contract
        test; then removed the now-redundant per-sheet box-sizing decls SPEC-063 added (their comments even
        said "no global reset in this repo"). NOMINAL main-loop token estimate.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 7000    # NOMINAL main-loop estimate
      estimated_usd: 0.11   # nominal, 7000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser at 375×812, 375×500, and 1100×760. Measured getBoundingClientRect: with the
        local decls REMOVED, the help sheet on a 375×500 viewport reports box-sizing:border-box (from the
        global reset), top 0, height 500 == innerHeight — no top clip. Sampled .cabinet / header / body /
        reel-grid / reel__cell / status-readout: all border-box, zero horizontal overflow. All 3 sheets
        (paytable/stats/help) open with title+close visible on phone and inside the framed cabinet on
        desktop. Full gate green (467 tests). NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 16000   # build 9000 + verify 7000 (both NOMINAL; design + ship null)
    estimated_usd: 0.25
    session_count: 4
---

# SPEC-066: Global box-sizing: border-box reset

## Context

STAGE-013 cleanup. SPEC-063 discovered the repo has **no global `box-sizing` reset**, which is the root
cause of a class of layout bug: with the browser default `content-box`, an element's `max-height` is
silently defeated by its own padding (padding is added ON TOP of the cap). This is exactly what clipped the
overlay sheets' titles/close buttons on a short viewport — the sheet measured 556px on a 500px viewport
(500 cap + 56px vertical padding) until `box-sizing: border-box` was added.

SPEC-063 worked around it by adding `box-sizing: border-box` **locally** to the three overlay sheets
(help / paytable / stats). But any future fixed/scrolled panel will hit the same trap. The
`layout-bugs-need-preview-not-unit-tests-and-a-box-sizing-reset` signal in
`feedback/2026-07-04-proj-002-signals.md` explicitly recommends a global reset as a "tiny standalone chore,
deliberately NOT smuggled into SPEC-063." This spec is that chore.

Presentation-only — no engine, no analytics, no security-posture change (DEC-001 / DEC-005 / SECURITY.md
untouched); adds no colors or tokens (DEC-010).

## Goal

Add a global `*, *::before, *::after { box-sizing: border-box; }` reset as a base style layer so every
element's `max-height` / `width` caps include padding by default, and remove the now-redundant per-sheet
declarations SPEC-063 added — without shifting any existing layout.

## Inputs

- **Files to read:** `src/main.tsx` (import order), `src/styles/tokens.css` (base-style precedent),
  `src/ui/{paytable,stats/stats,help/help}.css` (the local decls to retire),
  `feedback/2026-07-04-proj-002-signals.md` (the signal).
- **Related code paths:** `src/styles/`, `src/ui/**/*.css`.

## Outputs

- **Files created:** `src/styles/reset.css` — the universal-selector box-sizing reset (base layer;
  intentionally minimal, box-sizing only, no margin/padding zeroing); `src/styles/reset.contract.test.ts` —
  guard test.
- **Files modified:** `src/main.tsx` — `import './styles/reset.css'` **before** tokens.css so it is the
  base layer; `src/ui/{paytable,stats/stats,help/help}.css` — remove the redundant local
  `box-sizing: border-box` (and refresh the adjacent comment to point at the global reset).
- No engine / token / dependency change.

## Acceptance Criteria

- [x] `src/styles/reset.css` exists and sets `box-sizing: border-box` on `*, *::before, *::after`; imported
      in `src/main.tsx` before `tokens.css`.
- [x] Elements with no local override (`.cabinet`, `.cabinet__header`, `body`, `.reel-grid`, `.reel__cell`,
      `.status-readout`) compute `border-box` at runtime.
- [x] On a 375×500 viewport, an opened overlay sheet (help/paytable/stats) has `top: 0`,
      `height == innerHeight`, `box-sizing: border-box`, and its title + close are visible — **with the
      local per-sheet decls removed** (proves the global reset carries it).
- [x] No horizontal overflow at 375px (`documentElement.scrollWidth == clientWidth`); reels grid + cabinet
      regions + all three sheets render correctly at 375px and desktop (1100×760).
- [x] Engine untouched (`git diff -- src/engine/` EMPTY). `just typecheck && lint && test && build &&
      validate` all green.

## Failing Tests

- **`src/styles/reset.contract.test.ts`** (CSS-contract guard, fs-read pattern like `tokens.test.ts`)
  - `"sets box-sizing: border-box on the universal selector incl. pseudo-elements"` — asserts reset.css
    contains a `*, *::before, *::after { … box-sizing: border-box; … }` rule.
  - `"is imported globally in main.tsx"` — asserts `main.tsx` imports `./styles/reset.css`.
  - `"is imported before tokens.css so it is the base layer"` — asserts the reset import precedes the
    tokens import in `main.tsx`.

> A CSS-contract test guards the *source* promise (the rule exists and is wired in) but structurally cannot
> assert the *rendered* layout — that is what the preview-verify (getBoundingClientRect vs innerHeight)
> covers. This is the exact lesson from the SPEC-063 signal.

## Implementation Context

### Decisions that apply

- `DEC-001` — presentation-only; the reset lives in `src/styles/**`, engine diff stays EMPTY.
- `DEC-010` — global CSS + tokens, no CSS Modules / CSS-in-JS. A universal-selector base layer fits this
  model; it adds no color/hex/tokens, so the `layout.test.ts` "no raw hex" contract is unaffected.

### Constraints that apply

- `portrait-first` — verified the reset renders correctly 375–430px wide and at the 375×500 short viewport.
- `touch-targets-44` — box-sizing changes no target dimensions.

### Prior related work

- `SPEC-063` (shipped, PR #74) — added the local `box-sizing: border-box` to the 3 sheets; this spec
  generalizes and then retires those.
- `SPEC-064` (shipped, PR #75) — sibling presentation-only spec; same "built + preview-verified in the
  orchestrator session, nominal main-loop cost" shape.

### Out of scope (for this spec specifically)

- A full CSS reset (margin/padding zeroing, `min-width:0` on flex items, etc.) — box-sizing only; broaden
  later only if a concrete need appears.
- Any header / sheet / layout redesign — SPEC-063 already fixed those; this only removes the trap's root.
- The per-machine emoji refresh (SPEC-065) — separate pending spec.

## Notes for the Implementer

- Order matters for readability, not cascade: reset first, then tokens. The contract test pins the order.
- Removing the local decls is the strongest proof the global reset works — re-measure a sheet at 375×500
  *after* removal (done in verify).

---

## Build Completion

- **Branch:** `feat/spec-066-global-box-sizing-reset`
- **PR (if applicable):** (opened at ship)
- **All acceptance criteria met?** yes
- **New decisions emitted:** none — the reset is squarely inside DEC-010 (global CSS) and DEC-001
  (presentation-only); no non-trivial choice warranted a DEC.
- **Deviations from spec:** none. Put the reset in a dedicated `src/styles/reset.css` (imported before
  tokens.css) rather than appending to `tokens.css`, so the token sheet stays purely token *values* and the
  reset is independently discoverable/testable — mirrors the existing separate `reduced-motion.css` concern
  file. The signal allowed either ("tokens.css (or a reset layer)").
- **Follow-up work identified:** none new. (The AGENTS testing-conventions "preview-verify layout fixes"
  line is the signal's other follow-up, tracked separately at stage close.)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing. The signal spelled out the fix, the file, and the reasoning; this was a near-verbatim
   execution of a pre-diagnosed chore.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-010 already anticipated base-layer global CSS; no gap.

3. **If you did this task again, what would you do differently?**
   — Nothing material. Removing the local decls and re-measuring at 375×500 was the right call — it turned
   "should be redundant" into "proven redundant."

---

## Reflection (Ship)

1. **What would I do differently next time?**
   — Nothing. A one-line global default retires a whole bug class; the value is in *proving* it with the
   preview (border-box at top:0, height==innerHeight after removing the local crutch), not just adding the
   line.

2. **Does any template, constraint, or decision need updating?**
   — No new DEC (inside DEC-010). The broader "layout fixes need preview, not unit tests" lesson is already
   captured in the SPEC-063 signal and slated for an AGENTS testing-conventions line at stage close.

3. **Is there a follow-up spec I should write now before I forget?**
   — No. SPEC-065 (emoji refresh) remains the only open STAGE-013 item. A fuller CSS reset is explicitly
   deferred unless a concrete need appears.
