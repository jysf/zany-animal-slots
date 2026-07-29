---
insight:
  id: DEC-028
  type: decision
  confidence: 0.85
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-006
repo:
  id: animal-slots

created_at: 2026-07-29
supersedes: null
superseded_by: null

affected_scope:
  - src/ui/regions/regions.css
  - src/ui/reels/reels.css
  - src/ui/device-frame.css
  - src/styles/tokens.css

tags:
  - presentation
  - layout
  - design-tokens
  - cabinet
---

# DEC-028: Cabinet framing — content-sized shell, inverted depth

## Decision

Give the cabinet a real framing language built entirely from tokens the six machine themes already
define, and make it a **content-sized shell centred in the viewport** rather than a stack stretched
to fill it. Three layers of depth, outside in:

1. **Shell** (`.cabinet`) — bordered in the machine's `--color-frame`, rounded, `overflow: hidden`.
2. **Face** (`.cabinet__game`, `.cabinet__winbanner`) — the lit surface (`--color-surface`),
   deliberately *unbordered*; the band of face visible around the reel window is the bezel.
3. **Wells** (`.reel-grid`, `.cabinet__status`) — dark (`--color-bg`), bezelled, with an inset
   `--shadow-well`. The control deck is the one element that sits *proud* rather than recessed,
   because it is the part you touch.

## Context

Six machines shipped with distinct palettes (PROJ-005), but the shell housing them still looked
like a wireframe. Measured on `main` at 375×812: `.cabinet__game` was `flex: 1` centring a
`max-width: 400px` grid, leaving **~350px of empty space above the reels and ~250px below**;
`.reel-grid` had **no `border` property at all**; `.cabinet__status` had no framing whatsoever; and
`--color-frame` — defined and contrast-checked by every machine — was used only as a background
fill plus a few 1px rules in sheets.

## The two decisions inside this one

### 1. Invert the depth relationship

The reel grid used to be *lighter* (`--color-surface`) than its surroundings (`--color-bg`), which
made the reels read as a **card floating on a page**. Real cabinets are the opposite: a lit face
with a dark window cut into it. Inverting — well on `--color-bg`, cells on `--color-surface` —
is what makes it read as a machine. This flips the symbol backdrop on all six machines, which is
why the change was eyeballed on each rather than trusted to the contrast tests (which cover text
tokens, not emoji).

### 2. Remove the height rather than fill it

The obvious fix for dead space is to grow the reel window into it. **That is not possible here:**
cells are `aspect-ratio: 1` and there are 5 columns, so at 375px the grid is ~200px tall and
filling ~520px would require cells with an aspect ratio near 0.37 — grossly distorted. Since the
height cannot be filled, it has to go. The cabinet became content-sized and `.device-stage` took
over full-height centring on phone — which is exactly what the desktop device frame (SPEC-004) has
always done, so this brings phone in line with desktop rather than inventing a new pattern.

## Alternatives Considered

- **Borders only, no proportion change** — what was literally asked for first. Rejected after
  seeing it rendered: adding a border to the face *outlined the void*, drawing the eye straight to
  the emptiest part of the screen. It made the problem more visible, not less.
- **Border the face as well as the shell and window** — tried; the face border and reel bezel sat
  ~8px apart and read as one doubled line. The face is now deliberately unbordered: the shell frames
  the outside, the window frames the inside.
- **Stretch the reels to fill** — geometrically impossible without distorting cells (above).
- **A heavier "arcade cabinet" treatment** (thick dual-tone bevels, emboss, marquee) — the owner
  chose restraint. Also riskier across six palettes, since heavy chrome fights strongly-coloured
  themes. Not foreclosed; the token layer would support it.

## Consequences

- **Positive:** all six machines get correctly-themed chrome for **zero per-machine code** — the
  bezel is `var(--color-frame)`, which each theme already sets. Verified by real render on all six.
- **Positive:** the dead space is gone on phone, and the desktop frame stopped forcing
  `height: min(92dvh, 880px)` (now `max-height`), which would otherwise have reintroduced on
  desktop exactly what this removed on phone.
- **Negative / accepted:** `overflow: hidden` on `.cabinet` is now load-bearing for the rounded
  corners. Sheet overlays (paytable, trophies, help, changelog) were checked and are **not**
  clipped, but any future overlay that needs to escape the cabinet bounds will be, and will need
  to portal out or live outside `.cabinet`.
- **Negative / accepted:** the win-banner band is reserved height that is empty most of the time.
  It is now tinted as face rather than background so it reads as the top of the face instead of a
  seam splitting the machine — but it is still ~48px of reserved space by design (SPEC-019).
- **Neutral:** three new tokens (`--bezel-width`, `--bezel-width-thin`, `--shadow-well`,
  `--shadow-deck`) follow the existing `--shadow-frame` precedent, keeping `rgba()` out of
  consuming CSS so DEC-010's no-raw-hex rule holds mechanically.

## Validation

Right if the cabinet reads as a machine across all six themes at 375–430px with no dead bands, and
the framing stays token-driven. The contract is `src/styles/cabinet-framing.test.ts`, whose teeth
were checked by five mutations (drop the bezel, drop the well shadow, use a literal `8px` radius,
drop the deck edge, add a transition) — each failed as predicted. Revisit if a future overlay needs
to escape `overflow: hidden`, or if the owner wants the heavier arcade treatment after living with
this one.

## References

- Related specs: SPEC-092 (implements), SPEC-003 (the original four-region layout it reshapes),
  SPEC-004 (the desktop device frame this now matches), SPEC-019 (the win-banner reserved band)
- Related decisions: DEC-010 (tokens, no raw hex), DEC-015 (machine themes are data — unchanged
  here; this only changes how existing tokens are *consumed*), DEC-004 (reduced motion — the
  framing is static by construction, asserted by the contract)
