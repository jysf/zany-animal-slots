---
project:
  id: PROJ-006
  status: shipped
  priority: medium
  target_ship: null

repo:
  id: animal-slots

created_at: 2026-07-29
shipped_at: 2026-07-29

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
- [x] STAGE-023 (shipped 2026-07-29) — **Watermark rollout + paw polish**: SPEC-104, SPEC-105.

**Count:** 4 shipped / 0 active / 0 pending

The project stays **active**: the roadmap below holds real, owner-originated work (the picker
sheet, and a possible chrome revisit). It is between stages, not finished.

## Roadmap — resolved at project ship

Every item that was deferred during this project, and where it ended up. Nothing is left dangling.

**Done in this project:**
- ~~**The winning paw-print**~~ — shipped as SPEC-105.
- ~~**Watermark rollout**~~ — shipped as SPEC-104; all six machines.

**Carried to a future project (NOT this one's debt):**
- **No sound on iPhone** — owner-reported, owner-deferred: *"maybe that goes for the backlog and
  done in the next proj."* Likely not a defect at all: the game is muted by default (DEC-025) and
  iOS routes Web Audio through the ringer switch, so both the mute toggle and the physical silent
  switch have to be right before anything plays. A real fix lands in **parked `src/ui/audio/**`**
  and needs an explicit go, which makes it a natural fit for whatever project un-parks audio.
- **Machine picker sheet** (SPEC-094 — number reserved, never built) — tap the machine name to open
  a sheet listing all six. Deliberately deferred at the outset and still correct to defer: the
  arrows work well at six machines. **Trigger conditions:** the roster reaching ~8+, or players
  wanting random access rather than browsing. SPEC-093 sharpened *why* it matters — replacing the
  `<select>` cost random access, which wrap-around softens but does not restore.

**Closed as accepted, not deferred:**
- **A heavier "arcade cabinet" chrome pass.** Offered and declined; the owner's verdict on the
  shipped framing was *"could be nicer, but I think this is ok."* That is a pass rather than a win,
  and the DEC-028 token layer would support going heavier without restructuring — but it is not
  outstanding work. Reopen only on a specific, named complaint; guessing at "nicer" is expensive.

## Dependencies

### Depends on
- PROJ-002 (shipped) — the machine registry, selector seam, and per-machine theme tokens.
- PROJ-005 (shipped) — six machines with distinct palettes are what make the framing worth doing.

### Enables
- The machine picker sheet, and any future theme work that wants a real chrome layer to hang on.

## Project-Level Reflection

*Shipped 2026-07-29. Four stages, 14 specs, one DEC, ~19 PRs — all in a single working session.*

- **Did the thesis hold?** Yes. The claim was that the cabinet "still looks like a wireframe" and
  that token-driven framing could fix it across all six palettes. It did: shell → face → recessed
  wells, driven entirely by tokens the machines already defined, so **every machine got its own
  chrome with zero per-machine code**. The watermark rollout later proved the same point again —
  five lines for five machines.
- **The `risks_to_thesis` were right, and one of them dominated.** The brief predicted "'nicer'
  can't be asserted by a test, so this project leans on real renders and the owner's eye more than
  any prior one." That is exactly what happened, and more so than expected: **the owner's device
  testing found things no amount of local verification would have.** Two bugs, several taste
  corrections, and three reversed decisions all came from them using shipped results.
- **Two bugs, both mine, both invisible to a 1038-test suite:**
  - **SPEC-099** — `overflow: hidden` plus a stale `max-height` made the **Spin button unreachable**
    on desktop windows under ~795px tall. The game was unplayable there.
  - **SPEC-101** — `flex-wrap` made a decorative row count depend on width, slicing 12-of-36 glyphs.
  Both lived *outside* the 375/430px range the project had been verifying. `portrait-first` makes
  phone primary; it does not make phone the only thing worth checking. That is the single most
  useful thing this project learned.
- **The verification lesson, in its final form.** STAGE-020 concluded "the render is the test."
  STAGE-021 sharpened it: **the render finds visual bugs; the DOM measures them** — SPEC-097's four
  conflicting band edges were invisible until `getBoundingClientRect()` produced a table, and
  SPEC-098's watermark rendered *perfectly* while being 100% invisible behind the reel window.
  A thing can be correct and unseeable; measure before concluding.
- **Where I overstated.** SPEC-102's option preview promised "no scrolling at any height"; the real
  behaviour is no scrolling to ~530px, then a readability floor. An option's preview is a
  commitment, and that one overstated by omission.
- **A process failure worth recording.** PR #118 was branched from a local `main` carrying two
  unpushed `chore:` commits, so its squash also committed the audio spike, idea notes, and report
  snapshots — ~30 unrelated files inside a PR titled "roll out the watermark". The content was the
  owner's and destined for `main`, so nothing foreign landed, but the history is misleading and it
  silently broke `one-spec-per-pr`. Owner chose to leave it and record the note rather than churn
  three PRs to unpick it. Root cause: branching without checking local `main` against `origin`.
- **Long-standing debt discharged.** The real-iPhone Safari check has been open since PROJ-003 and
  is now genuinely done — the owner tested Safari, Chrome iOS, and DuckDuckGo/macOS. The
  monochrome-emoji technique is confirmed working on real iOS Safari, which had been flagged as
  unverified.
- **Maintenance hazard left behind, deliberately.** `--reel-chrome` hard-codes a measurement of the
  cabinet's non-reel height. Any future band added or resized makes the height math stale — a
  graceful failure (slightly wrong reel size, not breakage), but it must be re-measured by whatever
  spec next changes cabinet structure. A `ResizeObserver` would be self-maintaining at the cost of
  runtime and a DOM dependency for something CSS currently expresses.
- **Stage sizing.** STAGE-021 was scoped for two specs and absorbed eight. The corrective — close
  the stage, open a fresh one per concern — was applied from STAGE-022 onward and held: 1, then 2
  specs, both to plan.
