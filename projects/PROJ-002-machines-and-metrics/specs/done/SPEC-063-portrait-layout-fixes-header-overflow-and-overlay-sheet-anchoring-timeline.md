# SPEC-063 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-063-<cycle>.md`.

## Instructions

- [x] **design** — 2026-07-12 (Opus): first STAGE-013 UI-polish fix. Reproduced BOTH bugs in-browser
      (375×812 → Help trigger off the right edge; 375×500 → Help/Paytable sheet title + × close clipped
      above the viewport top) and read the CSS to root-cause them: (1) `.cabinet__header-controls` is a
      non-wrapping 5-item row that overflows; (2) the three overlay sheets are `position:absolute; bottom:0`
      anchored to `.cabinet` (`min-height:100dvh`, grows taller than the viewport), and paytable/stats have
      NO `max-height`/`overflow-y` at all. Fix (settled): header cluster `flex-wrap:wrap`; sheets → phone
      `position:fixed` viewport-anchored, `max-height:100dvh` + `overflow-y:auto`, centred to 430px without
      a transform (slide-up keyframe stays free); a `@media(min-width:640px)` override restores `absolute`
      inside the bounded/overflow-hidden desktop frame. Presentation-only (DEC-001/DEC-010/DEC-004); no new
      DEC. Verified by browser preview (the right method for layout bugs) + a small CSS-guard test.
      **Design + build + verify run in the orchestrator session** given the visual nature. **[M]**

- [x] **build** — 2026-07-12 (Opus, orchestrator session, branch `feat/spec-063-portrait-layout-fixes`):
      header-controls `flex-wrap:wrap`; all three sheets → phone `position:fixed` viewport-anchored,
      `box-sizing:border-box` + `max-height:100dvh` + `overflow-y:auto`, centred to 430px via
      `margin-inline:auto`; `@media(min-width:640px)` override restores `absolute` inside the bounded
      desktop frame; added `overlay-sheet-scroll.contract.test.ts` (9 assertions). Full gate green (462
      tests). Two preview-only corrections (dropped `width:100%`; added `box-sizing:border-box`) — see the
      spec's Build Completion. Engine diff EMPTY.
- [x] **verify** — 2026-07-12 (Opus, in-session browser preview — the right verification for a layout
      bug): header (375px) all 5 controls visible + Help wrapped to row 2; Paytable at 375×500 shows title
      + × close and scrolls its body (getBoundingClientRect top 0 / height 500 / scrollH 760); Help at
      375×812 fits with body text un-clipped; desktop (1100×760) keeps the sheet inside the framed cabinet.
      Console + network clean. Zero defects.
- [x] **ship** — shipped 2026-07-12 via PR #74 (squash-merged to main; CI all-green; branch deleted).
      First STAGE-013 UI-polish fix. Next: SPEC-064 (favicon), SPEC-065 (emoji refresh).
