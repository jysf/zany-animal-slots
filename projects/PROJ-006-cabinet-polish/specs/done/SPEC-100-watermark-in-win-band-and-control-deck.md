---
task:
  id: SPEC-100
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
    - DEC-015
    - DEC-028
  constraints:
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-098   # the watermark this extends
    - SPEC-019   # the reserved win band it now decorates

value_link: "Extends the symbol watermark to the two bands that were still bare."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner request after seeing SPEC-098 on a real iPhone."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 34000
      estimated_usd: 0.68
      recorded_at: 2026-07-29
      note: >-
        MachinePattern gains a `variant` prop (face | band | on-frame); mounted in the win band
        and the control deck. Deck variant paints in --color-bg because the deck's background IS
        --color-frame. Stacking contexts added so band content stays above the decoration.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 15000
      estimated_usd: 0.30
      recorded_at: 2026-07-29
      note: >-
        Confirmed the decoration cannot intercept input: elementFromPoint at the Spin button's
        centre returns the button, and the pattern computes pointer-events:none. Real render at
        390x844. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 49000
    estimated_usd: 0.98
    session_count: 4
---

# SPEC-100: Watermark in the win band and the control deck

## Goal

Owner, after seeing SPEC-098 on a real iPhone: *"I think the empty band and the row of buttons
should also have the watermark."*

## Why it fits

The reserved win band (SPEC-019) is ~48px that is **empty except during a win** — decoration is
exactly what it should hold, and this converts a long-standing dead strip into something
intentional. The control deck was the other large flat area with nothing on it.

## The one non-obvious part

The deck's background **is** `--color-frame` — the same token the watermark paints with. The default
variant would have been invisible there. So the deck variant paints in `--color-bg` instead: dark
glyphs on the lighter deck, the same idea inverted. One component, three variants:

| Variant | Where | Silhouette colour | Layout |
|---|---|---|---|
| `face` | cabinet face | `--color-frame` | rows pushed to the strips around the reel window |
| `band` | win band | `--color-frame` | one centred row |
| `on-frame` | control deck | `--color-bg` | one centred row, lower opacity |

## Outputs

- `src/ui/reels/MachinePattern.tsx` — `variant` prop.
- `src/ui/reels/machine-pattern.css` — `--band` and `--on-frame` variant rules.
- `src/ui/App.tsx` — mount in the win band.
- `src/ui/regions/Action.tsx` — mount in the deck (reads the active machine via the same seam
  `Game.tsx` uses, rather than threading a prop purely for decoration).
- `src/ui/regions/regions.css` — positioning contexts; band/deck content raised above the pattern.

## Acceptance

- [x] The win band and control deck both carry the machine's watermark on Whimsy.
- [x] The deck's watermark is visible against its `--color-frame` background.
- [x] **Decoration cannot intercept input** — `elementFromPoint` at the Spin button's centre
      returns the button, and the pattern computes `pointer-events: none`.
- [x] Still opt-in per machine; the other five machines are unchanged. No `src/engine/**` diff.

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing significant; the variant seam was the right
   shape and cost one prop. The thing worth recording is the check I ran rather than assumed:
   putting a decorative layer *behind interactive controls* is the exact setup where a stray
   `pointer-events` or z-index mistake silently kills the primary button. `pointer-events: none`
   was already on the pattern from SPEC-098, but I verified with `elementFromPoint` at the Spin
   button's centre instead of trusting it — a dead Spin button is the worst possible regression in
   this app, and it would pass every existing test.

2. **Does any template, constraint, or decision need updating?** — No. DEC-028's framing and
   DEC-015's config-as-data both cover this; the `variant` prop is an implementation detail. Worth
   noting the watermark now interacts with a *pending* decision: the approved short-viewport fit
   plans to shrink this same win band, and a shorter band means less room for the row of glyphs it
   now holds. The two are compatible (the band's floor is the 39px badge, which still fits one
   row), but they need doing in that order rather than independently.

3. **Is there a follow-up spec I should write now before I forget?** — The short-viewport fit is
   approved and next (SPEC-101): the cabinet is ~693px against Chrome-on-iPhone's ~600px, so Spin
   sits below the fold. Measured facts for that spec: nothing is clipped since SPEC-099, the band's
   hard floor is **39px** (the badge's measured intrinsic height — I had earlier estimated 61px
   from CSS arithmetic and was wrong, which would have led to shrinking the band *less* than it
   safely can go). Still outstanding beyond that: the winning paw-print change, the owner's
   rollout decision for the other five machines, and **no sound on iPhone** — which lands in
   `src/ui/audio/**` and is parked, so it needs an explicit go before anyone touches it.
