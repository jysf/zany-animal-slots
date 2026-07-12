---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-063
  type: bug                        # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # visual CSS fix — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # engine-no-dom: presentation-only, engine untouched
    - DEC-010   # global CSS, token-only, no raw hex — the fix uses existing tokens + prefixed classes
    - DEC-004   # the sheets keep their reduced-motion fallback (slide-up animation only)
  constraints:
    - engine-no-dom
    - portrait-first
    - respect-reduced-motion
    - touch-targets-44
  related_specs:
    - SPEC-050  # added the machine selector to the header (part of the overflow)
    - SPEC-020  # the paytable sheet whose positioning pattern (mirrored by stats/help) this fixes
    - SPEC-060  # the help sheet + trigger this touches

value_link: >-
  STAGE-013's core fix: makes the header + overlay sheets usable on a real narrow/short phone — the Help
  trigger stays on-screen and every sheet's close button stays reachable — protecting the shipped surfaces.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: >-
        Design authored on the main Opus loop (un-metered). This spec's build + verify were also run in
        the orchestrator session (NOT metered subagents) because the fix is visual CSS whose meaningful
        verification is a live browser preview — the correct method for a layout bug, since typecheck/
        lint/unit-tests do not catch header overflow or a sheet clipping its own close button.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 45000    # NOMINAL main-loop estimate — see note (not a metered subagent)
      estimated_usd: 0.68    # nominal, 45000 tok × ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build run in the orchestrator main Opus loop, not a metered subagent (visual CSS fix across
        regions.css + help/paytable/stats.css + a new overlay-sheet-scroll contract test). tokens_total
        is a NOMINAL main-loop estimate (per the SPEC-054-verify nominal-estimate precedent for un-metered
        main-loop cycles), not a measured subagent count. Two corrections were found only in the browser
        (a `width:100%` right-overflow, then a `content-box` max-height defeat needing `box-sizing:
        border-box`) — see Build Completion. Full gate green (462 tests). Engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 30000    # NOMINAL main-loop estimate — see note
      estimated_usd: 0.45    # nominal, 30000 tok × ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Verify was the browser-preview pass, in-session (not a separate cold subagent — the visual check
        IS the verification for a layout bug). Confirmed in-browser: header (375px) all 5 controls visible
        with Help wrapped; Paytable at 375×500 shows title + close and scrolls (getBoundingClientRect top
        0 / height 500 / scrollHeight 760); Help at 375×812 fits, text un-clipped; desktop (1100×760) keeps
        the sheet inside the framed cabinet. NOMINAL main-loop token estimate. Full gate re-run green.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle — PR + CI-poll + squash-merge + archive
        + brag + signals. First STAGE-013 UI-polish fix.
  totals:
    tokens_total: 75000    # build 45000 + verify 30000 (both NOMINAL main-loop estimates; design + ship null)
    estimated_usd: 1.13    # build 0.68 + verify 0.45 (nominal)
    session_count: 4       # design, build, verify, ship
---

# SPEC-063: Portrait layout fixes — header overflow + overlay-sheet anchoring

## Context

Two portrait-layout regressions from PROJ-002's cumulative growth, both reproduced in-browser (STAGE-013,
the first UI-polish fix):

1. **Header overflow — the Help trigger runs off-screen.** `.cabinet__header-controls`
   (`src/ui/regions/regions.css`) is a single non-wrapping (`flex-shrink: 0`) row that grew from 2 items
   to **5** (machine selector + mute + paytable + stats + help — SPEC-050/056/060). On a 375px phone the
   row overflows and the last control (**Help**) is pushed off the right edge, unreachable.
