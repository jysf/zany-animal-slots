---
task:
  id: SPEC-101
  type: bug
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
  constraints:
    - portrait-first
  related_specs:
    - SPEC-098   # introduced the watermark and the wrap
    - SPEC-100   # extended it to the slim bands

value_link: "Fixes half-sliced watermark glyphs — the decoration now renders cleanly at any width."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner-reported on DuckDuckGo/macOS, reproduced by measurement at 3 widths."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 32000
      estimated_usd: 0.64
      recorded_at: 2026-07-29
      note: >-
        Replaced flex-wrap with EXPLICIT non-wrapping rows (2 for the face, 1 for slim bands),
        8 glyphs per row sized to fit the narrowest supported width. Added block padding +
        line-height 1.4 so the emoji ink box isn't shaved by overflow:hidden.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000
      estimated_usd: 0.28
      recorded_at: 2026-07-29
      note: >-
        Measured overhang against the clip box at 320/375/430px: 12-of-36 sliced → 0-of-32, worst
        overhang 0px. Full gate green (1038).
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

# SPEC-101: Fix watermark glyph clipping

## The bug

Owner: *"on duckduckgo browser on mac the watermark roles over and doesn't look right."*

Reproduced by measurement — and it was **not** browser-specific. At 320px, 375px **and** 430px,
**12 of 36 glyphs** sat outside the pattern's clip box and were sliced in half by
`overflow: hidden`. DuckDuckGo simply gave a window size where the half-glyphs were obvious.

**Two distinct causes, found in that order:**

1. **`flex-wrap` made the row count depend on container width.** SPEC-098 tiled a fixed 36 glyphs
   and let them wrap; in a box with room for ~2 rows, a third row landed straddling the boundary.
   This is the severe one — whole glyphs cut through the middle.
2. **Emoji ink boxes are taller than their line box.** Measured ~24–30px of ink for a 20–25px font.
   Even with the rows fixed, the top and bottom face rows sat flush against the clip edge and lost
   2–3px off each glyph.

## The fix

- **Explicit non-wrapping rows** instead of wrap: 2 for the cabinet face (one per visible strip
  around the reel window), 1 for slim bands. Layout is now deterministic and width-independent.
- **8 glyphs per row**, chosen to fit the *narrowest* supported cabinet (320px) without overflowing,
  so a row can never clip horizontally either. Denser would look better at 430px and spill at 320px.
- **Block padding + `line-height: 1.4`** so the emoji ink box fits inside the clip box.

## Acceptance

- [x] **0 clipped glyphs** at 320 / 375 / 430px (was 12-of-36); worst overhang 0px.
- [x] Row count no longer depends on container width.
- [x] Rows stay deterministic across re-renders; still `pointer-events: none` and `aria-hidden`.
- [x] No `src/engine/**` diff; still opt-in per machine.

## Reflection (Ship)

1. **What would I do differently next time?** — Not reach for `flex-wrap` when the container has a
   *fixed* number of rows to fill. Wrap is for content whose length you don't control; here I knew
   exactly how many rows I wanted (two strips of visible face), and wrapping made the outcome a
   function of width — the one variable guaranteed to differ across the devices this is viewed on.
   The tell I ignored in SPEC-098: I picked `count = 36` by eye until it *looked* right at one
   width, which is fitting a constant to a single sample.

2. **Does any template, constraint, or decision need updating?** — No. But a reusable fact worth
   carrying: **emoji ink boxes overflow their line boxes.** Any emoji inside `overflow: hidden`,
   or measured for layout, needs slack — `line-height: 1` will shave it. That cost two rounds here
   and is invisible in code review.

3. **Is there a follow-up spec I should write now before I forget?** — SPEC-102 is next and
   approved: the cabinet should genuinely adapt to viewport height rather than scrolling. The owner
   revisited their earlier choice after seeing that shrinking a desktop window doesn't adjust, so it
   now includes scaling the reels — which they had previously declined. Also still outstanding: the
   winning paw-print change, the rollout decision for the other five machines, and **no sound on
   iPhone**, which is in parked `src/ui/audio/**` and needs an explicit go.
