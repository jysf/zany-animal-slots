---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-071
  type: bug                        # epic | story | task | bug | chore
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
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-14

references:
  decisions:
    - DEC-001   # presentation-only
    - DEC-010   # token-only CSS
  constraints:
    - engine-no-dom
    - touch-targets-44
  related_specs:
    - SPEC-068  # iconified the header triggers (left them at the small text font-size)
    - SPEC-070  # switched the paytable icon to 💰 (which read as too small until this)

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  Live-testing fix: the header action icons (💰/📊/❓) were stuck at the old text-label font-size after
  SPEC-068 iconified them, so the detailed money-bag glyph was barely visible.

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
      note: Design + build + verify in the orchestrator session (one-line CSS fix; verification is the rendered header icon).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000    # NOMINAL main-loop estimate
      estimated_usd: 0.12   # nominal, 8000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Diagnosed in-browser: the paytable/stats/help triggers computed font-size 12.8px (var
        font-size-sm, left over from the text-label era), vs the mute toggle at 16px — so the emoji glyphs
        (esp. 💰) rendered tiny. Fix: set font-size: var(--font-size-lg) + line-height:1 on the four header
        icon triggers in regions.css. NOMINAL main-loop estimate. Full gate green (471, worktree excluded).
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 5000    # NOMINAL main-loop estimate
      estimated_usd: 0.08   # nominal, 5000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: Verified in-browser at 375px — 💰/📊/❓ render clearly and consistently; header stays one clean row. NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 13000
    estimated_usd: 0.20
    session_count: 4
---

# SPEC-071: Header icon size fix — visible glyphs

## Context

The user reported not seeing the new 💰 Paytable icon. Cause: SPEC-068 iconified the paytable/stats/help
header triggers but left their `font-size` at `var(--font-size-sm)` (12.8px, from when they held text
labels like "ℹ Paytable"), while the mute toggle was 16px. As standalone icons, 12.8px is tiny — the
detailed money-bag glyph in particular was barely visible. Presentation-only.

## Goal

Render the four header action icons (🔊 / 💰 / 📊 / ❓) at a clear, consistent size, keeping the single
clean row and ≥44px targets.

## Outputs

- **Files modified:** `src/ui/regions/regions.css` — the header icon-trigger rule gains
  `font-size: var(--font-size-lg)` + `line-height: 1`.
- No engine / dependency / DEC / test change.

## Acceptance Criteria

- [ ] The 🔊 / 💰 / 📊 / ❓ header icons render at a clear, consistent size (font-size-lg), all visible;
      the header stays on one row; each stays ≥44px (touch-targets-44).
- [ ] `git diff … -- src/engine/` EMPTY; full gate green.

## Failing Tests / guards
- Verified by browser preview (the icons are visible + consistent). Queried-by-aria-label tests unaffected.

## Implementation Context
- `DEC-001` / `DEC-010` — token CSS only; engine untouched.

### Out of scope
- The `JackpotMoment` wolf (flagged); anything beyond the icon size.

## Notes for the Implementer
Diagnosed via `getComputedStyle(trigger).fontSize` (12.8px vs the mute's 16px). One rule fixes all four.

---

## Build Completion
- **Branch:** `feat/spec-071-header-icon-size`
- **All acceptance criteria met?** yes — icons clear + consistent at 375px (screenshot); one row kept.
  Full gate green (471, worktree excluded); engine diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** none.
- **Follow-up identified:** none for close-out.

### Build-phase reflection
1. **What was unclear?** — Nothing; measured the computed font-size to find the 12.8px leftover.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — When iconifying a text button, set an explicit icon font-size in the same change
   (SPEC-068 should have) instead of inheriting the text size.

---

## Reflection (Ship)
1. **What would I do differently next time?** — Set the icon size when removing the text label (SPEC-068),
   not as a follow-up — an iconified button shouldn't inherit the text-era font-size.
2. **Does any template/constraint/decision need updating?** — No DEC.
3. **Follow-up spec to write now?** — None.
