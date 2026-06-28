# SPEC-024 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #24 for SPEC-024 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-024-win-particle-burst.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-024-win-particle-burst-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-024-win-particle-burst-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #24)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #24:
  gh pr merge 24 --squash --delete-branch

After merge, answer the three Reflection (Ship) questions below and
paste your answers where indicated in the spec's "## Reflection (Ship)" section:

1. What would I do differently next time?
   [REPLACE: answer]

2. Does any template, constraint, or decision need updating?
   [REPLACE: answer]

3. Is there a follow-up spec to write before I forget?
   [REPLACE: answer]

After you have the answers:
- Format as ## Reflection (Ship) block in the spec
- Append a ship cost session entry to `cost.sessions` in the spec
  (cycle: ship, agent: <your model>, interface: claude-code,
   tokens_total: null, estimated_usd: null, duration_minutes: <estimate>,
   recorded_at: 2026-06-27,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-024 ship
- Run: just archive-spec SPEC-024  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-024: win particle burst — 🍂/🌰 leaves/acorns erupt from the reel centre on a win, count scaled by tier (small: 10, big: 20, jackpot: 32) via PARTICLE_COUNTS map; each particle flies outward on randomized trajectories expressed as inline CSS custom properties (--p-dx, --p-dy, --p-rot, --p-delay) driving a CSS @keyframes particle-fly (transform/opacity only, GPU-composited per DEC-004); burst is aria-hidden + pointer-events: none (decorative); keyed on celebration.id (SPEC-021) so each distinct win fires once and replays correctly; trajectories memoized via useMemo([id, count]) placed before the early return for stable hook order; renders nothing under prefers-reduced-motion (DEC-004, respect-reduced-motion); token-only CSS, no raw hex (DEC-010), 🍂/🌰 emoji art (DEC-006); engine untouched (DEC-001); no new deps; 175/175 tests green (+8 tests); sixth STAGE-004 spec"
- THIS IS NOT THE LAST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-025 (wolf jackpot moment), SPEC-026 (mute toggle),
  SPEC-027 (tier-scaled jingle).
  Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — burst size driven
by celebration.tier from the engine's SpinResult; no engine change, no game math;
engine directory untouched; UI imports only via src/engine/index.ts), DEC-004
(CSS keyframe animation — particle-fly uses transform/opacity only, GPU-composited;
renders nothing under reduced motion; CSS @media block as belt-and-suspenders),
DEC-006 (🍂 🌰 emoji art consistent with symbol set; zero asset pipeline),
DEC-010 (global CSS + design tokens — particles.css with .particle-burst /
.particle class names; all values use var(--token), no raw hex).
All honored; no new DEC-* emitted by this build.
```
