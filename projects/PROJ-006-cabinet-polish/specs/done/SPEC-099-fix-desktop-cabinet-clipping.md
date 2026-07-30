---
task:
  id: SPEC-099
  type: bug
  cycle: ship
  blocked: false
  priority: high
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
    - SPEC-092   # introduced the overflow:hidden half of the bug
    - SPEC-097   # the band alignment this widens on desktop

value_link: "Fixes a bug that made the Spin button unreachable on short desktop windows."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner-reported bug, reproduced and measured in the browser."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 30000
      estimated_usd: 0.60
      recorded_at: 2026-07-29
      note: >-
        Removed the desktop max-height cap; stage centres via flex-start + auto block margins so
        it scrolls instead of clipping. Introduced --band-inset so the shared band edge is one
        token, widened on desktop for corner-radius clearance.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000
      estimated_usd: 0.28
      recorded_at: 2026-07-29
      note: >-
        Re-measured at the failing size (1280x700): clipping 67px → 0, Spin inside the cabinet,
        full cabinet reachable by page scroll. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 44000
    estimated_usd: 0.88
    session_count: 4
---

# SPEC-099: Fix desktop cabinet clipping (Spin button unreachable)

## The bug

Owner: *"the bottom buttons are half off the screen"* on desktop.

Reproduced and measured at **1280×700**: the cabinet clipped **67px** of its own content, and the
**Spin button — the game's primary control — was below the cabinet's bottom edge and unreachable,
with no scrollbar to reveal it.**

Three of my own changes combined to cause it, none wrong alone:

1. **SPEC-092** made `.cabinet` content-sized and gave it `overflow: hidden` (needed so the rounded
   corners clip the flush region fills).
2. **SPEC-004's** desktop `max-height: min(92dvh, 880px)` survived, from when the cabinet was
   viewport-height and the cap was cosmetic.
3. `overflow: hidden` + a max-height shorter than the content = **silent truncation**. Not a
   scrollbar, not a squash — the bottom of the machine simply stops existing.

Severity is the point: this isn't cosmetic. On any desktop window under ~795px tall the game was
**unplayable**, and nothing in the test suite could see it because it is a pure layout interaction.

## The fix

- **Remove the desktop `max-height` cap.** It only made sense when the cabinet was viewport-height;
  against content-sizing it can only ever clip.
- **Make the stage scroll rather than clip.** `align-items: center` centres *and* clips overflow, so
  the stage now uses `align-items: flex-start` + `margin-block: auto` on the cabinet — centred when
  it fits, scrollable when it doesn't. The desktop block no longer re-sets `align-items`, which was
  overriding the base rule.
- **`--band-inset` token.** SPEC-097's "every band shares one edge" was five rules that had to be
  hand-synced; it is now one token. Widened to `--space-5` on desktop, where the frame's 40px
  corner radius curves away from edge-aligned controls and made them look like they were colliding
  with the rounding.

## Acceptance

- [x] At 1280×700: clipping **67px → 0**; Spin inside the cabinet; whole cabinet reachable by scroll.
- [x] Desktop controls clear the corner radius (`--band-inset` 24px vs 12px on phone).
- [x] SPEC-097's single-edge invariant preserved — now enforced by one token, not five rules.
- [x] Phone layout unchanged; full gate green; no `src/engine/**` diff.

## Reflection (Ship)

1. **What would I do differently next time?** — When a spec changes *how an element is sized*, audit
   every existing rule that constrains that element. SPEC-092 flipped the cabinet from
   viewport-height to content-sized and I updated the desktop `height` to `max-height` — I saw the
   rule, touched it, and still left a cap that only made sense under the old model. The question I
   skipped: *"this constraint was written for a different sizing model — does it still mean
   anything?"* Changing `height` to `max-height` felt like handling it; it actually preserved the
   bug in a quieter form.

2. **Does any template, constraint, or decision need updating?** — No template change, but a real
   gap worth naming: **the whole PROJ-006 stage has verified layout by rendering at 375px and
   430px, and this bug lived entirely outside that range.** Desktop got a single glance in SPEC-092
   at one viewport height that happened to be tall enough. `portrait-first` legitimately makes
   phone primary, but "primary" is not "only" — a clipped Spin button is a broken game wherever it
   happens. Worth checking a *short* desktop window whenever cabinet sizing changes; that is where
   this class of bug lives.

3. **Is there a follow-up spec I should write now before I forget?** — No new spec. Still
   outstanding and unchanged: the winning paw-print change (off-centre + contrasting colour), the
   owner's decision on rolling the SPEC-098 watermark out to the other five machines, and the
   real-device Safari check — which this bug makes more pressing, since it demonstrates that
   viewport-dependent breakage in this cabinet is real and invisible to the suite.
