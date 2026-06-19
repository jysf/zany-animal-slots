# SPEC-004 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). Copy the box into a fresh session, or
> the orchestrator launches it as a Sonnet sub-agent.

```
Cycle: build. You are NOT the architect who wrote this spec. The spec file is
your only context.

Read files in order:
1. /AGENTS.md — conventions (esp. §5 stack, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-004-desktop-device-frame.md — the
   spec. Read the ENTIRE "## Implementation Context", Acceptance Criteria, and
   Failing Tests.
3. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md
4. /decisions/DEC-001-engine-presentation-separation.md and
   /decisions/DEC-010-global-css-styling-approach.md.
5. /src/ui/App.tsx, /src/ui/regions/regions.css — the SPEC-003 cabinet to wrap.
6. /src/styles/tokens.css, /src/styles/tokens.test.ts — tokens to extend.
7. /guidance/constraints.yaml — portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in
  projects/PROJ-001-animal-slots/specs/SPEC-004-desktop-device-frame-timeline.md
If something needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-004-desktop-device-frame

Implement (exactly the spec, nothing more):
- Add to tokens.css: a small radius scale + `--radius-frame`, and `--shadow-frame`
  (a complete box-shadow value; its rgba lives in the token so consuming CSS
  stays color-literal-free). Extend tokens.test.ts's required-token list with
  `--radius-frame` and `--shadow-frame`.
- Create a frame stylesheet (src/ui/device-frame.css) with `.device-stage` rules:
  at PHONE widths (default, NO media query) it adds no layout — the cabinet fills
  the viewport exactly as SPEC-003. Behind `@media (min-width: 640px)` (desktop):
  `.device-stage` is a full-viewport flex center with an ambient backdrop token,
  and `.cabinet` gets border-radius var(--radius-frame), box-shadow
  var(--shadow-frame), overflow hidden, and a bounded phone-shaped height
  (e.g. height: min(92dvh, 880px); min-height: 0). NO raw hex in this file.
- Wrap the cabinet in App.tsx: <div className="device-stage"><div className="cabinet">…</div></div>;
  import the frame CSS. Do NOT change the cabinet interior or the SPEC-003 regions.
- Satisfy ALL Failing Tests: the device-stage wrapper structure test (App.test.tsx),
  the frame CSS-contract test (device-frame.test.ts: has a min-width @media, uses
  var(--radius-frame)/var(--shadow-frame), no hex), and the extended tokens.test.ts.
- DO NOT touch the phone layout, add controls/reels/engine/animation/audio, build
  skeuomorphic device chrome, or add dependencies (if you think you need one, STOP).

Verify locally: just typecheck && just lint && just test && just build
Then visually check at phone (375px) and desktop widths — phone must look
identical to SPEC-003; desktop must show the framed, centered cabinet.

When done:
1. Fill the spec's "## Build Completion" (incl. the 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code; if a sub-agent, tokens_total null + "orchestrator to fill" note).
3. Run: just advance-cycle SPEC-004 verify
4. Open PR from feat/spec-004-desktop-device-frame (base main): Project PROJ-001,
   Stage STAGE-001, Spec SPEC-004, decisions (DEC-001, DEC-010), constraints, any new DEC.
5. Mark build `[x]` in the timeline with PR number, cost, and date.
```
