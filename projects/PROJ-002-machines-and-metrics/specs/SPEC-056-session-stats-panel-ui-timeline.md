# SPEC-056 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-056-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-08 (Opus): the **first player-visible surface** of STAGE-009 — an
      in-app session-stats panel (`src/ui/stats/StatsSheet.tsx`) that mirrors `PaytableSheet` (SPEC-020)
      1:1 for the trigger + backdrop + slide-up sheet + Esc/focus/close idiom, opened from a
      cabinet-header trigger. It reads the reactive stats from `useStats()` (SPEC-055) and derives the
      display metrics via `deriveMetrics()` (SPEC-054, DEC-020), rendering **five metric tiles** —
      spins, win rate (`Math.round(winRate*100)`+"%"), net winnings (signed `+N`/`0`/`-N`), cash-ins,
      and biggest win (amount + producing machine name·tier, "—" when none) — plus a **"Clear stats"**
      button calling `resetStats()`, which is DISTINCT from the wallet Reset (the DEC-020/SPEC-055
      invariant: wallet Reset is a *counted* cash-in, not a stats clear). Pinned the DISPLAYED metric
      strings by hand against the shipped `deriveMetrics()`: SEEDED { spins 10, winningSpins 4,
      wagered 100, won 130, biggest {40, wild-and-whimsical, small}, cashIns 2 } ⇒ spins "10", winrate
      "40%", net "+30", cashins "2", biggest "40"; empty ⇒ winrate "0%", net "0", biggest "—". Pure
      presentation — **no new DEC** (DEC-001 engine untouched; DEC-010 token-only CSS, no raw hex;
      ≥44px trigger/close/clear added to the touch-target guard; `prefers-reduced-motion` fallback).
      Sparkline explicitly deferred to SPEC-057. Complete drop-in `StatsSheet.tsx` + `stats.css` +
      `StatsSheet.test.tsx` (6 tests) + the `Header.tsx` and touch-target-guard edits in the spec's
      Notes. Four adversarial guard-mutations specified for verify (drop the net `+` sign, no-op the
      Clear onClick, render "0" instead of "—" empty-state, drop `.stats__trigger` min-width). **[M]**
      Build prompt written to `prompts/SPEC-056-build.md`.
- [x] **build** — completed 2026-07-08 (Sonnet, claude-code, local-only, branch feat/spec-056-session-stats-panel):
      transcribed the spec's drop-in `StatsSheet.tsx` + `stats.css` + `StatsSheet.test.tsx` (6 new
      tests) verbatim, plus the `Header.tsx` mount (import + `<StatsSheet />` after `<PaytableSheet
      />`) and the `controls.touch-target.test.ts` `STATS_CSS` fixture + `.stats__trigger` /
      `.stats__clear` `CONTROLS` entries. Full gate green: typecheck, lint, test (68 files / 401
      tests, all passing), build, validate, cost-audit. `git diff main..HEAD -- src/engine/` empty
      (DEC-001). No deviations, no new DEC.
- [x] **verify** — completed 2026-07-08 (Sonnet, cold review): full gate re-run green (typecheck,
      lint, test — 68 files / 401 tests, build, validate, cost-audit — all exit 0). All 4 spec'd
      adversarial guard-mutations broke exactly their target test(s) then reverted clean: (a) dropping
      the `+` in `formatNet` failed only "opens on trigger click and shows the metric tiles" ('30' ≠
      '+30'); (b) no-op'ing the Clear-stats `onClick` failed only "Clear stats zeroes the record and
      persists emptyStats"; (c) rendering "0" instead of "—" in the biggest-win empty branch failed
      both "shows an em dash for biggest win in the empty state" AND "Clear stats zeroes the record"
      (expected — both assert the same empty-branch render); (d) removing `.stats__trigger`
      min-width failed the touch-target guard's single assertion. `git status` clean and `just test`
      full green after each revert. Boundary diffs against main all empty: `src/engine/`, `src/stats/`,
      `src/ui/stats/StatsProvider.tsx`, `package.json`; no raw hex in `stats.css`; no `.only`/`.skip`/
      `xit` in `StatsSheet.test.tsx`. Sanity checks: `StatsSheet` reads `useStats()` (no private copy);
      `resetStats` is the SPEC-055 context action (`setStats(emptyStats())`), fully decoupled from the
      wallet reset in `useSlotMachine` (no `.reset()` call in `StatsSheet.tsx`); em dash in component
      and test both U+2014; `App.test.tsx` passes unwrapped (no-op `StatsContext` default, real
      `StatsProvider` mount lives in `main.tsx`); trigger/close/clear all declare `min-height` +
      `min-width` ≥44px. Preview check: dev server started via `.claude/launch.json`, clicked the
      "📊 Stats" header trigger, `role="dialog"` "Session stats" opened showing all five tiles (spins,
      win rate, net winnings, cash-ins, biggest win "—") and the "Clear stats" button, screenshot
      taken, closed via ✕ and confirmed the trigger returned — server stopped after. Defect count: 0.
