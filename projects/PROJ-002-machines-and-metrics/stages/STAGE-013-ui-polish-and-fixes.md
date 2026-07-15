---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-013                     # stable, zero-padded, continuous across the repo
  status: shipped                   # proposed | active | shipped | cancelled | on_hold  (shipped 2026-07-12)
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-12
shipped_at: 2026-07-12

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
- [x] SPEC-064 (shipped 2026-07-12, PR #75) — **Slot-machine favicon** *(asset)*: a self-contained SVG
      slot-machine favicon (`public/favicon.svg`) + `index.html` `<link rel="icon">` wiring + the missing
      meta description; no external request; browser-verified render, `dist/favicon.svg` produced. **[S]**
- [x] SPEC-065 (shipped 2026-07-12, PR #76) — **Per-machine reel-emoji refresh** *(presentation, Task 2)*:
      refreshed each machine's `symbolDisplay` to the user-approved sets — W&W → whimsical menagerie
      (unicorn jackpot), Arctic (hare/swan/orca), Desert (cactus/scorpion/bat), Ocean (jellyfish jackpot);
      no glyph repeats across machines (new symbol-uniqueness contract test). Verified across all 4
      machines live. Presentation-only (DEC-001/DEC-021); no DEC. **[S]**
- [x] SPEC-066 (shipped 2026-07-12, PR #77) — **Global `box-sizing: border-box` reset** *(chore/CSS)*:
      the SPEC-063 follow-up the signal called for. New `src/styles/reset.css`
      (`*, *::before, *::after { box-sizing: border-box }`) imported before `tokens.css`; retires the
      per-sheet `box-sizing` decls SPEC-063 added locally. Removes the root cause of the max-height-vs-padding
      trap so future fixed/scrolled panels don't re-hit it. Preview-verified at 375×812 / 375×500 / 1100×760
      (measured `border-box` + `height==innerHeight` on the sheets after removing the local crutch);
      +3-assertion contract test. Presentation-only. **[S]**

- [x] SPEC-067 (shipped 2026-07-12, PR #78) — **Hardening: error boundary + security-doc accuracy**
      *(chore)*: a top-level React `ErrorBoundary` (graceful "reload" fallback instead of a white screen
      on a component crash) + a `SECURITY.md` accuracy pass (the default-OFF analytics seam, affirming
      DEC-023; the real localStorage key set). Verified live (forced crash → fallback). **[S]**

- [x] SPEC-068 (shipped 2026-07-12, PR #79) — **Header single-row + Wild & Whimsical theme facelift**
      *(chore)*: icon-only header triggers (+ hover tooltips) on one clean row (replaces SPEC-063's ragged
      wrap); Wild & Whimsical gets its own vibrant magical-plum theme instead of the dull default campfire.
      Two user-reported fixes from live testing. **[S]**

- [x] SPEC-069 (shipped 2026-07-12, PR #80) — **Overlay-sheet clip fix (viewport-fixed at all sizes)**
      *(bug)*: removed SPEC-063's desktop `position:absolute` override so Help/Paytable/Stats are
      viewport-`fixed` everywhere — a user-reported first-run clip where the sheet's title/close sat above
      the frame. Verified at 918×1054 / 918×600 / 390×667. **[S]**

- [x] SPEC-070 (shipped 2026-07-12, PR #81) — **Money-bag Paytable icon + Safari dvh fallback** *(chore)*:
      Paytable header trigger `ℹ` → `💰` (+ matching help reference); a `100vh` fallback before `100dvh`
      on the overlay sheets for older Safari (<15.4). **[S]**

- [x] SPEC-071 (shipped 2026-07-12, PR #82) — **Header icon size fix (visible glyphs)** *(bug)*: the
      iconified header triggers were stuck at 12.8px (text-label era), so 💰/📊/❓ rendered tiny; bumped to
      `font-size-lg`. **[S]**

- [x] SPEC-072 (shipped 2026-07-12, PR #83) — **iOS audio unlock** *(bug)*: resume the AudioContext
      synchronously inside the first-gesture handler (was deferred to a later effect, leaving iOS Safari
      suspended/silent). Browser-verified resume-in-gesture; needs an iPhone device re-test. **[S]**

**Count:** 10 shipped / 0 active / 0 pending — SPEC-063 (#74) → SPEC-072 (#83) all shipped. (Stage grew
well past its framed 3-spec backlog absorbing live-testing polish + bug fixes.)

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

*Shipped 2026-07-12. Drafted per Prompt 1d (Stage Ship).*

- **Did we deliver the outcome in "What This Stage Is"?** **Yes, and then some.** The framed goal — make
  the shipped surfaces feel finished on a real phone — was delivered: the header no longer wraps its
  controls raggedly (one clean icon row), the overlay sheets never clip their title/close, the app has a
  slot-machine favicon, and each machine has a refreshed, distinct reel-emoji identity. Then real-device
  testing surfaced a run of follow-on bugs the stage absorbed: a global box-sizing gap, missing hardening
  (no error boundary; a stale SECURITY.md), a Wild & Whimsical stuck on the dull default theme, a
  Safari-specific overlay clip, tiny header icons, and no audio on iPhone — all fixed.
- **How many specs did it actually take?** **9** (SPEC-063–072) vs. the framed backlog of **3** (layout,
  favicon, emoji). The extra 6 came almost entirely from the user playing the live build and reporting
  what the Chromium preview couldn't show.
- **What changed between starting and shipping?** It stopped being a tidy 3-spec polish stage and became a
  live-testing bug-fix loop — every device round-trip added a spec.
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - **Layout/overflow/clip and audio bugs need REAL-device + Safari testing** — the Chromium preview
    missed the Safari sheet clip, the tiny icons, and the iOS audio unlock. (Logged:
    `layout-bugs-need-preview-not-unit-tests-and-a-box-sizing-reset`.)
  - **A modal/sheet wants `position: fixed` to the viewport at all sizes** — the desktop `absolute`-in-a-
    container variant (SPEC-063) clipped; SPEC-069 unified it.
  - **Add a global `box-sizing: border-box` reset** (done, SPEC-066) — its absence caused the
    max-height-vs-padding clip.
  - **Iconify a button in the same change you drop its text** (set the icon font-size then) — SPEC-068
    iconified the header but left the text-era 12.8px size, hiding the 💰 until SPEC-071.
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - Yes — "visual/layout/audio work must be verified in a real browser (ideally the target one), not by
    unit tests," and "pair `vh` with `dvh`," are both stage-level takeaways (in the signals file).
