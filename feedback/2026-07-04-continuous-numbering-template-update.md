# Template update request: continuous repo-wide STAGE/SPEC numbering

**Status:** sent upstream to the spec-driven-template repo worker (2026-07-04).
**Applied locally:** yes — this instance already switched to continuous numbering
(commit `84986b8`: `new-stage`/`new-spec` scan repo-wide; STAGE-007 / SPEC-038
continue after PROJ-001). This file is the request handed to the template author.

Related signals: see [2026-07-03-proj-001-signals.md](2026-07-03-proj-001-signals.md)
(the `ambiguous-project-resolution` / status-blind-resolution family) and the
retrospective's Theme A tooling cluster.

---

## Task: make STAGE/SPEC numbering continuous repo-wide (not per-project)

### Context
Running a second project in a template instance, `just new-stage` / `just new-spec`
**restarted numbering at 001** inside the new project (PROJ-002 got STAGE-001,
SPEC-001) instead of continuing after the previous project's last IDs. This was
surprising and undocumented as a choice — in practice, projects are expected to run
with **continuous, repo-wide numbering** (PROJ-002 continues STAGE-007+, SPEC-038+
after PROJ-001 ended at STAGE-006 / SPEC-037).

The scoping is entirely in the two script call-sites; `next_id` itself already
defaults to a repo-wide scan.

### Current behavior (the bug)
- `scripts/_lib.sh` → `next_id()` signature: `local search_dir="${2:-$REPO_ROOT}"`
  — already defaults to repo-wide; it's the callers that narrow it.
- `scripts/new-stage.sh` → `STAGE_ID=$(next_id STAGE "${PROJECT_DIR}/stages")`  ← per-project
- `scripts/new-spec.sh`  → `SPEC_ID=$(next_id SPEC "${PROJECT_DIR}/specs")`      ← per-project
- `projects/_templates/stage.md` → `id: STAGE-XXX  # stable, zero-padded within the project`

### Desired behavior
IDs are **continuous across the whole repo**. A stage/spec created in any project
gets the next number after the highest existing one anywhere in `projects/`.

### Change (minimal)
1. `scripts/new-stage.sh`: `next_id STAGE "${PROJECT_DIR}/stages"` → `next_id STAGE`
2. `scripts/new-spec.sh`:  `next_id SPEC "${PROJECT_DIR}/specs"`   → `next_id SPEC`
   (drop the per-project dir arg so both use `next_id`'s repo-wide default)
3. `projects/_templates/stage.md`: comment → `# stable, zero-padded, continuous across the repo`
4. Document the convention where the work hierarchy is described (AGENTS.md /
   GETTING_STARTED.md): "STAGE and SPEC IDs are globally unique and continuous across
   projects; they do not restart per project."

### Acceptance criteria
- With PROJ-001 at STAGE-006 / SPEC-037, running `just new-stage "x" PROJ-002` yields
  `STAGE-007`, and `just new-spec "y" STAGE-007` yields `SPEC-038`.
- `next_id STAGE` / `next_id SPEC` (repo-wide) return the correct continuations.
- Existing projects are untouched (already-numbered files don't move).
- Template + docs state the convention explicitly.

### Backward-compat / optional
If both styles must be supported, make it a documented toggle instead of a hard
switch — e.g. `.repo-context.yaml: id_numbering: continuous | per-project` (default
`continuous`), read by `new-stage`/`new-spec`. Otherwise the minimal change above is
enough.

### Adjacent gaps noticed in the same flow (fix if cheap, else file separately)
- **`new-stage`/`new-spec` assume the project's `stages/` + `specs/` dirs exist.** A
  hand-created project (copied from `projects/_templates/project-brief.md`) has only
  `brief.md`, so `new-stage` fails with `cp: … No such file or directory`. Either add a
  `just new-project` recipe that scaffolds the dir structure, or have `new-stage`/
  `new-spec` `mkdir -p` the target dir.
- **`get_active_project` is status-blind:** it returns the lowest-sorted non-example
  `PROJ-*` dir regardless of `status`, so a *shipped* project stays "active" and a new
  one is invisible to `just status` / default `new-spec` resolution. Consider preferring
  the highest-numbered `status: active|proposed` project (or honoring an explicit id).
