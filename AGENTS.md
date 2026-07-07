# AGENTS.md — Claude-Only Variant

Instructions for Claude working across all phases of this repository. Read this file first, every session.

> This variant assumes Claude plays every role: architect, implementer, reviewer. The context normally in a handoff document lives inside each spec's `## Implementation Context` section.

> This file contains conventions only. For rules/constraints, see `/guidance/constraints.yaml`. For architectural rationale, see `/decisions/`. For waves of work against this app, see `/projects/`.

---

## 1. Repo Overview

- **Repo (the app):** Animal Slots
- **Purpose:** A play-money, mobile-first web slot game themed on North American wildlife, built so game logic is cleanly separable from presentation.
- **Primary stakeholders:** Template maintainer (dogfooding the spec-driven template on a non-CRUD app); frontend devs evaluating the template; players wanting a quick play-money demo.
- **Active project:** PROJ-001 — Animal Slots MVP

See `.repo-context.yaml` for structured metadata.

---

## 2. Work Hierarchy

```
REPO (the app — persists across all projects)
 └─ PROJECT (a wave of work: "MVP", "improvements", "v2 redesign")
     └─ STAGE (a coherent chunk within a project)
         └─ SPEC (an individual task)
```

- The **repo** is the app. `AGENTS.md`, `/docs/`, `/guidance/`,
  `/decisions/` live at repo level because they accumulate across all
  projects.
- A **project** (`/projects/PROJ-*/`) is a bounded wave of work.
- A **stage** is an epic-sized chunk within a project (2–5 per project).
- A **spec** is a single implementable task. Belongs to one stage in
  one project.

In this variant, Claude plays architect and implementer in **separate
sessions**. The spec file itself carries all the context — see its
`## Implementation Context` section.

**Decisions persist at repo level.** A decision made during PROJ-001
binds PROJ-002 as well.

**Specs do not cross project boundaries.**

---

## 3. Business Value

Value structure exists at project and stage levels; specs link lightly.

**Project `value:` block** states the thesis — a testable claim about
what this wave of work delivers. Beneficiaries, success signals, and
risks to the thesis make it falsifiable, not marketing copy.

**Stage `value_contribution:` block** states what this coherent chunk
of work advances, what capabilities it delivers, and what it
explicitly doesn't try to do. Helps avoid stages that seem valuable
but don't contribute to the project thesis.

**Spec `value_link:`** is a one-sentence reference back to the
stage's value. Infrastructure specs may have
`value_link: "infrastructure enabling X"`. Optional but encouraged —
it surfaces specs that don't trace back to the thesis.

Reports (`just report-daily`, `just report-weekly`) aggregate these
signals: which stages advanced the thesis, which specs most directly
delivered it, and where value traceability broke down.

---

## 4. Cost Tracking Discipline

Every cycle on a spec appends a session entry to the spec's
`cost.sessions` list, with a **real** `tokens_total` for metered cycles —
so reports aggregate actual AI spend, not zeros. Documentation alone is
skippable, and cost tracking silently goes empty (all-null numerics) the
moment a prompt says "leave it null"; the rule below + `just cost-audit`
make it stick. Full reference: `docs/cost-tracking.md`.

- **Schema:** a single combined `tokens_total` per session (the harness
  reports one number — `subagent_tokens` in an `Agent` result, or `/cost`
  interactively). Do NOT split input/output; there is no reliable split.
- **build / verify cycles** run as metered subagents: the ORCHESTRATOR
  reads `subagent_tokens` + `duration_ms` from the `Agent` result and
  writes the real `tokens_total` / `duration_minutes` / `estimated_usd`
  into the spec at **ship**. (If run interactively, use `/cost`.) These
  cycles must NOT be left null.
- **design / ship cycles** are orchestrator main-loop work with no clean
  per-cycle metering — leave numerics `null` with a "main-loop, not
  separately metered" note.
- **`estimated_usd`** = `tokens_total` × your model's published list rate,
  no cache discount — an order-of-magnitude estimate; say so in the note.
