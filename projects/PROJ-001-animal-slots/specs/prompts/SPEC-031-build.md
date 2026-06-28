# SPEC-031 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-031-reduced-motion-audit.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in
   CSS + test approach).
3. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md
4. /decisions/DEC-004, /decisions/DEC-010, /decisions/DEC-001.
5. /src/main.tsx, /src/styles/tokens.css, /src/ui/reels/reels.animation.test.ts (the
   CSS-contract pattern), /src/ui/audio/*.ts, /src/ui/App.tsx + App.test.tsx.
6. /guidance/constraints.yaml — respect-reduced-motion, test-before-implementation,
   one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-031 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-031-reduced-motion-audit

Implement EXACTLY the spec (Notes give drop-in CSS):
- src/styles/reduced-motion.css — the global @media (prefers-reduced-motion: reduce)
  safety net on *,*::before,*::after (animation-duration/iteration-count +
  transition-duration reduced; scroll-behavior auto). No colors (no hex).
- src/main.tsx — add `import './styles/reduced-motion.css';` right after the
  tokens.css import.
- src/ui/reduced-motion.contract.test.ts:
  * "every @keyframes CSS has a reduced-motion block" — discover all src/**/*.css via
    import.meta.glob('/src/**/*.css', { query: '?raw', eager: true }) (fall back to a
    Node fs recursive walk if needed); for each whose content has /@keyframes/, expect
    /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/; assert >=5 such files checked.
  * "a global reduced-motion safety net exists" — reduced-motion.css matches the
    reduced-motion media query AND /animation-duration/ AND /transition-duration/.
  * "audio is not motion-gated" — read each src/ui/audio/*.ts (exclude *.test.ts) via
    fs; assert none contain 'prefers-reduced-motion' or 'prefersReducedMotion'.
  * "App renders under reduced motion" — stub window.matchMedia to {matches:true,...}
    for the reduced-motion query; render(<App/>) does not throw and the Spin control
    is present; restore matchMedia in afterEach.
- Do NOT rewrite existing per-component reduced-motion blocks (they pass as-is). Only
  fix a gap if the sweep finds one (the design survey says there are none).
- Engine only via src/engine; do NOT modify engine. NO new dependency. Keep ALL
  existing tests green.

NO new DEC. This repo's ESLint has NO react-hooks plugin — no exhaustive-deps disable.
@testing-library/user-event is NOT installed — use render/fireEvent only.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. the Audit result line + 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-031).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
