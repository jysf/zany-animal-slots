---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-013                     # stable, zero-padded, continuous across the repo
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-12
shipped_at: null

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    The "worth playing" half of PROJ-002's thesis at the surface layer: the machines are now configurable,
    fun-tuned, measured, and legible — but on a real phone the chrome has rough edges (a header control
    running off-screen, overlay sheets that clip their own close button) that undercut the polish, and the
    game ships with no favicon identity. This stage makes the existing surfaces feel finished.
  delivers:
    - "A header that never pushes a control off-screen on a narrow phone (the Help trigger stays reachable)."
    - "Overlay sheets (Help / Paytable / Stats) that always show their header + close button and scroll their
      own body — never clipping the top or stranding the close control off-screen."
    - "A recognizable slot-machine favicon / tab identity for the app."
    - "Refreshed per-machine reel-emoji identities (a presentation-only symbolDisplay update, Task 2)."
  explicitly_does_not:
    - "Change any engine / game math or the SpinResult contract (DEC-001) — presentation only."
    - "Change the analytics posture (STAGE-011) or touch the security/privacy surface (DEC-005 / SECURITY.md)."
    - "Redesign the visual system / tokens (DEC-010) — these are targeted fixes + one small asset, not a re-skin."
    - "Alter the symbol VOCABULARY or engine tiers — the emoji refresh swaps glyphs only (no DEC-021 change)."
---

# STAGE-013: UI polish and fixes

## What This Stage Is

A cleanup stage that takes the surfaces PROJ-002 already shipped and makes them feel finished on a real
phone. It fixes two portrait-layout bugs the multi-machine + multi-sheet growth introduced — the header
control cluster (machine selector + mute + paytable + stats + help) overflowing so the **Help trigger runs
off-screen**, and the **overlay sheets** (Help / Paytable / Stats) being anchored to a growable full-height
cabinet so a tall sheet **clips its own top / close button** out of the viewport — gives the app a
**slot-machine favicon** identity it currently lacks, and **refreshes each machine's reel-emoji** set
(Task 2, presentation-only). Every spec is presentation-only: the engine, the analytics posture, and the
security surface are untouched.

## Why Now

The user hit these on a real device: the Help button is "mostly off the screen," and the Paytable/Help
sheets sometimes "jump to the bottom and cut off the top," leaving the close button unreachable. These are
regressions from cumulative growth (STAGE-008 added the machine selector to the header; STAGE-009/010 added
the Stats + Help sheets) rather than any one spec's fault — the header cluster and the overlay-sheet
positioning were sized for fewer elements. They are cheap, high-visibility fixes that protect the "worth
playing / measurable" work already shipped. The favicon + emoji refresh are small identity polish batched
into the same wave. This is a natural pass before PROJ-002 is considered for close-out.

## Success Criteria

- On a 375px-wide portrait viewport, **every header control is fully visible and tappable** — the Help
  trigger is never clipped off the right edge (the cluster wraps instead of overflowing).
- Opening **Help, Paytable, or Stats** always shows the sheet's **title + close button**, with the body
  scrolling inside the sheet; the top is never clipped and the close is always reachable, regardless of how
  tall the cabinet/content is or whether the page has scrolled.
- The app serves a **recognizable slot-machine favicon** (browser tab + bookmark), wired in `index.html`,
  self-contained (no external request; CSP `img-src 'self' data:` already allows it).
- Each machine renders its **refreshed reel-emoji** set on the reels + paytable after switching machines,
  with accessible labels intact; the machine test files that pin symbols are updated.
- **Engine untouched** (`git diff … -- src/engine/` EMPTY) in every spec; DEC-005 / SECURITY.md unchanged;
  UI is token-only CSS (DEC-010), ≥44px targets, reduced-motion respected.
- `just typecheck && just lint && just test && just build && just validate && just cost-audit` all green.

## Scope

### In scope
- **Header overflow fix** — let the header-controls cluster wrap (e.g. the machine selector on its own row)
  so no control is pushed off-screen on a narrow phone; keep ≥44px targets.
- **Overlay-sheet viewport anchoring** — rework the shared help/paytable/stats sheet positioning so the
  sheet is anchored to the visible viewport and capped at viewport height (header/close always visible,
  body scrolls). One fix pattern applied across the three sheets.
