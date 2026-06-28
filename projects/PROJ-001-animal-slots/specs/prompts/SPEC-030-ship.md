# SPEC-030 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #30 for SPEC-030 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-030-dynamic-mixing.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-030-dynamic-mixing-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-030-dynamic-mixing-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #30)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #30:
  gh pr merge 30 --squash --delete-branch

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
    (build and verify have null with "orchestrator to fill" notes — fill
     them in from the orchestrator's subagent_tokens for those two Agent
     calls before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-030 ship
- Run: just archive-spec SPEC-030  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-030: Dynamic mixing — tier-aware bus automation on the bed channel; jackpot ducks bed to 0.05, big win swells to 0.45, both restore to CHANNEL_GAINS.bed (0.25) after 3s; applyMix() + useDynamicMixing hook; gated by muted+unlocked; injected-spy tests (6 hook + 6 mixer with fake timers), no real Tone in tests; engine untouched, no new deps; 237/237 tests green (+12 tests); 3rd of 7 SPECs in STAGE-005"

NOTE: This is NOT the last spec in STAGE-005 (3/7 — next specs are reduced-motion audit,
contrast + 44px audit, colorblind-safe cues, and perf pass).
Do NOT trigger a Stage Ship after archiving.
Continue with the next spec in the STAGE-005 backlog.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-013 (audio-graph architecture — mixing is a gain ramp on
getChannel('bed').gain, never on individual synths; restore target is CHANNEL_GAINS.bed),
DEC-007 (synthesized Tone.js audio, gated; no audio asset files), DEC-001 (engine
unchanged; pure UI — all mixing logic in src/ui/audio/); no new DEC-* emitted by this
build (DEC-013 already covers bus mixing).
```
