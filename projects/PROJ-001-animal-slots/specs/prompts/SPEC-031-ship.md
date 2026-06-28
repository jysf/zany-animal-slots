# SPEC-031 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #31 for SPEC-031 is approved (verified 2026-06-28).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-031-reduced-motion-audit.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-031-reduced-motion-audit-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-031-reduced-motion-audit-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #31)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #31:
  gh pr merge 31 --squash --delete-branch

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
   recorded_at: 2026-06-28,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
    (build and verify have null with "orchestrator to fill" notes — fill
     them in from the orchestrator's subagent_tokens for those two Agent
     calls before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-031 ship
- Run: just archive-spec SPEC-031  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-031: Reduced-motion audit — global safety net (reduced-motion.css) catching all future forgotten animations; regression-guard sweep test walks every src/**/*.css and fails if any @keyframes file lacks a reduced-motion block; 5/5 keyframes CSS files audited and compliant; audio confirmed not motion-gated; App renders under emulated reduced motion; no engine change, no new deps; 241/241 tests green (+4 tests); 4th of 7 SPECs in STAGE-005"

NOTE: This is NOT the last spec in STAGE-005 (4/7 — next specs are
contrast + 44px audit (SPEC-032), colorblind-safe cues (SPEC-033), and
perf pass (SPEC-034)).
Do NOT trigger a Stage Ship after archiving.
Continue with the next spec in the STAGE-005 backlog.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-004 (CSS animation + reduced-motion path; this spec adds
the global catch-all net consistent with that approach), DEC-010 (global CSS; the
new reduced-motion.css is token-free, satisfying no-raw-hex trivially), DEC-001
(engine unchanged; pure UI); no new DEC-* emitted by this build.
```
