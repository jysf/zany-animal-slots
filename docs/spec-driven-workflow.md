# Spec-driven workflow

Zany Animal Slots is developed with a **spec-driven workflow**: an AI agent plays every role —
architect, implementer, reviewer — across **separate sessions**, with the spec file (not conversation
memory) as the source of truth between them. This document captures that machinery. **None of it is
needed to run or hack on the game** (see the [README](../README.md) for that) — it's how the repo is
built and maintained.

The authoritative conventions live in [`AGENTS.md`](../AGENTS.md); this is the orientation.

## Work hierarchy

```
Repo (this app)
 └─ Project (a wave of work: "MVP", "Machines & Metrics", …)
     └─ Stage (a coherent chunk within a project)
         └─ Spec (an individual task)
              └─ Cycle (Frame → Design → Build → Verify → Ship)
```

- The **repo** is the app; `AGENTS.md`, `docs/`, `guidance/`, and `decisions/` accumulate across all
  projects.
- A **project** (`projects/PROJ-*/`) is a bounded wave of work with a `brief.md` value thesis.
- A **stage** is an epic-sized chunk within a project (2–5 per project).
- A **spec** is a single implementable task; its `## Implementation Context` folds in everything the
  build session needs (there is no separate handoff doc).
- Decisions (`decisions/DEC-*`) are **repo-level** and persist across projects.

## Cycle model

Every spec moves through five cycles — tags, not gates:

| Cycle | Purpose |
|---|---|
| **frame** | Go/no-go on the spec |
| **design** | Write the spec + failing tests + implementation context (Opus) |
| **build** | Make the failing tests pass (Sonnet) |
| **verify** | Cold review + validation in one pass (Sonnet) |
| **ship** | Merge, deploy, reflect, archive |

Each cycle runs in a **fresh session** so design-phase context can't contaminate build decisions and a
cold verify catches drift. Each spec has a `*-timeline.md` and cycle prompts under `specs/prompts/`.

## Commands

Run `just --list` for the full set. Common ones:

```bash
just status                        # active project, stage, specs by cycle
just backlog                       # what's next in the active stage
just roadmap                       # stage-grained: where the project is going
just new-spec "title" STAGE-NNN    # scaffold a new spec
just advance-cycle SPEC-NNN verify # update a spec's cycle
just archive-spec SPEC-NNN         # move a shipped spec to done/
just decisions-audit               # lint the decision records
just weekly-review                 # print the weekly-review prompt
just report-daily / report-weekly  # generate report snapshots
```

The app's own commands (`npm run dev|test|lint|typecheck|build`) are wrapped as `just dev`, `just test`,
etc. — see [`AGENTS.md` §6](../AGENTS.md).

## Reports

`just report-daily` / `just report-weekly` generate quantitative snapshots under `reports/` from spec
front-matter and the git log — specs by cycle, value-thesis advancement, cost by cycle/interface, cycle
times, and flags. Reports are stand-alone; re-running overwrites, so they're always a current snapshot.

## Working discipline

Because one agent plays every role, **context contamination** is the biggest risk. Four habits keep it
at bay (full detail in [`AGENTS.md` §15–17](../AGENTS.md)):

1. **New session per cycle** — especially design → build and build → verify.
2. **The spec file is the source of truth** between sessions — never "as I said earlier."
3. **Weekly review is non-optional** (`just weekly-review`).
4. **Honest confidence values** on decisions (`insight.confidence`), which drive the review flags.

## Where the process artifacts live

| Path | Purpose |
|---|---|
| `AGENTS.md` | Authoritative conventions for the agent working in this repo |
| `.repo-context.yaml` | Structured metadata about the app |
| `guidance/` | Repo-level rules (`constraints.yaml`) and open questions |
| `decisions/` | Decision log (`DEC-*`), accumulates across projects |
| `projects/` | Each project (wave of work) — `brief.md`, `stages/`, `specs/` |
| `feedback/` | Downstream/dogfood signals captured during the work |
| `reports/` | Generated daily + weekly report snapshots |
