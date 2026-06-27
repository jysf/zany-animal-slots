# SPEC-020 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/structure).
2. /projects/PROJ-001-animal-slots/specs/SPEC-020-paytable-sheet.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-001, /decisions/DEC-004, /decisions/DEC-006, /decisions/DEC-010, /decisions/DEC-011.
5. /src/engine/index.ts (PAYTABLE, SYMBOL_TIER, SYMBOLS, Tier), /src/ui/reels/symbols.ts
   (SYMBOL_DISPLAY), /src/ui/regions/Header.tsx, /src/ui/regions/regions.css,
   /src/styles/tokens.css.
6. /guidance/constraints.yaml — touch-targets-44, respect-reduced-motion, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-020 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-020-paytable-sheet

Implement EXACTLY the spec:
- src/ui/paytable.ts — paytableRows() returning per-tier rows in order
  jackpot/high/mid/low with {tier,label,emoji[],multipliers}, multipliers = PAYTABLE[tier]
  (from the engine, NOT hard-coded), emoji from SYMBOL_DISPLAY filtered by SYMBOL_TIER.
- src/ui/PaytableSheet.tsx — self-contained: own open state; an "ℹ Paytable" trigger
  (aria-label "Paytable", ≥44px) always rendered; when open an overlay with a backdrop
  (click closes) + a role="dialog" aria-modal sheet (accessible name) listing the rows +
  a "× total bet" note + a ✕ close button (aria-label "Close"); Esc closes (keydown
  effect while open); focus the close button on open; stop propagation on the sheet.
- src/ui/paytable.css — trigger + backdrop + slide-up sheet (@keyframes translateY) +
  @media (prefers-reduced-motion: reduce) fallback. Tokens, NO raw hex.
- Header.tsx renders <PaytableSheet/>; regions.css `.cabinet { position: relative }`.
- Tests: paytable.test.ts (4 tiers in order; per-tier multipliers = DEC-011 values;
  emoji per tier; multipliers deep-equal PAYTABLE[tier]) AND PaytableSheet.test.tsx
  (closed by default; opens on trigger → dialog shows 200 + 0.5 + emoji; ✕ closes;
  backdrop closes; Esc closes — use fireEvent).
- Engine only via src/engine; do NOT modify engine code. No new deps. Keep ALL existing tests green.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
