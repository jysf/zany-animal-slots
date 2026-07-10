# SPEC-060 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A pure-UI spec — one new component + CSS + test
> under `src/ui/help/`, a one-line `Header.tsx` edit, and a two-line touch-target-test edit. No engine
> change, no new dependency, no change to the SPEC-059 seam.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-060-help-sheet-ui-and-header-trigger.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes
   contain COMPLETE drop-in code for the component, the CSS, the test, the Header edit, and the
   touch-target-test edit. Implement it VERBATIM.
3. /decisions/DEC-022 (the onboarding model), DEC-001, DEC-005, DEC-010, DEC-004 (read only).
4. Source (read only, for the pattern): src/ui/stats/StatsSheet.tsx, src/ui/stats/stats.css,
   src/ui/stats/StatsSheet.test.tsx, src/ui/PaytableSheet.tsx, src/ui/paytable.css,
   src/ui/help/HelpSeenProvider.tsx (the seam consumed), src/ui/regions/Header.tsx,
   src/ui/controls.touch-target.test.ts.

Before coding, branch and mark build [~] in the SPEC-060 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-060-help-sheet-ui

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/help/HelpSheet.tsx — the named export `HelpSheet` (no props). Self-contained trigger +
  slide-up sheet mirroring StatsSheet: own `open` state, backdrop, Esc, focus-close-on-open,
  role="dialog" aria-modal aria-label="How to play". The ONLY new behaviour is the first-run
  auto-open: `const [open, setOpen] = useState(() => !seen)` reading useHelpSeen(), and `close()`
  calls `markSeen()` (mark on first dismiss — idempotent). Static how-to-play copy exactly as in
  the drop-in (goal, four controls, where-things-are, play-money disclaimer; data-testid on
  help-goal / help-disclaimer / help-backdrop; U+2212 minus `−` in the "− / +" term).
- src/ui/help/help.css — token-only, help__-prefixed, mirroring stats.css; MUST include the
  `@keyframes help-slide-up` AND a `@media (prefers-reduced-motion: reduce)` block that drops it
  (the reduced-motion contract test auto-sweeps every @keyframes file). Trigger + close ≥44px
  (min-height/min-width: var(--space-7)).
- src/ui/help/HelpSheet.test.tsx (.tsx — render/fireEvent, NO @testing-library/user-event) — make
  every test in the spec's Failing Tests pass; localStorage.clear() in beforeEach.

Modified files:
- src/ui/regions/Header.tsx — import { HelpSheet } from '../help/HelpSheet' and render <HelpSheet />
  as the LAST item in .cabinet__header-controls. Exactly as shown in the spec's Notes.
- src/ui/controls.touch-target.test.ts — add a HELP_CSS fixture + a `.help__trigger` entry to the
  CONTROLS array (mirror the two `.stats__trigger` lines). Exactly as shown in the spec's Notes.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — pure presentation, static copy).
- `git diff main..HEAD -- src/ui/help/HelpSeenProvider.tsx src/ui/help/helpSeenStorage.ts` MUST be
  EMPTY (consume the SPEC-059 seam as-is; do NOT touch it).
- No new dependency. No new DEC (DEC-022 already authored at SPEC-059 design). No re-listing of
  paytable payouts — the sheet POINTS to the Paytable. Do NOT modify any file outside
  src/ui/help/ + the single Header.tsx line + the touch-target test edit.
- App.test must stay GREEN unchanged: App is rendered WITHOUT providers, so HelpSheet's useHelpSeen()
  hits the no-op default (seen: true) ⇒ open:false ⇒ nothing auto-opens, no dialog. Do NOT wrap
  App.test. Verify `just test` shows App.test still green.

Repo toolchain gotchas: tsconfig include is ["src"]. jsdom provides localStorage (clear it per-test).
JSX test files MUST be .tsx. ESLint has NO react-hooks plugin (no exhaustive-deps disables — the
StatsSheet effects deliberately depend only on [open]; mirror that). Token-only CSS, no raw hex
(DEC-010). Match the repo's existing test style (see StatsSheet.test.tsx — vitest globals, no
user-event).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session note under a NEW cost.sessions build entry: keep tokens_total: null
   with an "orchestrator to fill tokens_total from subagent_tokens" note, set recorded_at: <today>,
   add a one-line note.
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-060.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
