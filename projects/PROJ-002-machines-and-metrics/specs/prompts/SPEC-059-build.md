# SPEC-059 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A PURE seam spec — two new leaf modules
> under `src/ui/help/`, plus a one-line `main.tsx` edit. No help content, no sheet, no engine change.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-059-first-run-seen-storage-and-seam.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes
   contain COMPLETE drop-in code for BOTH modules and the exact main.tsx edit. Implement it VERBATIM.
3. /decisions/DEC-022 (the onboarding model), DEC-001, DEC-005 (read only).
4. Source (read only, for the pattern): src/stats/statsStorage.ts, src/ui/stats/StatsProvider.tsx,
   src/ui/stats/StatsProvider.test.tsx (the renderHook/act/wrapper idiom), src/machines/activeMachineStorage.ts,
   src/main.tsx.

Before coding, branch and mark build [~] in the SPEC-059 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-059-first-run-seen-seam

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/help/helpSeenStorage.ts — HELP_SEEN_KEY='zany:help-seen', HELP_SEEN_VERSION=1,
  readHelpSeen(): boolean, writeHelpSeen(seen). Single versioned JSON blob { version, seen };
  absent/unparseable/wrong-version/non-boolean ⇒ false; guarded try/catch, never throws (mirror
  statsStorage.ts / activeMachineStorage.ts).
- src/ui/help/HelpSeenProvider.tsx — HelpSeenProvider, useHelpSeen(), HelpSeenContextValue.
  Mirror StatsProvider EXACTLY: no-op default context { seen: true, markSeen: () => {} };
  useState(() => readHelpSeen()) hydration; persist-on-change useEffect writing writeHelpSeen(seen);
  markSeen = useCallback(() => setSeen(true), []); value via useMemo.
- src/ui/help/helpSeenStorage.test.ts (plain .ts — no JSX) — make every storage test in the spec's
  Failing Tests pass; localStorage.clear() in beforeEach; never-throw case uses
  vi.spyOn(Storage.prototype, 'setItem').
- src/ui/help/HelpSeenProvider.test.tsx (.tsx — renderHook) — make every provider test pass; mirror
  StatsProvider.test.tsx (renderHook + act + { wrapper: HelpSeenProvider }; NO @testing-library/user-event).

Modified file (ONE line of wiring):
- src/main.tsx — import { HelpSeenProvider } and nest <HelpSeenProvider> INSIDE <StatsProvider>,
  wrapping <App />. Exactly as shown in the spec's Notes. It is inert until SPEC-060 consumes it.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — pure presentation seam).
- No new dependency. No new DEC (DEC-022 already authored at design). No help content, no sheet,
  no header trigger, no CSS, no auto-open — those are SPEC-060. Do NOT modify any file outside
  src/ui/help/ and the single main.tsx wiring line.
- App.test must stay GREEN unchanged: App is rendered WITHOUT providers, so useHelpSeen() there hits
  the no-op default (seen: true) — nothing auto-opens, nothing to update in App.test. (This spec adds
  no UI to App anyway.)

Repo toolchain gotchas: tsconfig include is ["src"]. jsdom provides localStorage (clear it per-test).
JSX test files MUST be .tsx. vi.fn() mock factories take NO named callback params. ESLint has no
react-hooks plugin. Match the repo's existing test style (see StatsProvider.test.tsx — vitest globals,
no user-event).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session note under the existing cost.sessions build entry: keep
   tokens_total: null with a "orchestrator to fill tokens_total from subagent_tokens" note,
   set recorded_at: <today>, add a one-line note.
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-059.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
