---
task:
  id: SPEC-103
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-022
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
    - DEC-028
  constraints:
    - touch-targets-44
    - respect-reduced-motion
    - portrait-first
  related_specs:
    - SPEC-092   # DEC-028's depth language this joins
    - SPEC-068   # the icon-only trigger row
    - SPEC-093   # the switcher arrows, restyled to match

value_link: "The header's icon row joins the cabinet's chrome instead of looking unstyled."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner request — 'can we improve the look of the top row of buttons?'"
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 30000
      estimated_usd: 0.60
      recorded_at: 2026-07-29
      note: >-
        Recessed-key treatment applied from the HEADER side (regions.css) so the parked
        src/ui/audio/audio.css is untouched; switcher arrows matched in machine-switcher.css.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 16000
      estimated_usd: 0.32
      recorded_at: 2026-07-29
      note: >-
        Whimsy + Desert rendered (per-machine bezel confirmed); all four keys measured 48x48;
        short desktop window (1280x700) clipping 0 and Spin above the fold. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 46000
    estimated_usd: 0.92
    session_count: 4
---

# SPEC-103: Header control row visual treatment

## Goal

Owner: *"can we improve the look of the top row of buttons?"* — the four icon triggers (mute /
paytable / record / help) were the last unstyled part of an otherwise-finished cabinet.

## Why they looked unstyled

Each trigger carried a **near-identical rule duplicated across four stylesheets** —
`audio.css`, `paytable.css`, `stats.css`, `help.css` — all `background: transparent` with a
`1px solid var(--color-text-muted)` border. Four generic outlined boxes under a styled marquee,
and four places to change if you wanted them to look like anything.

## The treatment

They become **recessed keys** set into the cabinet face, joining DEC-028's existing
shell → face → well depth language rather than inventing a fifth one:

- fill `--color-bg` (the well colour)
- border `--bezel-width-thin` in `--color-frame` — the machine's own bezel, so all six themes get
  correctly-coloured keys for free
- `--shadow-well`, the same inset used by the reel window and readout
- hover / focus-visible lights the edge to `--color-accent`; `:active` deepens the well

Colour and shadow only — **no transform**, so `respect-reduced-motion` holds by construction.

## Styled from the header side, deliberately

The rules live in `regions.css`, on the grouped selector that already existed for these four
buttons — **not** in their own four stylesheets. Two reasons:

1. **`src/ui/audio/audio.css` is parked.** The mute toggle's own styling lives there, and touching
   the audio directory needs an explicit go. Styling from the header side avoids it entirely.
2. **One place instead of four**, and each component keeps its standalone appearance for any other
   context.

Specificity carries it: `.cabinet__header-controls .mute-toggle` (0,2,0) beats `.mute-toggle` (0,1,0).

## Scope note: the switcher arrows

Restyling only the header row would have left the `◀ ▶` arrows on exactly the transparent/muted
style the header just abandoned — replacing one inconsistency with another. They get the same
treatment. This is slightly beyond "the top row", and is called out rather than slipped in.

## Acceptance

- [x] The four triggers read as cabinet chrome, matching the reel window / readout depth language.
- [x] Per-machine bezel confirmed on Whimsy and Desert — no per-machine code.
- [x] Hit areas measured **48×48** on all four (`touch-targets-44`); labels and behaviour unchanged.
- [x] Short desktop window (1280×700): clipping 0, Spin above the fold — the gap STAGE-021's two
      bugs both hid in.
- [x] `src/ui/audio/**` untouched; no `src/engine/**` diff; no raw hex.

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing about the execution, but the *diagnosis* is
   the transferable part: "these look unstyled" turned out to mean "these are styled four times,
   identically, by default." The duplication was the cause, not a side issue — and the fix that
   avoided the parked directory (style from the parent, once) was also the better design. When a set
   of sibling controls looks generic, check whether each one is carrying its own copy of the same
   rule before reaching for a new visual idea.

2. **Does any template, constraint, or decision need updating?** — No. DEC-028 covered the depth
   language and needed no amendment; this is the fourth thing to adopt it. Worth noting the
   duplication itself is **not fixed**, only bypassed: the four components still each define the old
   transparent style for use outside the header. That is defensible (they are independently
   mountable) but if a fifth trigger is ever added, it will arrive with the same copied rule and
   look wrong in the header until someone adds it to the grouped selector. A shared
   `.icon-trigger` class would fix it properly, and would have to touch `audio.css`.

3. **Is there a follow-up spec I should write now before I forget?** — No new spec. Unchanged and
   still outstanding: the **winning paw-print** change (off-centre + contrasting colour — the oldest
   open request), the **watermark rollout** decision for the other five machines, and **no sound on
   iPhone**, which sits in parked `src/ui/audio/**` and needs an explicit go. STAGE-022 is now
   complete at one spec, which is what starting a fresh stage was for.