- **Other interfaces:** `interface: claude-ai` (estimate by length),
  `api` (the `usage` object), `ollama`/`other`. Only genuinely un-metered
  cycles may be null-with-note.

- **Every session carries `recorded_at`** (the date it was recorded). The
  **ship** session's `recorded_at` is the spec's ship date that
  `just specs-by-stage` reads — an *active* stage has no `shipped_at` to
  fall back on, so a ship session missing it renders the ship date as `—`.
  Write it during ship bookkeeping (it is today's date).

The cycle-prompt wording lives in
`projects/_templates/prompts/cost-snippet.md` — use it so prompts don't
re-introduce the "null numerics" loophole. **Ship computes `cost.totals`**
(sum of non-null sessions; `tokens_total` uses `0`, never `null`) and runs
`just cost-audit`, which **fails if any shipped spec lacks build/verify
cost, or a `recorded_at` on its ship session** (constraint
`cost-captured-per-cycle`; CI job `cost-data`; surfaced in `just status`
and `report-weekly`). Pre-process specs can be grandfathered via
`COST_AUDIT_GRANDFATHERED` (missing cost) or `SHIP_DATE_GRANDFATHERED`
(pre-ship-session specs) in `scripts/_lib.sh`.

Reports aggregate cost by cycle, by interface, by spec, and by stage.

---

## 5. Tech Stack

- **Language:** TypeScript (strict)
- **Runtime:** Node 20
- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS + CSS custom properties for design tokens (CSS modules optional); no UI component library.
- **Audio:** Tone.js — synthesized at runtime, no audio asset files (see DEC-007).
- **Database:** None. Client-only SPA; the only persistent state is two `localStorage` keys (balance, mute).
- **Testing:** Vitest + React Testing Library. The engine (`src/engine/**`) is tested with plain Vitest, no DOM.
- **Linter / Formatter:** ESLint (incl. the `no-restricted-imports` import-boundary rule enforcing `engine-no-dom`) + Prettier.
- **Hosting:** Static SPA (Vite build) deployed to **Cloudflare Pages**, via CI on merge to `main` (STAGE-006; see DEC-008). Security headers via a Pages `_headers` file.
- **CI:** GitHub Actions — lint + typecheck + test on every PR (plus the `cost-data` audit job).

---

## 6. Commands (exact)

These are the APP's commands. They are also wrapped as `just` recipes (see the
"APP COMMANDS" block in the `justfile`), so `just dev` ≡ `npm run dev`, etc.
Prefer the `just` form for consistency with the template's workflow commands.

```bash
npm install              # just install   — install dependencies
npm run dev              # just dev        — start the Vite dev server
npm test                 # just test       — run the Vitest suite
npm test -- <path>       # just test <path> — run a single test file (e.g. src/engine/spin.test.ts)
npm run lint             # just lint       — ESLint (incl. the engine-no-dom import boundary)
npm run typecheck        # just typecheck  — tsc --noEmit (strict)
npm run build            # just build      — production Vite build (static assets)
```

> Note: the template's own maintainer self-test moved from `just test` to
> `just selftest` so the app can own `just test`.

---

## 7. Directory Structure

```
/
├── AGENTS.md                          # This file
├── CLAUDE.md                          # Pointer to AGENTS.md
├── README.md                          # Human-facing readme
├── GETTING_STARTED.md                 # First-project walkthrough
├── FIRST_SESSION_PROMPTS.md           # Phase prompts
├── .repo-context.yaml                 # Repo (app) metadata
├── .variant                           # "claude-only"
├── justfile                           # Commands: just status, just new-spec, etc.
├── scripts/                           # Shell scripts powering justfile
├── docs/                              # Architecture, data model, API contract
├── guidance/                          # Repo-level rules (across all projects)
│   ├── constraints.yaml
│   └── questions.yaml
├── decisions/                         # Repo-level DEC-* (across all projects)
├── feedback/                          # Downstream user feedback captures
├── reports/                           # Daily + weekly report outputs
├── projects/                          # Waves of work
│   ├── _templates/                    # Shared templates
│   │   ├── spec.md
│   │   ├── stage.md
│   │   └── project-brief.md
│   ├── PROJ-001-<slug>/
│   │   ├── brief.md
│   │   ├── stages/
│   │   └── specs/
│   │       └── done/
│   └── PROJ-002-<slug>/
└── src/                               # engine/ (pure TS), ui/ (React), styles/ (tokens) — see docs/architecture.md
```

