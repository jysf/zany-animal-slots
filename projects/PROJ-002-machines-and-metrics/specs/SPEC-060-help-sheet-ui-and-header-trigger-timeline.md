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

- [ ] **build** — not started.
- [ ] **verify** — not started.
- [ ] **ship** — not started.
