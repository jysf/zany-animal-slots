# SPEC-002 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8: build/verify on Sonnet). Copy the box
> into a fresh session, or the orchestrator launches it as a Sonnet sub-agent.

```
Cycle: build. You are NOT the architect who wrote this spec. The spec file is
your only context.

Read files in order:

1. /AGENTS.md — conventions (esp. §5 stack, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-002-design-token-sheet.md — the
   spec. Read the ENTIRE "## Implementation Context" section, the Acceptance
   Criteria (the required token list is the contract), and the Failing Tests.
3. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md
   — the stage (Design Notes: tokens are the single source of truth).
4. /projects/PROJ-001-animal-slots/brief.md — the project + theme.
5. /decisions/DEC-001-engine-presentation-separation.md.
6. /guidance/constraints.yaml — test-before-implementation, one-spec-per-pr.

Before coding, create the branch and mark the build cycle `[~]` in
  projects/PROJ-001-animal-slots/specs/SPEC-002-design-token-sheet-timeline.md
If you hit something needing architect judgment (ambiguous contract, scope
drift), change it to `[?]` with a one-line reason and stop — don't guess.

Branch: git checkout -b feat/spec-002-design-token-sheet

Implement:
- Create src/styles/tokens.css: a :root block declaring ALL the required tokens
  in the spec's Acceptance Criteria (color, type scale, spacing), each with a
  non-empty value, plus a short header comment documenting the taxonomy
  (--<category>-<name>). Use the Wild & Whimsical campfire starter palette in
  "Notes for the Implementer" (tune freely, but every required token name must
  exist and resolve to a non-empty value). rem units; system font stacks (no
  external web font).
- Add `import './styles/tokens.css'` to src/main.tsx (single global import).
- Create src/styles/tokens.test.ts to satisfy the three Failing Tests (parse
  the CSS source + check the main.tsx import; do NOT write a jsdom
  getComputedStyle resolution test — jsdom can't back it).
- DO NOT restyle App.tsx or build any layout/components — out of scope
  (SPEC-003/004). No engine code. No new dependencies (if you think you need
  one, STOP and ask). No radius/shadow/motion tokens this spec.

Verify locally before the PR:
  just typecheck && just lint && just test && just build

When done:
1. Fill the spec's "## Build Completion" (incl. the 3 build-phase reflection
   questions — honest answers).
2. Append a build cost session to cost.sessions:

     - cycle: build
       agent: claude-sonnet-4-6
       interface: claude-code
       tokens_total: <real number — /cost, or orchestrator fills from subagent_tokens>
       estimated_usd: <best estimate>
       duration_minutes: <estimate>
       recorded_at: <YYYY-MM-DD>
       notes: <one line if unusual, else null>

   (If run as a sub-agent: set tokens_total null with a note that the
   orchestrator fills it from subagent_tokens.)
3. Run: just advance-cycle SPEC-002 verify
4. Open PR from feat/spec-002-design-token-sheet (base main). PR description:
   Project PROJ-001, Stage STAGE-001, Spec SPEC-002, decisions (DEC-001),
   constraints checked, any new DEC-* (likely none).
5. Mark build `[x]` in the timeline with PR number, cost, and date.
```
