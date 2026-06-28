# SPEC-034 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #34 for SPEC-034 is approved (verified 2026-06-28).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-034-performance-pass-60fps.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-034-performance-pass-60fps-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-034-performance-pass-60fps-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #34)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #34:
  gh pr merge 34 --squash --delete-branch

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
- Run: just advance-cycle SPEC-034 ship
- Run: just archive-spec SPEC-034  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-034: Performance pass (~60fps) — compositor-only keyframe guard sweeps all 5 CSS animation files (reels, win-badge, particles, jackpot, paytable); every @keyframes uses only transform/opacity; will-change: transform added to .reel--spinning; perf-notes.md documents methodology + median 8.3ms / 0 long frames measurement with honest mid-tier-phone caveat; DEC-004 validated; engine untouched; no new deps; 252/252 tests green (+3 tests); 7th of 7 SPECs in STAGE-005"

NOTE: SPEC-034 is the LAST spec in STAGE-005 (7/7).
After archiving SPEC-034, STOP. Do NOT auto-advance to anything else.
Instead, OFFER the Stage Ship to the orchestrator by saying:

  "SPEC-034 is archived. STAGE-005 backlog is now complete (7/7 shipped).
  To close the stage, run the Stage Ship (Prompt 1d from FIRST_SESSION_PROMPTS.md).
  Shall I proceed, or would you like to review the stage first?"

The Stage Ship will: update STAGE-005 status to shipped, capture a stage-level
milestone brag, and position the project for STAGE-006 (Cloudflare Pages deploy).

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-004 (validated — CSS transforms hold ~60fps by
construction; no revisit), DEC-010 (reels.css remains token-only, no raw hex;
will-change is colorless), DEC-001 (engine untouched; pure presentation only);
no new DEC-* emitted by this build.
```
