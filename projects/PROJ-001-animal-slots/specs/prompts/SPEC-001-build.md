# SPEC-001 — BUILD prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are the implementer,
> not the architect. The spec is your only context.

```
Cycle: build. You are NOT the architect who wrote this spec. The spec file is
your only context.

Read files in order:

1. /AGENTS.md — conventions (esp. §5 stack, §6 commands, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-001-project-scaffold-and-tooling.md
   — the spec. Read the ENTIRE "## Implementation Context" section carefully.
3. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md
   — the stage.
4. /projects/PROJ-001-animal-slots/brief.md — the project.
5. /decisions/DEC-001-engine-presentation-separation.md and
   /decisions/DEC-004-css-animation-not-canvas.md — the referenced decisions.
6. /docs/architecture.md — the authoritative module layout to create.
7. /guidance/constraints.yaml — esp. engine-no-dom, test-before-implementation,
   no-new-top-level-deps-without-decision, license-policy, one-spec-per-pr.

Before coding, create the branch and mark the build cycle `[~]` in
  projects/PROJ-001-animal-slots/specs/SPEC-001-project-scaffold-and-tooling-timeline.md
so anyone checking can see this cycle is live. If you hit something needing
architect judgment or an external unblock (constraint unclear, scope drift),
change it to `[?]` with a one-line reason and stop. `[?]` is NOT a "I don't
know what to do" dump — ask first if unsure.

Branch: git checkout -b feat/spec-001-project-scaffold-and-tooling

Implement:
- Make the two Failing Tests in the spec pass:
  * src/ui/App.test.tsx — App renders a <main> landmark named "Animal Slots".
  * src/test/engine-boundary.test.ts — the ESLint Node API confirms the
    engine-no-dom rule errors on a React import from src/engine/** and allows a
    clean engine module.
- Stand up Vite + React 18 + TypeScript (strict), Vitest (jsdom) + RTL, ESLint
  flat config (with the engine-no-dom no-restricted-imports rule scoped to
  src/engine/**) + Prettier, per AGENTS §5/§6 and docs/architecture.md.
- package.json scripts MUST be named: dev, build, preview, test, lint, typecheck
  (the just recipes wrap these).
- Create the directory skeleton: src/engine/ (empty + .gitkeep, guarded),
  src/ui/ (App.tsx + main.tsx), src/styles/ (empty + .gitkeep).
- Add a CI `app-checks` job to .github/workflows/ci.yml (npm ci, lint,
  typecheck, test, build) WITHOUT disturbing the existing cost-data job.
- Keep App.tsx bare — tokens (SPEC-002), layout (SPEC-003), device frame
  (SPEC-004), and all engine/game/audio code are OUT OF SCOPE.
- The baseline stack in the spec does NOT need a per-package DEC. If you add ANY
  dependency beyond that baseline, STOP and emit DEC-008 justifying it (honest
  confidence) before continuing.
- Don't violate constraints. If one must break, STOP and ask.
- If ambiguous, STOP and ask. Don't guess.

Verify locally before opening the PR:
  just typecheck && just lint && just test && just build

When done:
1. Fill in the spec's "## Build Completion" section INCLUDING the three
   build-phase reflection questions. Not optional.
2. Append a build cost session entry to the spec's cost.sessions:

     - cycle: build
       agent: <your model>
       interface: <claude-code | claude-ai | api | ollama | other>
       tokens_input: <best available>
       tokens_output: <best available>
       estimated_usd: <best available>
       duration_minutes: <estimate>
       recorded_at: <YYYY-MM-DD>
       notes: <one line if rework or unusual, else null>

   In Claude Code: run /cost, use its numbers. API: the usage object.
3. Run: just advance-cycle SPEC-001 verify
4. Open PR from feat/spec-001-project-scaffold-and-tooling.
5. PR description: Project PROJ-001, Stage STAGE-001, Spec SPEC-001, decisions
   used (DEC-001, DEC-004), constraints checked, any new DEC-* files.
6. Mark build `[x]` in the timeline with PR number, cost, and date.
```
