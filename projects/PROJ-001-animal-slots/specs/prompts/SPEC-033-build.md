# SPEC-033 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-033-colorblind-safe-state-cues.md —
   the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (drop-in code).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-006, /decisions/DEC-010, /decisions/DEC-001.
5. /src/ui/reels/WinBadge.tsx + WinBadge.test.tsx, /src/ui/reels/win-badge.css,
   /src/ui/regions/Game.tsx + Game.test.tsx, /src/ui/useSlotMachine.ts (Celebration,
   WinTier), /src/styles/tokens.css, /src/ui/reels/reels.animation.test.ts.
6. /guidance/constraints.yaml — respect-reduced-motion, test-before-implementation,
   one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-033 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-033-colorblind-cues

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/reels/WinBadge.tsx — add optional `tier?: WinTier` (default 'small'); map
  small→'WIN', big→'BIG WIN', jackpot→'JACKPOT'; render `{WORD} +{amount}`; add
  `data-tier={t}` on the status div (coerce 'none'→'small'). Keep the null guards +
  role="status".
- src/ui/reels/win-badge.css — add `.win-badge[data-tier="small|big|jackpot"]`
  border-color rules using var(--color-win-small/--color-win-big/--color-jackpot).
  Tokens only, NO raw hex. (Keep the base .win-badge --color-coin border.)
- src/ui/regions/Game.tsx — pass `tier={celebration?.tier}` to <WinBadge>.
- Tests:
  * extend WinBadge.test.tsx: tier word per tier (jackpot→JACKPOT+2000, big→BIG WIN,
    small/omitted→WIN and not 'BIG'); data-tier reflects tier (big→"big", omitted→
    "small"); keep the existing null cases + the "contains 55" test (now WIN +55).
  * extend Game.test.tsx: jackpot celebration → badge text contains JACKPOT.
  * extend reels.animation.test.ts (or add a co-located win-badge contract): win-badge.css
    matches /--color-win-big/, /--color-jackpot/, /--color-win-small/ and has no raw hex.
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green (the no-tier WinBadge render must still pass).

NO new DEC. This repo's ESLint has NO react-hooks plugin — no exhaustive-deps disable.
@testing-library/user-event is NOT installed.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. the 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-033).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