- **Slot-machine favicon** — a self-contained SVG favicon + `index.html` `<link rel="icon">` wiring.
- **Per-machine reel-emoji refresh (Task 2)** — update `symbolDisplay` (emoji + labels) in
  `src/machines/{wildAndWhimsical,arctic,desert,ocean}.ts` to the user-provided sets; update the pinned
  symbols in the machine test files; preview-verify the reels render the new emoji per machine.

### Explicitly out of scope
- Any engine / game-math / SpinResult change (DEC-001); any analytics or security-posture change
  (STAGE-011 / DEC-005 / SECURITY.md).
- A visual-system / token redesign (DEC-010) or a new component library — targeted fixes only.
- Changing the symbol VOCABULARY or engine tiers (no DEC-021 amendment — the emoji refresh swaps glyphs
  only, same 8 engine symbols, WOLF slot stays the jackpot creature).
- Any STAGE-011 Tier-2 (remote-sink) work — that stays GATED.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

*Numbering note: SPEC-063+ are the next available IDs. The STAGE-011 Tier-2 backlog previously penciled in
SPEC-063/064/065 as provisional labels; those are gated/deferred and will take the next-available numbers
when (if) they are un-gated, per the repo's continuous-numbering rule.*

- [x] SPEC-063 (shipped 2026-07-12, PR #74) — **Portrait layout fixes** *(bug/CSS)*: header-controls wrap
      so the Help trigger is never off-screen; overlay sheets (help/paytable/stats) viewport-anchored +
      `box-sizing:border-box` + `max-height:100dvh` + `overflow-y:auto` so the title/close is always visible
      and the body scrolls; desktop keeps the sheet inside the framed cabinet. Browser-verified at
      375×812 / 375×500 / 1100×760; +9-assertion contract test. **[M]**
- [ ] SPEC-064 (pending) — **Slot-machine favicon** *(asset)*: a self-contained SVG slot-machine favicon +
      `index.html` `<link rel="icon">` wiring; no external request. **[S]**
- [ ] SPEC-065 (pending) — **Per-machine reel-emoji refresh** *(presentation, Task 2)*: update each
      machine's `symbolDisplay` emoji (+ labels) to the user-provided sets; update the pinned-symbol tests;
      preview-verify per machine. Presentation-only — no engine/DEC-021 change. **[S]** *(awaiting the
      user's emoji lists.)*

**Count:** 1 shipped / 0 active / 2 pending — SPEC-063 shipped (PR #74); SPEC-064 (favicon) + SPEC-065
(emoji refresh, awaiting the user's emoji lists) pending.

## Design Notes

- **Presentation-only, engine untouched (DEC-001).** Every spec's `git diff … -- src/engine/` is EMPTY.
- **Shared overlay-sheet pattern.** help.css / paytable.css / stats.css currently mirror the same
  `position:absolute; bottom:0; max-height:100%` anchored to `.cabinet` (which is `min-height:100dvh` and
  can grow taller than the viewport — the root cause of the top-clip). The fix keeps the three in lockstep
  (viewport-anchored, capped at viewport height, matched to the cabinet's 430px max-width on desktop).
- **Token-only CSS (DEC-010).** No raw hex; reuse existing tokens; keep ≥44px targets and the
  reduced-motion fallback (DEC-004) on the sheets.
- **Favicon is a real asset, not synthesized.** Unlike audio (DEC-007, synthesized), a favicon is a
  standard static asset; an inline SVG in `public/` keeps it self-contained (no build step, CSP-friendly).
- **Emoji refresh ≠ vocabulary change (no DEC-021 amendment).** DEC-021 fixed the per-machine symbol
  *identity model* (each machine owns its symbolDisplay); swapping which emoji fills each of the 8 engine
  symbol slots is data, not a model change — so no DEC unless the tier/vocabulary semantics change.

## Dependencies

### Depends on
- **STAGE-008 (shipped):** the machine selector in the header (part of the overflow) + the per-machine
  theming the sheets render over.
- **STAGE-009 / STAGE-010 (shipped):** the Stats + Help overlay sheets whose shared positioning this fixes.
- **STAGE-012 (shipped):** the per-machine `symbolDisplay` model (DEC-021) the emoji refresh updates.

### Enables
- A cleaner PROJ-002 close-out: the shipped surfaces feel finished on a real phone before the
  project-level reflection.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1c (Stage Ship) in
FIRST_SESSION_PROMPTS.md to draft this.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
