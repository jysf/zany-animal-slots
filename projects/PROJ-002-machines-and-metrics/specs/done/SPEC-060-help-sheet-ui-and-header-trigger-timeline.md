# SPEC-060 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-060-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-09 (Opus): the VISIBLE half of STAGE-010 and the last spec in the
      backlog — a `HelpSheet` (how-to-play explainer) that mirrors `StatsSheet`/`PaytableSheet` 1:1 for
      the sheet/backdrop/Esc/focus idiom, reached **two ways** per DEC-022: a persistent **"How to play"**
      cabinet-header trigger AND an **auto-open-once** on first run. The only new behaviour over the two
      prior sheets is the first-run auto-open — `useState(() => !seen)` reading the SPEC-059
      `useHelpSeen()` seam at mount, plus `markSeen()` inside `close()` (mark on FIRST dismiss — DEC-022,
      idempotent). Content: the goal, the four controls (Spin, − / +, Auto, Reset), where things live
      (ℹ Paytable, Machines, 📊 Stats, 🔊), and the play-money disclaimer — POINTS to the Paytable for
      payouts instead of re-listing them. Pure-UI ⇒ no RTP/strip simulation; "measure-then-pin" reduces
      to the deterministic DISPLAY OUTPUT — the two long copy strings (`help-goal`, `help-disclaimer`)
      pinned as exact `.textContent`, and first-run behaviour pinned against the seam contract (clean ⇒
      auto-open; auto-open alone does NOT mark seen; dismiss marks seen; seeded seen:true ⇒ no auto-open;
      provider-less ⇒ no auto-open, keeping App.test green). New files: `src/ui/help/HelpSheet.tsx`,
      `help.css` (token-only, `@keyframes help-slide-up` + reduced-motion fallback), `HelpSheet.test.tsx`.
      Edits: one-line `Header.tsx` wiring; a `.help__trigger` entry in `controls.touch-target.test.ts`.
      DEC-001 clean (`git diff src/engine/` must stay EMPTY); the SPEC-059 seam is consumed as-is (its
      diff must stay EMPTY). Complete drop-in code for every file in the spec's Notes. Two adversarial
      guard-mutations specified for verify (kill the auto-open initialiser; drop the `markSeen()` in
      `close()`). No new dependency; no new DEC (implements DEC-022). **[M]** Build prompt written.

- [x] **build** — completed 2026-07-09 (Sonnet sub-agent, branch `feat/spec-060-help-sheet-ui`, LOCAL ONLY):
      verbatim transcription of the Notes drop-ins — `src/ui/help/HelpSheet.tsx`, `help.css`,
      `HelpSheet.test.tsx`, the one-line `Header.tsx` wiring, and the `.help__trigger` touch-target-test
      edit. All 5 HelpSheet tests pass; full gate green (typecheck/lint/test **72 files / 425 tests**/
      build/validate/cost-audit); `git diff main..HEAD -- src/engine/` EMPTY; the SPEC-059 seam diff
      (`HelpSeenProvider.tsx` / `helpSeenStorage.ts`) EMPTY; no new dep; App.test unchanged + green. Only
      `src/ui/help/**` + one `Header.tsx` line + the touch-target test touched. Build Completion filled +
      build cost appended. No push/PR/advance-cycle.

- [x] **verify** — completed 2026-07-10 (Opus, cold review): reconciled the build against git/disk —
      `HelpSheet.tsx` byte-for-byte the spec drop-in; `Header.tsx` + touch-target edits exactly as
      specified; only `src/ui/help/**` + `Header.tsx` + the touch-target test + spec bookkeeping changed.
      Re-ran the FULL gate green (typecheck/lint/test **425/425**/build/validate/cost-audit). Ran both
      adversarial guard-mutations — each broke EXACTLY the "auto-opens once on first run and marks seen on
      dismiss" test and reverted clean (5/5 help tests green after): (1) `useState(() => !seen)` →
      `useState(false)` killed the auto-open; (2) removing `markSeen()` in `close()` left `readHelpSeen()`
      false after dismiss. `git diff main..HEAD -- src/engine/` EMPTY; SPEC-059 seam diff EMPTY; no
      `.only/.skip` in `src/ui/help/`. **Preview-verified** in a real browser (mobile 375×812): clean
      storage auto-opens the sheet with `seen:false`; dismiss flips `seen:true`; reload does NOT re-open
      (non-nagging); the header trigger re-opens it; goal/disclaimer copy + all four controls render;
      trigger declares 48px min-height/width (≥44px, identical to the shipped `.stats__trigger`); no
      console errors. Defects: 0.

- [x] **ship** — shipped 2026-07-10 via PR #70 (squash-merged to main, commit `147cf1a`). CI CLEAN, all
      checks SUCCESS (app checks, cost-capture, supply-chain, Workers Build). Post-merge: cycle → ship,
      STAGE-010 backlog SPEC-060 [x], archived. The LAST spec of STAGE-010 (Help / how-to-play) — the
      stage is now COMPLETE. Cost: build 101530 tok (Sonnet sub-agent) + verify 90000 (nominal main-loop)
      = 191530; 4 sessions. Brief's comprehension criterion met end-to-end.
