# SPEC-059 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-059-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-09 (Opus): the STAGE-010 **infrastructure keystone** — a safe,
      versioned first-run-seen flag in `src/ui/help/helpSeenStorage.ts` (`HELP_SEEN_KEY='zany:help-seen'`,
      `HELP_SEEN_VERSION=1`, `readHelpSeen`/`writeHelpSeen`; single JSON blob `{ version, seen }`; absent/
      corrupt/wrong-version/non-boolean ⇒ `false`; guarded, never throws — mirrors `statsStorage.ts`) plus
      a no-op-default reactive Context in `src/ui/help/HelpSeenProvider.tsx` (`useHelpSeen()` → `{ seen,
      markSeen }`; default `seen: true` so provider-less consumers/App.test never auto-open; hydrates via
      `useState(() => readHelpSeen())`; persist-on-change — mirrors `StatsProvider`), wired into `main.tsx`
      (nested inside `StatsProvider`, inert until SPEC-060). **No help content, no sheet, no trigger, no
      auto-open** (those are SPEC-060). Authored **DEC-022** as part of design, pinning: first run = absence
      of a truthy `zany:help-seen` flag; one sheet, two entry points; degrade-to-not-seen; versioned blob;
      no-op default `seen: true`. Pure seam ⇒ no RTP/strip simulation; Failing Tests carry the deterministic
      storage contract (absent ⇒ false; round-trip true ⇒ true; corrupt/version/non-boolean ⇒ false; provider
      hydrates; `markSeen` flips + persists, idempotent). DEC-001 clean (`git diff src/engine/` must stay
      EMPTY); DEC-005 clean (localStorage, guarded). Complete drop-in code for both modules + the one-line
      `main.tsx` edit + all failing tests in the spec's Notes. Two adversarial guard-mutations specified for
      verify (drop the `version` check in `isValid`; flip the no-op default `seen` true→false). No new
      dependency. **[S]** Build prompt written.

- [~] **build** — LOCAL-ONLY (Sonnet, branch `feat/spec-059-first-run-seen-seam`): transcribe both drop-in
      modules + the `main.tsx` wiring; make the two test files pass; full gate green; `git diff main..HEAD --
      src/engine/` EMPTY; no new dep; only `src/ui/help/**` + the one `main.tsx` line touched. Fill Build
      Completion + append build cost. Do NOT push/PR/advance-cycle.

- [ ] **verify** — cold review: re-run the FULL gate; run both adversarial guard-mutations (each breaks
      EXACTLY its test, revert clean); confirm `git diff main..HEAD -- src/engine/` EMPTY and no stray drift
      outside `src/ui/help/**` + `main.tsx`; App.test still green.

- [ ] **ship** — fill build+verify cost; PR + CI-poll (CLEAN + all checks SUCCESS) + squash-merge; post-merge
      rollup (timeline ship [x], advance-cycle ship, STAGE-010 backlog SPEC-059 [x], brag, archive).
