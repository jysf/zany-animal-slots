# Animal Slots

A play-money, mobile-first web slot game themed on North American wildlife
("Wild & Whimsical").

This repo uses a spec-driven workflow where Claude plays every role (architect, implementer, reviewer) across different sessions.

## Hierarchy

```
Repo (this app)
 └─ Project (a wave of work: "MVP", "v2 improvements")
     └─ Stage (a coherent chunk within a project)
         └─ Spec (an individual task)
              └─ Cycle (Frame → Design → Build → Verify → Ship)
```

## Getting started

**First time?** Read `GETTING_STARTED.md` — it walks you through your first project end-to-end.

**Daily work?** Run `just --list` to see available commands.

**Common commands:**
```bash
just status                        # See active project, stage, specs by cycle
just backlog                       # Spec-grained: what's next in the active stage
just roadmap                       # Stage-grained: where this project is going
just new-spec "title" STAGE-001    # Scaffold a new spec
just advance-cycle SPEC-001 verify # Update a spec's cycle
just archive-spec SPEC-001         # Move a shipped spec to done/
just weekly-review                 # Print the weekly review prompt
just report-daily                  # Generate today's daily report
just report-weekly                 # Generate this week's weekly report
just daily-status-report           # Snapshot `just status` to reports/daily/<date>-status.md
```

## Reports

`just report-daily` and `just report-weekly` generate quantitative
snapshots under `reports/daily/` and `reports/weekly/` from spec
front-matter and git log. Daily reports show specs by cycle, value
thesis, cost activity today, and flags. Weekly reports aggregate
ships, cycle times, cost by cycle and interface, and value
advancement. Reports are stand-alone artifacts — re-running
overwrites, so they're always a current snapshot.

## Key discipline in this variant

Because Claude plays every role, context contamination is the biggest risk. Four habits keep it at bay:

1. **New Claude session per cycle** (especially design → build and build → verify)
2. **The spec file is the source of truth** between sessions — no "as I said earlier"
3. **Weekly review is non-optional** (`just weekly-review`)
4. **Honest confidence values** on decisions

See `AGENTS.md` section 15 for the full discipline.

## The app itself

Animal Slots is a play-money, mobile-first web slot game themed on North
American wildlife ("Wild & Whimsical"). This wave of work (PROJ-001, the MVP)
delivers a fully playable, juiced 5×3 slot — real spin/win logic plus the
celebratory feel from the design spec — built as a small web app whose game
logic is cleanly separable from its presentation. Why now / why this app: it
doubles as a dogfood vehicle for the spec-driven template against a real-time,
animation-heavy, non-CRUD frontend project. Success: all five game states are
reachable and visually distinct, the engine is fully unit-tested with zero DOM
coupling, and at least one spec completes the design→build→verify→ship loop
without the loop fighting the animation work.

There is no real money, wagering, or purchases of any kind — balance and reset
are local-only and tuned for fun, not a regulated payout. See
`projects/PROJ-001-animal-slots/brief.md` for the full project frame, and
AGENTS.md Section 6 for run/test commands.

## Where things live

| Path | Purpose |
|---|---|
| `AGENTS.md` | Conventions for Claude working in this repo |
| `.repo-context.yaml` | Structured metadata about the app |
| `docs/` | Architecture, data model, API contract |
| `guidance/` | Repo-level rules and open questions |
| `decisions/` | Decision log (accumulates across projects) |
| `projects/` | Each project (wave of work) lives here |
| `projects/*/brief.md` | What this project is and why |
| `projects/*/stages/` | Stages within a project |
| `projects/*/specs/` | Specs within a project (with folded-in Implementation Context) |
| `src/` | [REPLACE: the actual app code] |

## License

[REPLACE]
