---
task:
  id: SPEC-102
  type: story
  cycle: ship
  blocked: false
  priority: high
  complexity: M

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
    - DEC-019
    - DEC-028
  constraints:
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-092   # content-sized cabinet, which is why nothing responded to height
    - SPEC-099   # stopped the clipping; this stops the scrolling
    - SPEC-019   # the win band whose floor is the badge height

value_link: "The cabinet fits short viewports instead of pushing Spin below the fold."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: >-
        Main-loop. Owner revisited an earlier decision after using it: they had declined shrinking
        the reels, then reported "if I shrink the screen it doesn't adjust and I need to scroll".
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 46000
      estimated_usd: 0.92
      recorded_at: 2026-07-29
      note: >-
        Short-viewport trims (~80px) via a --reel-chrome / --band-inset override, plus a
        height-derived cap on the reel window's max-width so cell size follows available height.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 20000
      estimated_usd: 0.40
      recorded_at: 2026-07-29
      note: >-
        Measured at 700/600/560/480px tall: cells scale 60 → 60 → 51 → 32px, Spin stays above the
        fold down to ~530px. Below that the 200px grid floor holds and it scrolls (documented,
        not silent). Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 66000
    estimated_usd: 1.32
    session_count: 4
---

# SPEC-102: Adaptive cabinet height

## Goal

Owner: *"if I shrink the screen it doesn't adjust and I need to scroll."*

SPEC-099 stopped the cabinet **clipping** its controls; it still didn't **shrink**. Nothing inside a
content-sized cabinet (SPEC-092) responded to viewport height, so a short window just scrolled and
Spin fell below the fold.

## A reversed decision, recorded

When offered options earlier the owner chose *reclaim the empty win band* over *shrink the reels*.
Then, having used the result, they revisited it — the band trim alone buys ~80px, which covers
Chrome-on-iPhone (~600px) and nothing beyond. This spec therefore does **both**: the trims *and* the
reel scaling they had previously declined. Recorded because the earlier choice was reasonable on the
information available; using the thing is what changed it.

## The mechanism

Cells are `aspect-ratio: 1` in five `1fr` columns, so **the grid's height is a function of its
width** — capping the width is the only way to cap the height:

```css
max-width: min(400px, max(200px, calc((100dvh - var(--reel-chrome)) * 5 / 3)));
```

- `5 / 3` converts an available height back into the width that produces it (5 columns, 3 rows).
- `--reel-chrome` is everything else in the cabinet, **measured** (465px normally, 385px after the
  short-viewport trims) rather than guessed.
- `max(200px, …)` is a deliberate floor: below it the symbols stop being readable, so the cabinet
  scrolls instead of shrinking further.

## Measured behaviour

| Viewport height | Cell size | Spin above the fold? |
|---|---|---|
| 844px | 60px | ✅ |
| 700px | 60px | ✅ |
| 600px | 60px | ✅ |
| 560px | **51px** | ✅ |
| 480px | **32px** (floor) | ❌ — scrolls |

Adapts cleanly from full size down to **~530px** of viewport height. Below that the floor holds and
it scrolls.

## Honest correction to what was promised

The option I put in front of the owner previewed *"no scrolling at any height."* That is **not** what
this delivers — it is no scrolling down to ~530px, then a readability floor. Shrinking the reels
without limit would technically remove scrolling at every height while making the game unplayable,
which is not what anyone wanted. Stating the real range rather than the pitched one.

## Acceptance

- [x] Cell size follows available height; Spin stays above the fold down to ~530px tall.
- [x] Short-viewport trims recover ~80px before the reels shrink at all, so common phone sizes never
      lose reel size.
- [x] The win band's floor is the **measured** 39px badge, so no win-time layout shift (SPEC-019).
- [x] Full gate green; no `src/engine/**` diff; audio untouched.

## Reflection (Ship)

1. **What would I do differently next time?** — Put the trade-off's *limits* in the option I offer,
   not just its upside. "No scrolling at any height" was the outcome I wanted to be true, and I
   wrote it into a preview the owner then chose from; the real answer always had a readability floor,
   and I knew reels can't shrink indefinitely. An option's preview is a commitment, and mine
   overstated by omission.

2. **Does any template, constraint, or decision need updating?** — No, but `--reel-chrome` is worth
   flagging as a **maintenance hazard**: it is a hard-coded measurement of everything else in the
   cabinet, so any future band added or resized silently makes the height math wrong (the reels
   would be sized against a stale chrome figure). It is commented as measured, and the failure is
   graceful — slightly wrong reel size, not breakage — but a later spec that changes cabinet
   structure must re-measure it. The alternative (a JS ResizeObserver) would be self-maintaining
   but adds runtime cost and a DOM dependency to something CSS can express.

3. **Is there a follow-up spec I should write now before I forget?** — Still outstanding, none of it
   started: the **winning paw-print** change (off-centre + contrasting colour), the owner's decision
   on rolling the watermark out to the other five machines, **no sound on iPhone** (parked
   `src/ui/audio/**`, needs an explicit go), and a fresh request to **improve the look of the header's
   top row of buttons**. STAGE-021 has now absorbed six specs against an original backlog of two —
   worth closing it and opening a fresh stage rather than letting it keep growing.
