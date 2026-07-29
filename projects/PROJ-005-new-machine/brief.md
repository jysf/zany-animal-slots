---
project:
  id: PROJ-005
  status: shipped
  priority: low
  target_ship: null
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: 2026-07-25
value:
  thesis: >-
    Add play VARIETY, not just skins: a new machine with a distinct math personality the roster
    lacked. The four existing machines run steady-to-moderate; PROJ-005 adds a HIGH-VARIANCE
    "Farm" — fewer, bigger hits and a rarer, fatter jackpot — proving config-as-data (DEC-015)
    scales to genuinely different feels with zero engine change.
  beneficiaries:
    - "Players — a swingy machine for those who want bigger, rarer thrills."
    - "Template maintainer — a fifth exercise of the config-driven machine model + the measure-then-pin loop."
  success_signals:
    - "A fifth selectable machine (Farm) with its own theme, creatures, and HIGH-VARIANCE math (~94% RTP, ~23% hit)."
    - "Zero engine diff; passes the symbol-uniqueness + machine-parity contracts; default machine unchanged."
  risks_to_thesis:
    - "High-variance RTP is noisy to measure; the metrics-sanity band must be wide enough to be stable yet tight enough to catch drift."
---

# PROJ-005: A new machine

## What This Project Is

Started as one new machine, **Farm** (barnyard theme, high-variance math), plus a roadmap of themes
to follow. Shipped as **two**: Farm, then **Diner** (food-and-drink theme, generous math) — because
Farm's DEC-026 explicitly deferred the generous personality, and closing that gap turned out to be
the more valuable half. Machines are config-as-data (DEC-015), so each is a data file +
registration + a test + a DEC — no engine change.

> The `value.thesis` above is left as originally written (it names only Farm) so the
> Project-Level Reflection can be judged against the claim actually made, not a retrofitted one.

## Why Now

The user greenlit a new machine for variety; the roster had no notably swingy option. Cheap to add,
and it dogfaces the config-driven model a fifth time.

## Stage Plan

- [x] STAGE-018 (shipped) — **Farm machine**: high-variance barnyard machine (SPEC-090). DEC-026.
- [x] STAGE-019 (shipped) — **Diner machine**: generous, high-hit-rate food-and-drink machine
  (SPEC-091). DEC-027.

**Count:** 2 shipped / 0 active / 0 pending

## Roadmap / more machines (deferred)

Themes the owner wants as future machines (each ~1 spec + a DEC; reskin or tuned):

- ~~**Food & Drink**~~ — **shipped as Diner** (STAGE-019 / SPEC-091, DEC-027): 🍕🍔🌮🍩🍜🥤🍣 +
  🎂 jackpot, warm amber palette, generous math.
- **Space / Cosmic** — 🚀🛸🪐⭐🌙☄️👽 + 🌟 jackpot. Deep indigo/violet, high contrast; the boldest
  visual departure.

Pick a math personality per machine. The roster's math spectrum is now genuinely covered — swingy
Farm (23% hits), moderate W&W/Arctic/Desert, steady Ocean (38%), generous Diner (45%) — so there is
no remaining gap forcing the next machine. Space/Cosmic would be a *look*, not a new personality;
worth doing for variety, but it no longer has math to justify it. Note the ceiling recorded in
DEC-027: an integer paytable means ~45% hit-frequency is near the friendliest reachable without RTP
crossing 100%.

## Dependencies

### Depends on
- PROJ-002 (shipped) — the config-driven machine model (DEC-015), the machine registry + selector,
  the theme/audio presentation slices, and the `just simulate` metrics tool.

### Enables
- A steady cadence of new machines as pure data.

## Project-Level Reflection

*Shipped 2026-07-25. Two stages, two machines, two DECs, zero engine diff.*

- **Did we add play VARIETY, not just skins?** Yes, and this is measurable rather than a claim. The
  roster went from four machines clustered between 27.7% and 37.6% hit-frequency to six spanning
  **23.3% (Farm) to 44.9% (Diner)** — nearly a 2× spread, with RTP held in a narrow 90–96% band
  throughout. A player switching machines now feels a different *game*, not a different palette.
- **Did config-as-data hold?** Completely. Both machines are a data file + one registry line + a
  test + a DEC. `src/engine/**` diff is empty across the whole project, and the frozen-seed
  machine-parity contract never moved, so neither machine could regress the existing four.
- **What we learned that outlives the project.** Two things, both in DECs rather than folklore:
  (a) **4-of-a-kind is the dominant RTP lever**, now confirmed on two opposite personalities
  (DEC-026, DEC-027) — the place to start tuning. (b) **Test-band width should follow measured
  variance, not the previous machine** — Farm needed 17 points because high variance is noisy;
  copying that to low-variance Diner would have shipped a guard that catches nothing (DEC-027).
- **Where the process failed.** SPEC-090's code merged and its *spec* didn't — no reflection, no
  archive, stage left active — and the next project's close-out landed on top and hid it for a day.
  Caught by reading `just status` (`ship (1)` with `archived: 0`), not by any gate. SPEC-091 was
  deliberately closed out in the same session its code merged.
- **Carried forward.** **Space / Cosmic** remains an appealing theme but is explicitly *not* a gap:
  the math spectrum is covered, so it would be a look, not a personality. It belongs to a future
  machines project rather than blocking this one. Also unresolved and not this project's to fix: a
  real-iPhone Safari check of Farm/Diner at 375px (Chromium isn't proof), and DEC-027's integer-
  payout ceiling (~45% hit-frequency is near the friendliest reachable without RTP crossing 100%).
