# SPEC-024 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-024-win-particle-burst.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in
   component + CSS).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-004, /decisions/DEC-006, /decisions/DEC-010, /decisions/DEC-001.
5. /src/ui/regions/Game.tsx + Game.test.tsx, /src/ui/reels/WinBadge.tsx +
   win-badge.css, /src/ui/prefersReducedMotion.ts, /src/ui/useSlotMachine.ts
   (Celebration), /src/styles/tokens.css, /src/ui/regions/regions.css.
6. /guidance/constraints.yaml — respect-reduced-motion, perf-60fps, portrait-first,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-024 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-024-particle-burst

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/reels/ParticleBurst.tsx — the component + exported PARTICLE_COUNTS
  (small:10, big:20, jackpot:32). useMemo trajectories keyed on [id,count] BEFORE
  the early return; return null when !celebration || count===0 ||
  prefersReducedMotion(); container + particles aria-hidden; key the container on
  celebration.id. Use UI Math.random() for trajectory (fine — engine determinism
  governs src/engine only).
- src/ui/reels/particles.css — .particle-burst (absolute overlay, z-index 8,
  pointer-events none), .particle, @keyframes particle-fly (transform/opacity), and
  a @media (prefers-reduced-motion: reduce) block. Tokens only, NO raw hex.
- src/ui/regions/Game.tsx — render <ParticleBurst celebration={celebration} /> inside
  .cabinet__game (sibling of ReelGrid + WinBadge). NO App change (Game already gets
  celebration from SPEC-023).
- Tests: ParticleBurst.test.tsx (the 7 cases incl. CSS-contract; import
  PARTICLE_COUNTS, don't hard-code numbers; reduced-motion via window.matchMedia
  matches:true + restore in afterEach), extend Game.test.tsx (burst on a win →
  PARTICLE_COUNTS.small particles; none without celebration).
- Engine only via src/engine; do NOT modify engine code. No new deps. Keep ALL
  existing tests green (15 role=img cells unchanged; particles are aria-hidden).

NO new DEC — DEC-004/006/010 cover this.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-024).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
