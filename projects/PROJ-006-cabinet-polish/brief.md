---
project:
  id: PROJ-006
  status: active
  priority: medium
  target_ship: null

repo:
  id: animal-slots

created_at: 2026-07-29
shipped_at: null

value:
  thesis: >-
    The game now has six machines with genuinely different math, but the cabinet housing them
    still looks like a wireframe: the reels float in ~600px of dead space, the reel window has
    no border at all, and the four layout regions share no visual language. PROJ-006 makes the
    shell look like a MACHINE — token-driven framing that adapts to all six palettes — and
    replaces the cramped <select> machine switcher with a switcher that gives the machine name
    a real home. Presentation only: no engine change, no math change.
  beneficiaries:
    - "Players — a game that looks finished, and a machine switcher that isn't a truncated dropdown."
    - "Owner — the six machine themes finally get to show off; each palette's --color-frame becomes visible."
    - "Template maintainer — a first exercise of the template on pure presentation polish, where 'done' is a judgement call rather than a measured number."
  success_signals:
    - "The reel window, readout, and control deck share one framing language, driven by per-machine tokens (no raw hex, DEC-010)."
    - "The cabinet fills the phone as one unit — no large empty bands above/below the reels at 375px."
    - "Switching machines is a prev/next control with the machine name promoted to the header marquee; the controls row drops from 5 items to 4."
    - "All six machine themes still pass the contrast tests; reduced-motion and 44px touch targets unaffected."
  risks_to_thesis:
    - "Chrome is taste, not measurement — 'nicer' can't be asserted by a test, so this project leans on real renders and the owner's eye more than any prior one."
    - "Framing tuned against one palette can look wrong on the other five; every change must be checked across all six."
    - "Replacing a native <select> with custom controls risks losing keyboard/screen-reader behaviour that came free."
---

# PROJ-006: Cabinet polish

## What This Project Is

A presentation-only wave over the cabinet shell: give the machine real framing, close the dead
vertical space so it reads as a single unit, and replace the machine `<select>` with a prev/next
switcher that gives the machine name a proper home in the UI. Nothing in `src/engine/**` moves;
no machine's math or theme values change.

## Why Now

The owner looked at the shipped game and said, in effect, it doesn't look like a machine yet — and
they were right for reasons the CSS confirms:

- `.cabinet__game` is `flex: 1` centring a `max-width: 400px` grid, so on a 375×812 phone the reels
  float in roughly **350px of empty space above and 250px below**.
- `.reel-grid` has **no border at all** — just a background and a radius. The faint edge visible
  today is only surface-vs-bg contrast. A slot machine's reel window should be its *most* framed
  element; here it is the least.
- **`--color-frame` is nearly unused.** All six machine themes define it and it is contrast-checked,
  but it appears only as a background fill on the action bar and as some 1px `border-top` rules in
  sheets. It is the obvious bezel colour, already per-machine, sitting idle.
- The four regions (header / game / status / action) use **four unrelated treatments**, which is
  what reads as "untightened".
- The machine `<select>` is squeezed into a five-item header row and truncates to "Wild & Whi⌄".

Six machines now exist and each has its own palette; this is the wave that lets them show.

## Success Criteria

- The cabinet reads as one machine at 375–430px: framed reel window, readout as a recessed display
  panel, control deck with a defined edge, one consistent radius scale.
- No large dead bands above/below the reels.
- Machine switching is prev/next arrows with the name promoted to the header marquee line.
- All six themes verified by real render; contrast tests green; `touch-targets-44` and
  `respect-reduced-motion` unaffected.

## Scope

### In scope
- `src/ui/regions/**`, `src/ui/reels/reels.css`, `src/ui/machine/**`, `src/styles/tokens.css`.
- Framing, spacing, radii, and the switcher component.

### Explicitly out of scope
- **`src/ui/audio/**`** — the audio-quality overhaul is parked; do not touch.
- Any change to engine, machine math, or machine theme *values* (a machine's palette is data).
- The ad system, trophies, paytable, and stats sheets beyond what shared tokens change implicitly.

## Stage Plan

- [x] STAGE-020 (shipped 2026-07-29) — **Cabinet chrome + switcher**: SPEC-092 (framing +
  proportions), SPEC-093 (switcher arrows + marquee). DEC-028.
- [x] STAGE-021 (shipped 2026-07-29) — **Naming + header layout**: SPEC-095…102. Planned as two
  specs, shipped as eight (incl. two bug fixes for defects the work introduced) — every addition
  came from the owner using the previous result on a device we had not tested.
- [x] STAGE-022 (shipped 2026-07-29) — **Header controls polish**: SPEC-103. One spec, as scoped.

**Count:** 3 shipped / 0 active / 0 pending

The project stays **active**: the roadmap below still holds owner-originated work. It is between
stages, not finished.

The project stays **active**: the roadmap below holds real, owner-originated work (the picker
sheet, and a possible chrome revisit). It is between stages, not finished.

## Roadmap (deferred)

- **A heavier chrome pass.** The owner's verdict on SPEC-092's framing was *"could be nicer, but I
  think this is ok"* — a pass, not a win. They chose restraint over the "full arcade cabinet"
  option (thick dual-tone bevels, pronounced emboss, a marquee header treatment) when offered it.
  The token layer added in DEC-028 supports going heavier **without restructuring** — it is a
  CSS-only revisit whenever they want it. Worth asking what specifically reads flat before
  spending: a named complaint is a far cheaper pass than guessing.
- **The winning paw-print** — move it off-centre and give it a colour that contrasts the cell.
  Requested during STAGE-021 and **still not started**; it is the oldest open request in this
  project. The monochrome technique proved in SPEC-098 is exactly what it needs, since the paw is
  also an emoji (`🐾`) and so ignores `color`.
- **Watermark rollout** — SPEC-098's watermark is enabled on Whimsy only, pending the owner's
  verdict after living with it. Each additional machine is a one-line `pattern: true`.
- **No sound on iPhone** — owner-reported. The game is muted by default (DEC-025) and iOS routes
  Web Audio through the ringer switch, so it may not be a defect at all. Any real fix lands in
  **parked `src/ui/audio/**`** and needs an explicit go.
- **Machine picker sheet** (SPEC-094, planned not built) — tap the machine name to open a sheet
  listing all six with their palettes and reel symbols, like the existing Paytable/Stats sheets.
  The owner explicitly asked to *plan* for this while shipping the arrows first. It becomes the
  right answer once the roster outgrows comfortable stepping (~8+ machines) or once players want
  random access rather than browsing. Arrows and a picker are not exclusive — the sheet would open
  *from* the marquee name the arrows sit either side of.

## Dependencies

### Depends on
- PROJ-002 (shipped) — the machine registry, selector seam, and per-machine theme tokens.
- PROJ-005 (shipped) — six machines with distinct palettes are what make the framing worth doing.

### Enables
- The machine picker sheet, and any future theme work that wants a real chrome layer to hang on.

## Project-Level Reflection

*Filled in when status moves to shipped.*