2. **Overlay sheets clip their own top / strand the close button.** The Help / Paytable / Stats sheets are
   `position: absolute; bottom: 0` anchored to `.cabinet`, which is `min-height: 100dvh` and **grows
   taller than the viewport** on a short screen. The sheet's top (its **title + × close**) is then pushed
   above the visible viewport. Worse: **paytable.css and stats.css have no `max-height`/`overflow-y` at
   all**, so a tall sheet has no internal scroll to recover the close button (only help.css caps+scrolls,
   and even it clips because it's anchored to the growable cabinet).

Both are presentation-only. The engine, analytics posture, and security surface are untouched (DEC-001,
DEC-005). Verified visually because a layout overflow / clipped-close-button isn't caught by the repo's
behavior-level unit tests.

## Goal

On a narrow/short portrait phone, keep **every header control visible + tappable** (the Help trigger never
clipped) and make **every overlay sheet (Help/Paytable/Stats) always show its title + close button** with
its body scrolling inside — never clipping the top — while preserving the current desktop framed-cabinet
behavior, token-only CSS (DEC-010), the slide-up + reduced-motion fallback (DEC-004), and ≥44px targets.

## Inputs

- **Files to read / edit:**
  - `src/ui/regions/regions.css` — `.cabinet__header-controls` (the overflow fix).
  - `src/ui/help/help.css`, `src/ui/paytable.css`, `src/ui/stats/stats.css` — the three mirrored
    `*__backdrop` + `*__sheet` blocks (the anchoring fix; paytable/stats also gain the height cap + scroll).
  - `src/ui/device-frame.css` — the desktop (`@media min-width: 640px`) bounded/`overflow:hidden` cabinet
    that the desktop override must preserve (do NOT let the sheet break out of the phone frame on desktop).
- **Related code paths:** `src/ui/**` (CSS only). No `.tsx`/engine changes.

## Outputs

- **Files modified (CSS only):**
  - `src/ui/regions/regions.css` — `.cabinet__header-controls`: allow the cluster to wrap.
  - `src/ui/help/help.css`, `src/ui/paytable.css`, `src/ui/stats/stats.css` — each sheet:
    phone-default `position: fixed` (viewport-anchored), centered to the cabinet width, capped at viewport
    height with `overflow-y: auto`; backdrop `position: fixed`; a `@media (min-width: 640px)` override that
    restores `position: absolute` within the bounded desktop cabinet.
- **Files created:** none (a small CSS-guard test may be added — see Failing Tests).
- **New exports / DB:** none.

## Acceptance Criteria

- [ ] **Header (375px):** all five controls (machine selector, mute, paytable, stats, help) are fully
      within the viewport and tappable; the Help trigger is not clipped. The cluster wraps to multiple rows
      instead of overflowing. Each control keeps its ≥44px hit area (touch-targets-44).
- [ ] **Sheets (375×500, short viewport):** opening Help, Paytable, or Stats shows the sheet **title + ×
      close** at the top of the viewport; the body scrolls **inside** the sheet; the top is never clipped
      and the close is always tappable — for all three sheets, regardless of cabinet/content height.
- [ ] **Sheets (375×812):** unchanged good behavior — sheet slides up from the bottom, fits, close visible.
- [ ] **Desktop (≥640px):** the sheet stays **within** the framed, centered, `overflow:hidden` cabinet
      (does not break out to span the full viewport); backdrop dims the cabinet frame as before.
- [ ] **Reduced motion:** the `prefers-reduced-motion` fallback still drops the slide-up animation on all
      three sheets.
- [ ] `git diff main..HEAD -- src/engine/` is EMPTY; no raw hex added (DEC-010); no new dependency.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit` green.

## Failing Tests

Layout overflow / viewport clipping is **verified by browser preview** (the meaningful check — see the
Verification plan in Notes), not by a unit test, matching how the repo verifies visual/animation behavior.
A lightweight **CSS-guard test** is added to lock the regression fix in source (mirrors the existing
reduced-motion / touch-target CSS-reading tests):

- **`src/ui/overlay-sheet-scroll.contract.test.ts`** — reads help.css / paytable.css / stats.css and
  asserts each `*__sheet` base rule declares a viewport-relative height cap (`max-height` using `dvh`/`vh`)
  and `overflow-y: auto`, so a tall sheet can always scroll its body to the close button. (Guards the
  paytable/stats "no max-height" gap specifically.)

## Implementation Context

### Decisions that apply
- `DEC-001` — presentation-only; `git diff … -- src/engine/` stays EMPTY.
- `DEC-010` — token-only CSS, prefixed classes, no raw hex; reuse existing tokens/spacing.
- `DEC-004` — keep the slide-up keyframe + `prefers-reduced-motion` fallback on each sheet.

### Constraints that apply
- `portrait-first` — the fix targets the 375–430px portrait phone; desktop is the additive framed case.
- `respect-reduced-motion` — the reduced-motion fallback must remain.
- `touch-targets-44` — header controls keep ≥44px hit areas after wrapping.

### Out of scope (for this spec specifically)
- The favicon (SPEC-064) and the emoji refresh (SPEC-065).
- Any restyle beyond the overflow + anchoring fix; any `.tsx`/engine change.

## Notes for the Implementer

The fix design (settled from the in-browser repro + CSS read):

**A) Header overflow (`src/ui/regions/regions.css`).** Let the control cluster wrap:
```css
.cabinet__header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;          /* was: flex-shrink: 0 (single non-wrapping row) */
  justify-content: flex-end;
}
```
The wide machine selector takes the first line; the four buttons wrap beneath, all on-screen and ≥44px.

**B) Overlay-sheet anchoring — apply the SAME pattern to help.css / paytable.css / stats.css** (prefix
`help__` / `paytable__` / `stats__`). Phone default → anchor to the viewport, cap at viewport height,
scroll the body; centre to the cabinet width without a transform (so the slide-up `translateY` keyframe is
free). Desktop → restore absolute within the bounded frame.

Backdrop (each file):
```css
.help__backdrop { position: fixed; inset: 0; /* was position: absolute */ background-color: var(--color-bg); opacity: 0.7; z-index: 10; }
```
Sheet (each file) — base (phone):
```css
.help__sheet {
  position: fixed;              /* was absolute — anchor to the viewport, not the growable cabinet */
  bottom: 0;
  left: 0;
  right: 0;
  margin-inline: auto;         /* centre without a transform (translateY keyframe stays free) */
  max-width: 430px;            /* match the cabinet's max-width so it doesn't sprawl on wide phones */
  z-index: 11;

  box-sizing: border-box;      /* so max-height caps TOTAL height incl. padding (no global reset here) */
  max-height: 100dvh;          /* never taller than the viewport → title + close always visible */
  overflow-y: auto;            /* body scrolls inside (paytable/stats currently lack this) */

  /* background, radius, padding, animation unchanged */
}
```
> Two corrections found during preview verification (see Build Completion): (1) do NOT add `width: 100%`
> — with `left:0; right:0` the box already fills the viewport, and `width:100%` under content-box adds the
> horizontal padding on top, overflowing the right edge and clipping the body text; (2) `box-sizing:
> border-box` is REQUIRED — without it `max-height:100dvh` caps only the content box and the 56px of
> vertical padding is added on top (sheet = 556px on a 500px viewport), re-clipping the top by exactly the
> padding. Both were caught only in the browser, not by typecheck/lint/tests — the reason this spec is
> preview-verified.
Desktop override (add once per file, near the reduced-motion block):
```css
@media (min-width: 640px) {
  .help__backdrop { position: absolute; }
  .help__sheet {
    position: absolute;        /* back inside the bounded, overflow:hidden cabinet */
    max-width: none;
    margin-inline: 0;
    max-height: 100%;
  }
}
```
Notes: paytable.css / stats.css currently have NO `max-height`/`overflow-y` — the base rule above ADDS
them. help.css already had `max-height: 100%; overflow-y: auto` → change the `100%` to `100dvh` and the
position to fixed. Keep every other declaration (background/radius/padding/animation) as-is. `100dvh` caps
to the *dynamic* viewport (correct with mobile browser chrome); it's fine that older engines fall back to
treating it via the `overflow-y` scroll.

**Verification plan (the real test — browser preview):**
1. `just dev`; set viewport 375×812 → header shows all 5 controls, Help visible (wrapped). Screenshot.
2. Viewport 375×500 → open Help, Paytable, Stats each → title + × close visible at top, body scrolls to the
   close, nothing clipped. Screenshot Paytable (the one with the most rows).
3. Desktop ≥640px → open a sheet → it stays within the centered phone frame (doesn't span the viewport).
4. Toggle reduced-motion (or read CSS) → slide-up dropped, sheet still appears.
5. Console + network clean; full gate green.

---

## Build Completion

*Filled at the end of the build cycle (orchestrator session — visual CSS, preview-verified).*

- **Branch:** `feat/spec-063-portrait-layout-fixes`
- **All acceptance criteria met?** yes — verified in-browser: header (375px) all 5 controls visible with
  Help wrapped onto a second row; Paytable at 375×500 shows title + × close and scrolls its body
  (`getBoundingClientRect`: top 0, height 500, scrollHeight 760); Help at 375×812 fits with the body text
  no longer clipped; desktop (1100×760) keeps the sheet inside the centered rounded phone frame. Full gate
  green (462 tests incl. the 9-assertion overlay-sheet-scroll contract).
- **New decisions emitted:** none (presentation-only; DEC-010/DEC-001/DEC-004 already cover it).
- **Deviations from spec (both caught by the browser preview, not tests):**
  - Removed the `width: 100%` the initial drop-in had on the sheet — with `left:0; right:0` the box already
    fills the viewport, and `width:100%` under the repo's default `content-box` added the horizontal
    padding on top, overflowing the right edge and clipping the body text.
  - Added `box-sizing: border-box` to the sheet (not in the initial drop-in) — without it `max-height:
    100dvh` capped only the content box and the 56px vertical padding was added on top, so the sheet was
    556px on a 500px viewport and re-clipped the title/close by exactly the padding.
  - The Notes drop-in above was updated to the shipped CSS.
- **Follow-up work identified:** SPEC-064 (favicon), SPEC-065 (emoji refresh) — both already in the
  STAGE-013 backlog. A possible future nicety (not this spec): a sticky sheet header so the close stays
  pinned while scrolling — the current fix already meets the bug (close visible on open, reachable by
  scroll-to-top).

### Build-phase reflection

1. **What was unclear in the spec that slowed you down?** — Nothing unclear, but two CSS details only a
   real browser surfaces bit in sequence (`width:100%` right-overflow, then `content-box` max-height
   defeat). The lesson: for a sheet-sizing fix, set `box-sizing` and avoid redundant `width` from the
   start, and measure `getBoundingClientRect` vs `innerHeight` rather than eyeballing the screenshot.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No. It would help to
   have a global `*, *::before, *::after { box-sizing: border-box }` reset in the repo (its absence is the
   root of the padding-vs-max-height trap); flagged to the signals file rather than added here.
3. **If you did this task again, what would you do differently?** — Diagnose the sheet box model
   (`getBoundingClientRect` + computed `box-sizing`) before writing the height cap, catching both issues
   in one pass instead of two preview round-trips.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Treat a bottom-sheet height fix as a box-model problem
   first: check `box-sizing` + measure `getBoundingClientRect` vs `innerHeight` before writing `max-height`,
   which would have caught both the `width:100%` overflow and the content-box padding defeat in one pass
   instead of two preview round-trips. Also: for visual CSS specs, doing build+verify in-session with the
   preview open is the right call (a blind subagent can't see the clip) — but it means build/verify cost is
   a nominal main-loop estimate, not a metered number.
2. **Does any template, constraint, or decision need updating?** — No DEC/constraint change (presentation
   only; DEC-001/DEC-010/DEC-004 held). One repo-level nicety worth flagging (logged to the signals file):
   there is **no global `box-sizing: border-box` reset** — its absence is the root cause of the
   `max-height` vs padding trap and will keep biting any fixed/scrolled panel. A one-line global reset in
   `tokens.css` would prevent the class of bug; deferred as its own tiny change, not smuggled into this fix.
3. **Is there a follow-up spec I should write now before I forget?** — No new spec beyond the STAGE-013
   backlog already framed (SPEC-064 favicon, SPEC-065 emoji refresh). A *possible* future nicety: a sticky
   sheet header so the close stays pinned during scroll — but the current fix already satisfies the
   reported bug (close visible on open, reachable). The global box-sizing reset (see Q2) is the one loose
   thread worth a tiny standalone chore.
