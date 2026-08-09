---
task:
  id: SPEC-105
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-023
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-004
    - DEC-010
  constraints:
    - respect-reduced-motion
    - portrait-first
  related_specs:
    - SPEC-023   # the original paw-print trail
    - SPEC-098   # the monochrome-emoji technique this reuses
    - SPEC-101   # emoji ink-box slack

value_link: "The win marker stops covering the symbol you just won with."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner — 'the paw-print is not the worst, it just doesn't look good.'"
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 24000
      estimated_usd: 0.48
      recorded_at: 2026-07-29
      note: >-
        Paw moved to the cell's bottom-right and rendered as a --color-jackpot silhouette via the
        SPEC-098 technique. Pop animation and reduced-motion path preserved.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000
      estimated_usd: 0.28
      recorded_at: 2026-07-29
      note: >-
        Drove a real win on Diner (won on spin 4, 6 paws rendered) and inspected it — symbols stay
        fully visible, paws read as light silhouettes. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 38000
    estimated_usd: 0.76
    session_count: 4
---

# SPEC-105: Winning paw-print polish

## Goal

Owner: *"the paw-print is not the worst, it just doesn't look good."* Move it off-centre and give it
a colour that contrasts the cell — the oldest open request in this project.

## What was actually wrong

The paw sat at `inset: 0`, flex-centred, in **full colour** — so on a win, a 🐾 was plastered
directly over the symbol you had just matched. The marker obscured the thing it was celebrating.
That is the real defect; "doesn't look good" was the symptom.

## The fix

- **Off-centre:** `inset: auto var(--space-1) var(--space-1) auto` — tucked into the cell's
  bottom-right, clear of the symbol.
- **Contrasting colour:** the paw is an emoji, so `color` does nothing to it. Same technique as the
  watermark (SPEC-098): `color: transparent` + a zero-blur `text-shadow` paints its silhouette in
  `--color-jackpot`, the lightest token in every machine's palette. Hard contrast against the cell's
  `--color-surface` fill, **per-machine and for free**.
- Smaller (`--font-size-lg`) and `line-height: 1.4` so the emoji's ink box isn't shaved — SPEC-101's
  lesson applied pre-emptively rather than after a bug.
- Pop animation and the `prefers-reduced-motion` path are unchanged.

## Acceptance

- [x] The paw no longer overlaps the symbol; winning symbols stay fully readable.
- [x] Rendered as a flat, light silhouette that contrasts the cell on every machine.
- [x] Verified on a **real win** (driven on Diner — won on spin 4, six paws rendered), not a mock.
- [x] Reduced-motion path intact; no `src/engine/**` diff.

## Reflection (Ship)

1. **What would I do differently next time?** — Treat "doesn't look good" as a symptom and go find
   the mechanism. The paw wasn't ugly because of its colour; it was ugly because it **covered the
   symbol you just won with** — a celebration marker hiding the thing being celebrated. Recolouring
   alone would have produced a prettier version of the same mistake. Worth asking, on any vague
   aesthetic complaint: *what is this element doing wrong functionally?*

2. **Does any template, constraint, or decision need updating?** — No. Notable that this spec reused
   two lessons from earlier in the project without rediscovering either: the monochrome-emoji
   technique (SPEC-098) and the ink-box slack (SPEC-101, applied up front rather than after a bug).
   That is the value of having written them down in specs rather than just fixing and moving on.

3. **Is there a follow-up spec I should write now before I forget?** — No. This was the last open
   visual item, so **STAGE-023 and PROJ-006 can both close**. The project ship must include a
   `RELEASES.md` player-facing entry (PROJ-006 has none and is the most player-visible wave since
   the Trophy Case), a project reflection, and explicit resolutions for the two dangling roadmap
   items — the picker sheet (SPEC-094) and the heavier chrome pass. The no-sound-on-iPhone report
   goes to the next project's backlog by the owner's call.
