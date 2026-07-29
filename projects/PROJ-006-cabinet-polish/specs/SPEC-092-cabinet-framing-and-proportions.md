---
task:
  id: SPEC-092
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: M

project:
  id: PROJ-006
  stage: STAGE-020
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-010
    - DEC-015
    - DEC-028
  constraints:
    - portrait-first
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-003   # the original four-region cabinet layout
    - SPEC-048   # useMachineTheme — how per-machine tokens get applied

value_link: "The framing half of STAGE-020 — makes the cabinet shell read as a machine."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: >-
        Designed + built inline: framing is an iterative look-at-it loop against the browser
        preview, so it stayed on the main loop rather than being handed to a subagent. Authored
        DEC-028, STAGE-020, and the PROJ-006 brief.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 96000
      estimated_usd: 1.92
      recorded_at: 2026-07-29
      note: >-
        Four bezel/depth tokens + shell/face/well framing across regions.css, reels.css,
        device-frame.css. Two false starts corrected against real renders (see Reflection):
        bordering the face outlined the void, then bordering face AND window produced a doubled
        ring. cabinet-framing.test.ts (7 contract tests).
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 30000
      estimated_usd: 0.60
      recorded_at: 2026-07-29
      note: >-
        Five guard mutations, each killed by its named input. Real render on ALL SIX machines at
        375px plus desktop at 1280px; paytable sheet checked against the new overflow:hidden and
        is not clipped; spin verified; no console errors. Full gate green (1030 tests).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 126000
    estimated_usd: 2.52
    session_count: 4
---

# SPEC-092: Cabinet framing + proportions

## Goal

Make the cabinet shell read as a **machine** rather than a wireframe, using only the tokens the six
machine themes already define. Two halves, one spec because they are the same visual problem:

1. **Framing** — one bezel language applied to the reel window, the readout, and the control deck.
2. **Proportions** — stop the reels floating in ~600px of dead vertical space at 375px.

Presentation only: no engine change, no machine math change, no machine theme *value* change.

## The problem (measured on `main` at 375×812)

- `.cabinet__game` is `flex: 1` centring a `max-width: 400px` grid → **~350px empty above the reels
  and ~250px below**. The reels float in a void.
- `.reel-grid` has **no `border` property at all** — background + radius only. The visible edge is
  purely surface-vs-bg contrast.
- `.cabinet__status` (balance / bet / win) has **no framing whatsoever** — floating text on a fill.
- `.cabinet__action` is a full-bleed solid `--color-frame` slab with **no top edge**.
- `--color-frame` is defined by all six themes and contrast-checked, but used only as a *background*
  fill plus a few 1px `border-top` rules in sheets.

## The approach: invert the depth relationship

Today the reel grid is *lighter* (`--color-surface`) than its surroundings (`--color-bg`), which is
backwards — it makes the reels read as a card floating on a page. Real cabinets are the opposite: a
**lit face** with a **recessed dark window** cut into it.

So `.cabinet__game` becomes the machine's **face** (`--color-surface`), and `.reel-grid` becomes a
**recessed well** (`--color-bg`, bezelled with `--color-frame`, inset shadow) set into that face.

> **Corrected during build.** This section originally proposed *framing* the face and letting it
> fill the region, on the theory that the leftover height would stop reading as void once it was
> visibly cabinet. Rendered, that was wrong twice over — see `## Reflection`. What shipped:
> the face is **unbordered** (the shell frames the outside, the window frames the inside), and the
> leftover height is **removed** rather than absorbed, because square cells at 5 columns cannot
> fill it without gross distortion. Recorded in DEC-028.

## Outputs

- `src/styles/tokens.css` — new bezel/inset tokens (complete `box-shadow` values, following the
  existing `--shadow-frame` precedent that keeps `rgba()` out of consuming CSS).
- `src/ui/regions/regions.css` — game region as the cabinet face; status as a recessed readout
  panel; action deck given a defined top edge.
- `src/ui/reels/reels.css` — reel window bezel + inset well.
- `src/styles/cabinet-framing.test.ts` — the contract below.
- `decisions/DEC-028-cabinet-framing.md`.

## Failing Tests

Written during design, made to pass during build. CSS is verified as source text — jsdom cannot
resolve `var()`, which is the established pattern here (`src/styles/layout.test.ts`).

1. **Bezel tokens exist.** `tokens.css` defines `--bezel-width`, `--shadow-well` and `--shadow-deck`.
2. **The reel window is bezelled with the machine's frame colour.** `reels.css` contains a `border`
   declaration whose value references `var(--color-frame)` — not merely a `background-color`.
3. **The reel window is a recessed well.** `reels.css` applies `var(--shadow-well)`.
4. **The readout is framed.** `regions.css` gives `.cabinet__status` both a `border` referencing a
   colour token and a `border-radius` token.
