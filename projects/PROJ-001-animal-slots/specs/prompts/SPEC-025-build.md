# SPEC-025 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-025-wolf-jackpot-moment.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in
   component + CSS).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-004, /decisions/DEC-006, /decisions/DEC-010, /decisions/DEC-001.
5. /src/ui/App.tsx, /src/ui/App.test.tsx, /src/ui/regions/regions.css (.cabinet has
   position: relative), /src/ui/useSlotMachine.ts (Celebration), /src/ui/reels/
   WinBadge.tsx + win-badge.css, /src/styles/tokens.css.
6. /guidance/constraints.yaml — respect-reduced-motion, perf-60fps, portrait-first,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-025 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-025-jackpot-moment

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/JackpotMoment.tsx — the component + exported JACKPOT_MOMENT_MS (3500).
  Visible state + setTimeout auto-dismiss in a useEffect keyed on [id, isJackpot];
  return null unless tier==='jackpot' && visible; root role="status" + aria-label,
  pointer-events handled in CSS. NO prefersReducedMotion() JS check (CSS @media
  handles motion; the scene shows for everyone).
- src/ui/jackpot.css — .jackpot-moment overlay (absolute inset 0, z-index 20,
  pointer-events none), __sky/__moon/__wolf/__banner, the keyframes (transform/
  opacity), and a @media (prefers-reduced-motion: reduce) block. Tokens only, NO
  raw hex (use --color-jackpot-sky at full opacity + element opacity for the tint;
  --color-jackpot / --color-coin for the banner). Raw rem/px for the one-off scene
  sizes is fine — only hex colors are forbidden.
- src/ui/App.tsx — render <JackpotMoment celebration={celebration} /> inside the
  .cabinet div (App already destructures celebration).
- Tests: JackpotMoment.test.tsx (the 6 cases incl. CSS-contract reading jackpot.css;
  fake timers; import JACKPOT_MOMENT_MS; cover non-jackpot tiers render nothing,
  jackpot renders 🌕/🐺/JACKPOT + role=status, auto-dismiss after JACKPOT_MOMENT_MS,
  re-show on new id). Existing App tests must still pass (no jackpot in the default
  random app render → no overlay).
- Engine only via src/engine; do NOT modify engine code. No new deps. Keep ALL
  existing tests green.

NO new DEC — DEC-004/006/010 cover this.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-025).
DO NOT git push / open a PR / run gh / run just advance-cycle.

NOTE: this repo's ESLint has NO react-hooks plugin — do NOT add an
`// eslint-disable-line react-hooks/exhaustive-deps` directive (it will be flagged);
just write the intended deps and a normal code comment if needed.
```
