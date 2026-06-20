# SPEC-005 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). Copy the box into a fresh session, or
> the orchestrator launches it as a Sonnet sub-agent.

```
Cycle: build. You are NOT the architect who wrote this spec. The spec file is
your only context for WHAT to build.

Read files in order:
1. /AGENTS.md — conventions (esp. §5 stack, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-005-seedable-rng-mulberry32.md — the
   spec. Read the ENTIRE Implementation Context, Acceptance Criteria, Failing
   Tests, and Notes for the Implementer (it contains the exact mulberry32 code).
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001-engine-presentation-separation.md and
   /decisions/DEC-002-seedable-injected-rng.md.
5. /guidance/constraints.yaml — engine-no-dom, deterministic-rng,
   test-before-implementation, one-spec-per-pr.
6. /eslint.config.js — the engine-no-dom boundary your new module sits behind.

Before coding, branch and mark build `[~]` in
  projects/PROJ-001-animal-slots/specs/SPEC-005-seedable-rng-mulberry32-timeline.md
If something needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-005-seedable-rng

Implement (exactly the spec, nothing more):
- Create src/engine/rng.ts exporting:
    - type Rng = () => number;            // next float in [0, 1)
    - function createRng(seed: number): Rng;   // mulberry32 — use the exact code
      in the spec's "Notes for the Implementer".
    - function randomInt(rng: Rng, maxExclusive: number): number;  // validates
      maxExclusive >= 1 (else throw RangeError), then Math.floor(rng()*maxExclusive);
      consumes exactly ONE rng() draw.
- Create src/engine/rng.test.ts with ALL seven Failing Tests from the spec,
  including the pinned canonical fixtures (seed 12345 → first five floats via
  toBeCloseTo(_, 10); ten randomInt(rng,35) → [34,10,16,28,17,12,2,26,34,28]).
- NO bare Math.random() anywhere. NO React/DOM/`src/ui` imports. No new deps.

Verify locally (all must exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill the spec's "## Build Completion" (incl. the 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code; if a sub-agent, tokens_total null + "orchestrator to fill" note).
3. Run: just advance-cycle SPEC-005 verify
4. Open PR from feat/spec-005-seedable-rng (base main): Project PROJ-001, Stage
   STAGE-002, Spec SPEC-005, decisions (DEC-001, DEC-002), constraints, any new DEC.
5. Mark build `[x]` in the timeline with PR number, cost, and date.
```
