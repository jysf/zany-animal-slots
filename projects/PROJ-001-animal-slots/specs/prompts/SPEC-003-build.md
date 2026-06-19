# SPEC-003 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). Copy the box into a fresh session, or
> the orchestrator launches it as a Sonnet sub-agent.

```
Cycle: build. You are NOT the architect who wrote this spec. The spec file is
your only context.

Read files in order:
1. /AGENTS.md — conventions (esp. §5 stack, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-003-four-region-layout.md — the
   spec. Read the ENTIRE "## Implementation Context", the Acceptance Criteria,
   and the Failing Tests.
3. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md
4. /projects/PROJ-001-animal-slots/brief.md — theme.
5. /decisions/DEC-001-engine-presentation-separation.md and
   /decisions/DEC-010-global-css-styling-approach.md.
6. /docs/architecture.md (module layout: src/ui/regions/).
7. /src/styles/tokens.css — the tokens to consume.
8. /guidance/constraints.yaml — portrait-first, touch-targets-44,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in
  projects/PROJ-001-animal-slots/specs/SPEC-003-four-region-layout-timeline.md
If something needs architect judgment (ambiguous structure, scope drift), set
`[?]` with a one-line reason and stop — don't guess.

Branch: git checkout -b feat/spec-003-four-region-layout

Implement (exactly the spec, nothing more):
- Four region components under src/ui/regions/ (Header, Game, Status, Action),
  presentational and EMPTY (placeholders only).
- A global layout stylesheet (src/ui/regions/regions.css) consuming tokens via
  var(--…), prefixed class names (DEC-010). NO raw hex color literals.
- Restructure src/ui/App.tsx to compose the cabinet (full-height flex column,
  Game flex:1), import the layout CSS. Semantics: Header=<header> (banner) with
  <h1>Animal Slots</h1>; Game=<main>; Status=<section aria-label="Status">;
  Action=<section aria-label="Controls">.
- Update src/ui/App.test.tsx for the new four-region structure, and add
  src/styles/layout.test.ts (token-usage contract) — satisfy ALL Failing Tests.
- Reserve the Action row sized for future ≥44px controls. Center the cabinet
  with a sensible max-width on desktop, but DO NOT build the device frame
  (SPEC-004). NO reels/controls/balance, no engine, no animation, no audio.
- No new dependencies (if you think you need one, STOP and ask — note: tests
  read files via fs, and @types/node is already installed per DEC-009).

Verify locally before the PR: just typecheck && just lint && just test && just build

When done:
1. Fill the spec's "## Build Completion" (incl. the 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6,
   interface: claude-code; if a sub-agent, tokens_total null + note "orchestrator
   to fill from subagent_tokens").
3. Run: just advance-cycle SPEC-003 verify
4. Open PR from feat/spec-003-four-region-layout (base main): Project PROJ-001,
   Stage STAGE-001, Spec SPEC-003, decisions (DEC-001, DEC-010), constraints,
   any new DEC.
5. Mark build `[x]` in the timeline with PR number, cost, and date.
```
