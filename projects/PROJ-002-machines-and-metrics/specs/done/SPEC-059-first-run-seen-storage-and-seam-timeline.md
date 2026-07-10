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

- [x] **build** — completed 2026-07-09 (Sonnet, branch `feat/spec-059-first-run-seen-seam`, LOCAL ONLY):
      transcribed both drop-in modules + the `main.tsx` wiring verbatim; all 12 Failing Tests pass (8
      storage + 4 provider); full gate green (typecheck/lint/test 71 files/420 tests/build/validate/
      cost-audit); `git diff main..HEAD -- src/engine/` EMPTY; no new dep; only `src/ui/help/**` + the one
      `main.tsx` line touched. Build Completion filled + build cost appended. No push/PR/advance-cycle.

- [x] **verify** — completed 2026-07-09 (Opus, cold review): reconciled the build against git/disk (both
      modules byte-for-byte the spec drop-ins; the main.tsx wiring nests HelpSeenProvider inside StatsProvider;
      only `src/ui/help/**` + `main.tsx` + spec bookkeeping changed). Re-ran the FULL gate green (typecheck/
      lint/test **420/420**/build/validate/cost-audit). Ran both adversarial guard-mutations — each broke
      EXACTLY its target test and reverted clean (12/12 help tests green after): drop the `version` clause in
      `isValid` → broke "version mismatch"; flip the no-op default `seen` true→false → broke "without a
      provider returns seen:true". `git diff main..HEAD -- src/engine/` EMPTY; no `.only/.skip`. Defects: 0.

- [x] **ship** — shipped 2026-07-09 via PR #69 (squash-merged to main, commit `aa783a8`). CI CLEAN, all
      checks SUCCESS (app checks, cost-capture, supply-chain, Workers Build). Post-merge: cycle → ship,
      STAGE-010 backlog SPEC-059 [x], archived. First spec of STAGE-010 (Help / how-to-play). Cost: build
      93769 tok (Sonnet sub-agent) + verify 90000 (nominal main-loop) = 183769; 4 sessions. Next: SPEC-060
      (HelpSheet UI + "How to play" header trigger + first-run auto-open) — the last spec in the backlog.
