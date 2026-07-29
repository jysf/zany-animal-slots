---
task:
  id: SPEC-096
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
    - SPEC-093   # the switcher this relocates
    - SPEC-082   # the centred-title header this restores

value_link: "Puts the app title back and moves the machine control into the thumb zone."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner-directed layout change made interactively against the preview."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 40000
      estimated_usd: 0.80
      recorded_at: 2026-07-29
      note: >-
        Header restores the app title <h1>; MachineSwitcher moves from the header to between
        Status and Action in App.tsx and stops being an <h1> (span + aria-live). Switcher band
        tinted as cabinet face. Tests updated + a new single-h1 guard.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 16000
      estimated_usd: 0.32
      recorded_at: 2026-07-29
      note: >-
        Real render at 375px: title back in the header, switcher between the readout and the
        control deck, stepping still works from its new home, exactly one h1 in the live DOM.
        Full gate green (1038 tests); no console errors.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 56000
    estimated_usd: 1.12
    session_count: 4
---

# SPEC-096: Restore the app title; relocate the machine switcher

## Goal

Owner's direction after living with SPEC-093: *"can we move the machine control between the balance
line and the spin button line. bring back the old title."*

- The app title (`🎰 Zany Animal Slots 🎰`) returns as the header's headline.
- The machine switcher moves out of the header to sit **between the readout and the control deck**.

## Why this is right

SPEC-093 promoted the machine name *into* the title slot, which solved the truncation problem but
cost the app its identity in its own header — the product's name vanished from the product. Moving
the switcher down fixes that **and** improves the control: it now sits beside the other things you
press (bet ±, Spin, Auto, Reset) rather than up in the passive branding area, which on a phone means
it lands in the thumb zone.

## Outputs

- `src/ui/regions/Header.tsx` — restore the title `<h1>`; drop the switcher.
- `src/ui/App.tsx` — render `<MachineSwitcher />` between `<Status>` and `<Action>`.
- `src/ui/machine/MachineSwitcher.tsx` — the name is a `<span>`, not an `<h1>`.
- `src/ui/machine/machine-switcher.css` — the switcher is its own band, tinted as cabinet face.
- `src/ui/App.test.tsx`, `MachineSwitcher.test.tsx` — updated + a new single-`h1` guard.

## Failing Tests

1. The header's heading is the app title again (`/animal slots/i`).
2. **Exactly one `<h1>` in the document** — the specific bug this refactor could introduce.
3. The switcher renders the machine name but **not** as a heading.
4. Stepping, wrap-around, keyboard, and `aria-live` all still pass from the new location.

## Acceptance

- [x] App title is back in the header; switcher sits between the readout and the spin controls.
- [x] Exactly one `<h1>`; the machine name keeps its `aria-live` announcement.
- [x] Arrows still ≥44px; no raw hex; no `src/engine/**` diff; `src/ui/audio/**` untouched.

## Guard Mutations

| # | Mutation | Killed by |
|---|---|---|
| 1 | Render the switcher name as `<h1>` again (the SPEC-093 shape) | test 2 — two `<h1>`s in the document |
| 2 | Remove the title `<h1>` from the header | test 1 — the header has no heading |

## Implementation Context

**Two `<h1>`s is the trap.** SPEC-093's switcher *was* the page's `<h1>`. Restoring the header title
without demoting the switcher's name would leave two top-level headings — valid HTML, broken
document structure, and invisible in a screenshot. Test 2 exists precisely because this is the
regression a future "let's promote the machine name again" would reintroduce.

**`aria-live` survives the move.** It is the screen-reader announcement inherited from the original
`<select>` (SPEC-093); it lives on the name element, not the heading, so demoting the element does
not cost it.

## Reflection (Ship)

1. **What would I do differently next time?** — Ask where a promoted element should *live* before
   promoting it. SPEC-093 put the machine name in the title slot because that was the most
   prominent place available, and I never questioned whether the app title should be the thing
   displaced. The owner's correction — control near the controls, title in the title — is more
   obvious in hindsight than it was in the moment, and it is the kind of thing a single sketch of
   the whole cabinet would have surfaced before any code. I optimised the *name's* prominence
   without weighing what it evicted.

2. **Does any template, constraint, or decision need updating?** — No. Worth noting that this makes
   three consecutive specs in PROJ-006 where the owner's reaction to a shipped result changed the
   next one (framing → "could be nicer"; switcher → rename; switcher → relocate). That is the
   project working as intended for taste-driven work, not churn: `risks_to_thesis` in the brief
   already called out that "'nicer' can't be asserted by a test, so this project leans on real
   renders and the owner's eye more than any prior one."

3. **Is there a follow-up spec I should write now before I forget?** — Yes, already requested and
   queued as SPEC-097: move the winning paw-print off-centre and give it a colour that contrasts the
   cell. Worth flagging up front that the paw is currently the 🐾 **emoji**, whose colour is baked
   into the font glyph — "make it a contrasting colour" therefore requires replacing it with a
   shape that accepts a token, not a CSS `color` change. That is a real design decision hiding
   inside a small-sounding request.