5. **The control deck has a defined top edge.** `regions.css` gives `.cabinet__action` a
   `border-top`.
6. **No raw hex, no raw px radii** in any of the three touched CSS files (DEC-010) — radii come from
   `--radius-*` tokens so there is one scale.
7. **Reduced motion is untouched.** None of the new rules introduce a `transition` or `animation`
   (framing is static; constraint `respect-reduced-motion` stays satisfied by construction).

## Acceptance

- [x] The reel window reads as a recessed, bezelled window set into a lit cabinet face.
- [x] No large empty bands above/below the reels at 375px — the region is visibly cabinet, not void.
- [x] The readout reads as a display panel; the control deck has a defined edge.
- [x] Verified by **real render on all six machines** — each machine's own `--color-frame` drives
      its bezel, so the treatment is per-machine for free.
- [x] `src/styles/contrast.test.ts` still green; 44px targets unaffected; no `src/engine/**` diff;
      `src/ui/audio/**` untouched.

## Implementation Context

**Tokens, not literals (DEC-010).** `--shadow-frame` is the precedent: the complete `box-shadow`
value including its `rgba()` lives in `tokens.css`, so consuming CSS carries no colour literal. New
shadow tokens must follow that exactly, or test 6 fails.

**The bezel colour is already per-machine.** Every machine defines `--color-frame` and
`useMachineTheme` (SPEC-048) applies the theme on `.device-stage`. Using `var(--color-frame)` for
the bezel means all six machines get correctly-themed chrome with no per-machine code — that is the
whole reason this is cheap.

**Do not touch `src/ui/audio/**`** (parked) and do not change any machine's theme *values* — a
palette is data (DEC-015). This spec only changes how existing tokens are *consumed*.

**Watch the inversion.** Swapping `.reel-grid` from `--color-surface` to `--color-bg` changes the
symbol backdrop on all six machines. The contrast tests cover text tokens, not emoji, so this needs
an eyeball on each machine — Diner's warm palette and Arctic's pale one are the likeliest to
surprise.

## Guard Mutations

Each prescribed mutation ships with the input that kills it. All five run at verify; all five failed
as predicted, and the suite returned green on restore.

| # | Mutation | Killed by |
|---|---|---|
| 1 | Drop `border: var(--bezel-width) solid var(--color-frame)` from `.reel-grid` | test 2 — a `background-color` alone must not satisfy "bezelled" |
| 2 | Drop `box-shadow: var(--shadow-well)` from `.reel-grid` | test 3 — the window is flat, not recessed |
| 3 | `.cabinet__status` radius as a literal `8px` instead of `var(--radius-md)` | tests 4 **and** 6 — 2 failures; this is the one that guards the single radius scale |
| 4 | Drop `border-top` from `.cabinet__action` | test 5 — the deck loses its defined edge |
| 5 | Add `transition: all 200ms` to `.cabinet__game` | test 7 — framing must stay static (`respect-reduced-motion`) |

## Reflection (Ship)

1. **What would I do differently next time?** — Look at the render *before* writing the approach,
   not after. The design section proposed framing the cabinet face and letting it fill the region,
   and both halves of that were wrong in ways a single screenshot would have shown:
   (a) **Bordering the face outlined the void.** Drawing a frame around the empty region made the
   emptiness *more* prominent — it turned an ignorable gap into a deliberate-looking box containing
   nothing. (b) **Then bordering the face *and* the window produced a doubled ring**, because once
   the face hugged the window the two borders sat ~8px apart and read as one thick sloppy line.
   The general lesson: **for visual work, a proposed treatment is a hypothesis, and the render is
   the test.** I ran three renders to converge; the first would have redirected the design if I had
   taken it before committing to prose.

2. **Does any template, constraint, or decision need updating?** — No template or constraint change.
   One thing worth flagging beyond this spec, recorded in DEC-028: `overflow: hidden` on `.cabinet`
   is now **load-bearing** for the rounded corners. Every existing sheet overlay was checked and none
   is clipped, but any *future* overlay that needs to escape the cabinet bounds will be, and will
   have to portal out or live outside `.cabinet`. That is a trap worth knowing about before someone
   spends an hour debugging a half-visible modal.

3. **Is there a follow-up spec I should write now before I forget?** — SPEC-093 (the switcher) is
   already written and is next; it deliberately lands *after* this one so the machine name is
   promoted into a header that already has its final treatment. Two smaller things I am explicitly
   *not* spec'ing: the win-banner's ~48px reserved band is still empty most of the time (it is now
   tinted as face so it reads as the top of the face rather than a seam, which is enough), and the
   heavier "arcade cabinet" treatment the owner declined remains available — the token layer would
   support it without restructuring. Still open and unchanged: the real-iPhone Safari check, which
   this spec makes *more* important, since layout and framing both moved.
