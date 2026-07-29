---
task:
  id: SPEC-097
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-021
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-010
    - DEC-028
  constraints:
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-096   # the relocation that exposed the misalignment
    - SPEC-092   # the framing whose edges everything now aligns to

value_link: "Gives the cabinet one horizontal rhythm so its bands read as one machine."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: >-
        Main-loop. Diagnosed by MEASURING the live DOM (getBoundingClientRect on every band)
        rather than eyeballing — the four conflicting edges are not obvious in a screenshot.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 38000
      estimated_usd: 0.76
      recorded_at: 2026-07-29
      note: >-
        One shared inline inset (--space-3) across header/switcher/deck; readout stats to equal
        thirds; switcher arrows pinned to the content edges; deck + icon row spread instead of
        centred.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 15000
      estimated_usd: 0.30
      recorded_at: 2026-07-29
      note: >-
        Re-measured the live DOM: every band's content now spans exactly 31→344 at 375px.
        Verified at 375px and 430px (both ends of the portrait range). Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 53000
    estimated_usd: 1.06
    session_count: 4
---

# SPEC-097: One horizontal rhythm across the cabinet bands

## Goal

Owner, on SPEC-096's result: *"I think that is the layout I want, but it is not well laid out
horizontally."* The vertical arrangement is settled; this makes the bands agree on a left and right
edge and distribute their contents across it.

## The problem (measured, not eyeballed)

Reading `getBoundingClientRect()` off the live DOM at 375px showed **four different horizontal
edges** — invisible in a screenshot, obvious in numbers:

| Element | Spanned |
|---|---|
| Reel window, readout panel | `31 → 344` |
| Switcher band, control deck | `19 → 356` |
| Icon row, deck buttons | `35 → 340` |

Plus three distribution failures:

- **Readout stats bunched mid-panel** — Balance/Bet/WIN occupied `114 → 261` of a 313px panel,
  leaving ~83px dead on each side.
- **Switcher content a small centred cluster** — `95 → 280` in a 337px band, floating with no
  relationship to anything above or below.
- **Deck buttons unevenly spaced** — one 8px gap after `−`, then `+`/Spin/Auto/Reset flush against
  each other, so the row read as crammed-right.

## The fix

**One content edge.** Every band takes the same `--space-3` inline inset as the game face, so band
content lines up with the reel window and readout panel — which were already the correct edge.

**Distribute inside each band** rather than centring a cluster:
- Readout: three equal thirds (`flex: 1 1 0` + `space-between`).
- Switcher: arrows pinned to the content edges, name filling between.
- Deck + icon row: `space-between` across the shared width.

## Outputs

- `src/ui/regions/regions.css` — shared inset on header/deck; deck + icon row spread.
- `src/ui/regions/controls.css` — readout stats as equal thirds.
- `src/ui/machine/machine-switcher.css` — shared inset; arrows to the edges.

## Acceptance

- [x] Every band's content spans the same edges — **measured `31 → 344`** at 375px.
- [x] Readout stats are equal thirds; deck and icon row spread; switcher arrows sit on the edges.
- [x] Verified at **375px and 430px** (both ends of the portrait-first range).
- [x] Arrows and buttons still ≥44px; no raw hex; no `src/engine/**` diff; audio untouched.

## Verification note

This spec's acceptance is a **measurement**, not a screenshot. The whole defect was sub-pixel-ish
misalignment that the eye registers as "not well laid out" without being able to name it — exactly
the kind of thing that a render *shows* but only numbers *diagnose*. Re-measuring after the change
is what proves it, and is cheap to repeat if a future band is added.

## Reflection (Ship)

1. **What would I do differently next time?** — Reach for the measurement earlier. STAGE-020's
   lesson was "the render is the test", and that held: the owner saw the problem instantly in a
   render. But a render could not tell me *what* was wrong — four bands at three different insets
   look approximately fine. Querying `getBoundingClientRect()` across every band turned a vague
   "not well laid out" into a table of conflicting numbers, and the fix followed immediately. So
   the refinement to the stage lesson: **the render finds visual bugs; the DOM measures them.**
   Use both, in that order.

2. **Does any template, constraint, or decision need updating?** — No. DEC-028 already establishes
   the framing this aligns to and needed no amendment; the shared inset is an implementation detail
   consistent with it, not a new decision. If a future band forgets the inset it will look wrong
   immediately next to its neighbours, which is adequate feedback without a test.

3. **Is there a follow-up spec I should write now before I forget?** — SPEC-098 is already
   requested and next: move the winning paw-print off-centre with a contrasting colour. One thing
   this spec deliberately did **not** touch, and which is now the most visible remaining gap: the
   win-banner band still reserves ~48px that is empty except during a win (SPEC-019's no-layout-
   shift guarantee). It is tinted as cabinet face so it reads as part of the machine, but on a
   quiet screen it is a stretch of nothing between the header and the reels. Worth raising with the
   owner rather than unilaterally reclaiming — the reserved height is what stops the reels jumping
   on every win.