---

## 8. Cycle Model

Every spec moves through five cycles. **Cycles are tags, not gates**.

| Cycle | Purpose |
|---|---|
| **frame** | Go/no-go on the spec |
| **design** | Write the spec + failing tests + implementation context |
| **build** | Make failing tests pass |
| **verify** | Review + validation in one pass |
| **ship** | Merge, deploy, reflect, archive |

Valid transitions:
```
frame → design → build → verify → ship
                   ↑       │
                   └───────┘ (verify sends back on punch list)
```

**In this variant**, use **separate Claude sessions** for each cycle.
A fresh session prevents design-phase context from contaminating build
decisions, and a fresh verify session catches drift a continuation
session wouldn't.

**Model per cycle.** Frame and design are judgement-heavy planning — run them
on **Opus** (claude-opus-4-8). Build and verify are execution against a detailed
spec and a cold review against fixed criteria — run them on **Sonnet**
(claude-sonnet-4-6): capable, faster, and cheaper for that work. When a cycle is
run as a sub-agent, pass the model explicitly so it doesn't silently inherit the
orchestrator's model. A spec's `agents.implementer` records the model that
actually ran.

Project and stage lifecycles are lighter:
- **Project status:** `proposed | active | shipped | cancelled`
- **Stage status:** `proposed | active | shipped | cancelled | on_hold`

---

## 9. Instruction Timeline

Every spec has a timeline file at
`projects/*/specs/SPEC-NNN-<slug>-timeline.md` listing cycle
instructions in order with status markers.

Status markers:

- `[ ]` not started — no one has picked this up yet
- `[~]` in progress — an executor is currently running this
- `[x]` complete — cycle finished; see the prompt file for what was run
- `[?]` blocked — needs a human decision or external unblock before
  proceeding. Include a one-line reason after the marker.

Cycle prompts live at `projects/*/specs/prompts/SPEC-NNN-<cycle>.md`.
The architect writes them; executors read and run them.

**Discipline for executors:**

- When you start a cycle, mark it `[~]`.
- When you finish, mark it `[x]` with a one-line result (PR number,
  cost, completion date).
- If you hit a real blocker — constraint ambiguous, dependency
  missing, verify surfaced something needing architect judgment —
  mark `[?]` with a one-line reason. Do NOT use `[?]` as a "I don't
  know what to do" dumping ground. Blocked means the next move
  requires someone else; everything else is in-progress or a
  question to resolve in the current session.

This is a convention, not a mechanism. No tooling enforces it; the
discipline lives in the prompt set. Skip it and nothing breaks, but
you lose the history artifact and the next executor has to hunt for
the right prompt.

---

## 10. Cross-Reference Rules

Every spec has these relationships, encoded in front-matter:
- `project.id` → the project it belongs to
- `project.stage` → the stage within that project
- `references.decisions` → DEC-* it was designed against
- `references.constraints` → constraints that apply

DECs are stable; specs come and go. DECs don't reciprocally list specs.

---

## 11. Coding Conventions

- **Naming:** Engine modules use short, noun-shaped names (`rng`, `strips`, `spin`, `paylines`, `balance`, `tiers`). React components are PascalCase files (`SpinButton.tsx`). CSS custom properties (design tokens) are kebab-case (`--color-campfire`, `--space-2`).
- **File organization:** Engine logic in `src/engine/**` (pure TS); presentation in `src/ui/**`; design tokens in `src/styles/tokens.css`. The module layout is authoritative in `docs/architecture.md` — keep them in sync.
- **Imports:** `src/engine/**` must not import React or anything DOM-related (enforced by the `engine-no-dom` ESLint rule). The UI imports the engine **only** through its typed interface at `src/engine/index.ts`, never engine internals.
- **Error handling:** Engine functions are pure and total where practical; invalid game states (e.g. bet > balance) are returned as typed results, not thrown across the engine/UI boundary. Reserve exceptions for genuine programmer error.
- **Logging:** This is a client-only game; there is no structured logging requirement. Keep `console.*` out of committed code except deliberate, temporary dev diagnostics.
- **Comments:** Explain *why*, not *what*.
- **No dead code.** Delete, don't comment out.
- **Diagrams:** author them as Mermaid fenced blocks in markdown
  (`/docs/`, `/decisions/`, specs) so they render on GitHub and you can
  keep them current as part of the work. Update the relevant diagram in
  the same change, not afterward. See `/guidance/recommended-tools.md`.

