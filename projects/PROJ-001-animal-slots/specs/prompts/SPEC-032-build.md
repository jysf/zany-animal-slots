# SPEC-032 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-032-contrast-and-touch-target-audit.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (it gives the exact one-line token fix + the WCAG helper + the test approach).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-010, /decisions/DEC-001.
5. /src/styles/tokens.css, /src/ui/regions/controls.css, /src/ui/audio/audio.css,
   /src/ui/paytable.css, /src/ui/regions/regions.css.
6. /guidance/constraints.yaml — touch-targets-44, portrait-first,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-032 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-032-contrast-touch-audit

Implement EXACTLY the spec:
- src/styles/tokens.css — change the ONE line `--_raw-muted: #b89a6e;` to
  `--_raw-muted: #ccb084;` (the contrast fix). Touch NOTHING else.
- src/styles/contrast.test.ts — inline WCAG luminance+contrast helpers (no dep);
  parse tokens.css (read via fs): raw['--_raw-X']=#hex via /--(_raw-[a-z]+):\s*(#[0-9a-fA-F]{6})/;
  semantic['--color-Y']=raw[...] via /--(color-[a-z-]+):\s*var\(--(_raw-[a-z]+)\)/.
  Assert: --color-text-muted resolves to #ccb084; every real text/bg pair meets AA
  (normal ≥4.5, large/display ≥3.0) — incl. muted/frame ≥4.5, muted/surface, muted/bg,
  text/bg, text/surface, coin/surface, accent/surface (3.0 large title), accent/bg
  (≈ spin-btn bg-on-accent), jackpot/jackpot-sky; AND a "load-bearing" assertion that
  contrast('#b89a6e', frameHex) < 4.5 (proves the guard isn't vacuous).
- src/ui/controls.touch-target.test.ts — read the CSS files via fs; for each
  {file, selector} in [{controls.css,.spin-btn},{.bet-btn},{.auto-btn},{.reset-btn},
  {audio.css,.mute-toggle},{paytable.css,.paytable__trigger}], slice the selector's
  rule block and assert it has BOTH a min-height and a min-width with a 44px-equivalent
  value (2.75rem / 44px / var(--space-7)).
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green (the lighter muted must not break any existing snapshot/text test).

NO new DEC. This repo's ESLint has NO react-hooks plugin — no exhaustive-deps disable.
@testing-library/user-event is NOT installed — fs/regex tests only here.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" — INCLUDING the "Audit result" line (the contrast pairs +
   the muted fix + 44px confirmation) + 3 honest reflection answers.
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-032).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