---

## 12. Testing Conventions

- Every new function gets at least one test.
- Test file naming: co-located `*.test.ts` for the engine and `*.test.tsx` for UI, discovered by Vitest.
- Coverage expectations: the engine (`src/engine/**`) targets high coverage — close to every branch of the game logic, since it is pure and deterministic. UI tests assert behavior and state transitions (idle → spinning → resolved → celebration), not pixel-exact animation or feel.
- **TDD:** Tests live in the spec's `## Failing Tests` section, written
  during **design**, made to pass during **build**.

---

## 13. Git and PR Conventions

- **Branch:** `feat/spec-NNN-<slug>`, etc.
- **One spec per branch, one PR per branch.**
- **Commits:** Imperative mood, present tense ("Add weighted reel strips"), small and focused; reference the `SPEC-NNN` they implement.
- **PR description must include:**
  - Project: `PROJ-NNN`
  - Stage: `STAGE-NNN`
  - Spec: `SPEC-NNN`
  - Decisions referenced, constraints checked, new `DEC-*` files

---

## 14. Domain Glossary

- **Engine** — the pure-TypeScript game logic under `src/engine/**`; no React/DOM.
- **Presentation** — the React + CSS UI under `src/ui/**` / `src/styles/**`.
- **Reel** — one of the five vertical columns; shows 3 visible symbols.
- **Row** — vertical position within a reel: 0 (top) / 1 (mid) / 2 (bottom).
- **Grid** — the 5×3 array of visible symbols a spin resolves to.
- **Reel strip** — a weighted array of symbol IDs a reel's stop index is drawn from (common animals frequent, Wolf rare).
- **Payline** — a fixed path across the five reels; pays on 3+ consecutive matching symbols starting at reel 0. v1 has five fixed lines (DEC-003).
- **Paytable** — payout multiples (of total bet) per symbol tier for 3 / 4 / 5 of a kind.
- **Tier (symbol)** — a symbol's class: Low / Mid / High / Jackpot.
- **Win tier** — the celebration class of a spin: Small (>0 and <5× bet) / Big (≥5× bet) / Jackpot (five Wolves).
- **Bet level** — total bet of 10 / 25 / 50 coins (the x1 / x2 / x3 levels).
- **Spin / SpinResult** — one play, and the plain-data result the engine returns to the UI (grid, winning lines, total win, new balance, win tier).
- **Juice** — the celebratory feel layer: paw-print trails, particles, balance count-up, jackpot moment, tier-scaled jingle.
- **Auto-spin** — repeated spinning with an inter-spin delay; stops on jackpot, count exhaustion (default 10), or balance < bet.

---

## 15. Cycle-Specific Rules

### During **build**

Start a **new Claude session**. Do not continue from the design session.

Before writing code:
1. Read the spec's `## Implementation Context` section.
2. Read every `DEC-*` it references.
3. Read the parent `STAGE-*.md` and project `brief.md`.
4. Read `/guidance/constraints.yaml`.
5. If anything is ambiguous, add to `/guidance/questions.yaml` and stop.

When done:
1. Fill in spec's `## Build Completion` (including reflection).
2. Append a build cost session entry to `cost.sessions`.
3. `just advance-cycle SPEC-NNN verify`.
4. Create `DEC-*` files for non-trivial build decisions. When a
   decision is tied to specific code, fill in its `affected_scope`
   with the path globs it governs (e.g. `src/lib/log.ts`,
   `src/api/**`). This is required for file-bound decisions — it's
   what lets `just decisions-audit --changed` surface the decision
   when those paths change later. Leave `affected_scope: []` only for
   decisions not tied to particular files (e.g. a process choice).
5. Open PR.

### During **verify**

Start **another new Claude session**. Do not reuse build session.

Check: acceptance criteria met? tests pass? no decision drift? no
constraint violations? non-trivial choices have DEC-*? build reflection
answered honestly? `cost.sessions` has entries for prior cycles
(flag if missing, don't block)?

For the "decision drift" check, run `just decisions-audit --changed` —
it flags which `DEC-*` records govern the files this spec touched, so you
can confirm the build stayed consistent with them. `just decisions-audit`
(no flag) lints the records themselves. See
`/guidance/recommended-tools.md` for optional, heavier verify tooling
(e.g. LineSpec for protocol-level integration tests).

Append a verify cost session entry to `cost.sessions`.

Output: ✅ APPROVED / ⚠ PUNCH LIST / ❌ REJECTED.

### During **ship**

Append `## Reflection` to spec. Three answers. Append a ship cost
session entry, then compute `cost.totals`. **Capture at least one
accomplishment** with `just brag "..."` — required, not optional. It
records to the Bragfile CLI (`brag add`; local-first db at
`~/.bragfile/db.sqlite`), auto-associated with this repo's project; if
the `brag` CLI isn't installed it falls back to a repo `ACCOMPLISHMENTS.md`.
This is the running, cross-project record, distinct from the per-spec
`## Reflection`. View entries with `brag list` / `brag review`. Then
`just archive-spec SPEC-NNN`. If stage backlog is complete, run the
Stage Ship prompt (which captures a milestone brag of its own).

---

## 16. Session Hygiene (claude-only specific)

Because one agent plays multiple roles, context contamination is a real
risk. Five habits keep it at bay:

1. **New session per cycle where possible.** Especially design → build
   and build → verify.
2. **Never reference "as I said earlier"** in later cycles. The spec
   is the source of truth.
3. **Weekly review is non-optional.** Without a second agent pushing
   back, drift compounds silently. Run `just weekly-review`.
4. **Honest confidence values on decisions.** See Section 17.
5. **One git worktree per concurrent session.** If more than one session
   works on this repo at once, each MUST run in its own `git worktree`,
   not the shared checkout — two agents writing one working tree corrupt
   each other (a parallel build can clobber an uncommitted edit, or a
   commit can land on the wrong branch). `git worktree add <path> <branch>`,
   work there, commit + push, then `git worktree remove`. Always check
   `git branch --show-current` before any commit.

---

## 17. Confidence Discipline

Decisions have an `insight.confidence` field (0.0–1.0). Honest values drive:

- **Design:** decisions at confidence < 0.7 also create a question in
  `/guidance/questions.yaml`.
- **Verify:** specs referencing decisions at confidence < 0.6 get a
  yellow flag.
- **Weekly review:** all decisions < 0.8 are listed with strength/weakness trend.

Most decisions should land between 0.7 and 0.95. 1.0 only for truly locked choices.

---

## 18. Pointers

- Constraints: `/guidance/constraints.yaml`
- Open questions: `/guidance/questions.yaml`
- Decisions: `/decisions/` (audit with `just decisions-audit`)
- Recommended (optional) tools: `/guidance/recommended-tools.md`
- Projects: `/projects/`
- Templates: `/projects/_templates/`
- Architecture: `/docs/architecture.md`
- Feedback: `/feedback/` (capture with `just new-feedback "<slug>"`)
- Accomplishments: the Bragfile CLI (`brag list` / `brag review`). `just brag "..."` records there (falls back to `/ACCOMPLISHMENTS.md` if the `brag` CLI is absent); required at ship.
- Reports: `/reports/` (daily, weekly)
- Timelines: `/projects/*/specs/SPEC-NNN-*-timeline.md` (per-spec)
- Cycle prompts: `/projects/*/specs/prompts/`
- Phase prompts: `/FIRST_SESSION_PROMPTS.md`
- First walkthrough: `/GETTING_STARTED.md`
- Daily commands: run `just --list`
