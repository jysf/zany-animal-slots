# Spec-driven repo template — command runner
#
# This justfile works BOTH before and after `just init`:
# - Before init: only `init` and `list-variants` are expected to work.
# - After init: all the daily commands work (status, new-spec, etc.)
#
# Run `just --list` to see everything.

# Pass recipe arguments as real argv ($1, $2, ... / "$@") so messages
# containing shell metacharacters ($, etc.) are NOT re-expanded by the
# recipe shell. Required for `just brag`/`just new-feedback`, whose free-text
# arguments routinely contain `$` (costs) — textual {{VAR}} interpolation
# would expand `$0.95` to the shell name. Additive: {{VAR}} recipes still work.
set positional-arguments

# Show all commands
default:
    @just --list

# ----------------------------------------------------------------------------
# ONE-TIME SETUP
# ----------------------------------------------------------------------------

# Initialize the repo: pick a variant and scaffold files to the root.
init:
    @echo "Spec-driven repo template — init"
    @echo ""
    @if [ -f AGENTS.md ]; then \
        echo "⚠  Already initialized (AGENTS.md exists at repo root)."; \
        echo "   Init is one-shot: it consumes variants/ when it runs."; \
        echo "   To start over, restore the repo from git or re-clone."; \
        exit 1; \
    fi
    @if [ ! -d variants ]; then \
        echo "⚠  variants/ directory is missing."; \
        echo "   This repo was already initialized (or the template was"; \
        echo "   modified). Restore from git or re-clone to re-init."; \
        exit 1; \
    fi
    @echo "Pick a variant:"
    @echo "  1) claude-only         (Claude plays every role; simpler)"
    @echo "  2) claude-plus-agents  (Claude architects, separate agent implements)"
    @echo ""
    @printf "Enter 1 or 2: "
    @read variant_choice && \
    if [ "$variant_choice" = "1" ]; then \
        VARIANT="claude-only"; \
    elif [ "$variant_choice" = "2" ]; then \
        VARIANT="claude-plus-agents"; \
    else \
        echo "Invalid choice: $variant_choice"; exit 1; \
    fi && \
    echo "" && \
    echo "Scaffolding $VARIANT to repo root..." && \
    cp -r "variants/$VARIANT/." . && \
    rm -rf variants/ && \
    echo "$VARIANT" > .variant && \
    echo "" && \
    echo "✓ Done. Your variant: $VARIANT" && \
    echo "" && \
    echo "Next steps:" && \
    echo "  1. Open GETTING_STARTED.md" && \
    echo "  2. Work through the PROJECT FRAME prompt in FIRST_SESSION_PROMPTS.md" && \
    echo "  3. Commit the scaffolded repo:" && \
    echo "       git add . && git commit -m 'chore: initialize spec-driven scaffold'"

# List the available variants (useful before init)
list-variants:
    @echo "Available variants:"
    @echo "  claude-only         — Claude plays every role; no handoff documents"
    @echo "  claude-plus-agents  — Claude architects, separate agent implements; adds /handoffs/"
    @echo ""
    @echo "Run 'just init' to pick one."

# ----------------------------------------------------------------------------
# DAILY COMMANDS (work after `just init`)
# ----------------------------------------------------------------------------

# Print repo state: active project, stage, specs by cycle, stale items.
# Pass --json for machine-readable output (DEC-001 §2).
status *ARGS:
    @./scripts/status.sh {{ARGS}}

# Scaffold a new spec. Usage: just new-spec "short title" STAGE-NNN [PROJ-NNN]
new-spec TITLE STAGE_ID PROJECT_ID="":
    @./scripts/new-spec.sh "{{TITLE}}" "{{STAGE_ID}}" "{{PROJECT_ID}}"

# Scaffold a new stage. Usage: just new-stage "short title" [PROJ-NNN]
new-stage TITLE PROJECT_ID="":
    @./scripts/new-stage.sh "{{TITLE}}" "{{PROJECT_ID}}"

# Advance a spec's cycle. Usage: just advance-cycle SPEC-NNN verify
advance-cycle SPEC_ID NEW_CYCLE:
    @./scripts/advance-cycle.sh "{{SPEC_ID}}" "{{NEW_CYCLE}}"

# Archive a shipped spec: move to done/ and update stage backlog.
# Usage: just archive-spec SPEC-NNN
archive-spec SPEC_ID:
    @./scripts/archive-spec.sh "{{SPEC_ID}}"

# Print the Weekly Review prompt with recent activity pre-loaded
weekly-review:
    @./scripts/weekly-review.sh

# Print the whole-repo Lifetime Data Report: all projects/stages/specs/decisions/releases, no LLM needed
lifetime-data:
    @./scripts/lifetime-report.sh data

# Print the Lifetime Report prompt: same history wrapped in a synthesis ask for an LLM to narrate
lifetime-report:
    @./scripts/lifetime-report.sh prompt

# Save the Lifetime Data Report to reports/lifetime/YYYY-MM-DD-HHMMSS.md
# (timestamped to the second, so repeated runs never overwrite).
lifetime-save:
    @mkdir -p reports/lifetime
    @TS="$(date +%Y-%m-%d-%H%M%S)"; \
        ./scripts/lifetime-report.sh data > "reports/lifetime/$TS.md"; \
        echo "✓ Wrote reports/lifetime/$TS.md"

# Generate today's daily report under reports/daily/YYYY-MM-DD.md
report-daily:
    @./scripts/report_daily.sh

# Generate this week's weekly report under reports/weekly/YYYY-WNN.md.
# Pass a YYYY-MM-DD to report on the ISO week containing that date.
report-weekly DATE="":
    @./scripts/report_weekly.sh "{{DATE}}"

# Capture today's `just status` output to reports/daily/YYYY-MM-DD-status.md.
# Lighter than report-daily — a snapshot of current state with no curation.
daily-status-report:
    @mkdir -p reports/daily
    @D="$(date +%Y-%m-%d)"; \
        { echo "# Daily status - $D"; echo; ./scripts/status.sh; } > "reports/daily/$D-status.md"; \
        echo "✓ Wrote reports/daily/$D-status.md"

# The project dashboard — one read view, many lenses (DEC-001 §4). With no
# argument it stitches a single overview (now + future + cost + flags). The
# lenses are the existing views, which keep working as their own commands:
#   just dash now=status · next=backlog · future=roadmap · ledger=specs-by-stage
# Want a new slice? Add a lens to scripts/dash.sh — not a new command.
dash *ARGS:
    @./scripts/dash.sh {{ARGS}}

# Spec-grained "what's next?" view: in-flight specs in the active
# stage, un-promoted bullets in the active stage's backlog, and
# counts in upcoming stages. Pass --all to widen scope.
backlog *FLAGS:
    @./scripts/backlog.sh {{FLAGS}}

# Stage-grained "where is this project going" view: one row per
# stage in the active project with status, date range, and (for
# active/upcoming) spec counts.
roadmap *ARGS:
    @./scripts/roadmap.sh {{ARGS}}

# Flat ledger of every spec grouped by stage, with ship date and
# complexity. Defaults to ALL projects (history); pass `--active` for
# the current project or a `PROJ-NNN` id for a specific one.
specs-by-stage *FLAGS:
    @./scripts/specs-by-stage.sh {{FLAGS}}

# Audit decisions: structural lint + scope-conflict warnings (zero
# deps; a native take on LineSpec-style provenance auditing). Lints
# front-matter and supersession links across all DEC-* files. Pass
# `--changed [BASE]` to flag which decisions govern your pending changes.
decisions-audit *FLAGS:
    @./scripts/decisions-audit.sh {{FLAGS}}

# Fail if any shipped spec is missing real build/verify cost data
# (AGENTS.md §4 / docs/cost-tracking.md). Same check the CI `cost-data`
# job runs; also surfaced in `just status` and `just report-weekly`.
cost-audit:
    @./scripts/cost-audit.sh

# Validate that every spec's front-matter carries the required structural
# fields with valid values (the schema contract; DEC-001 §1 /
# docs/schema-reference.md). Exits non-zero on any violation — gate-style,
# suitable for CI. Cost-on-shipped is enforced separately by `just cost-audit`.
validate:
    @./scripts/validate.sh

# ----------------------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------------------

# Print the active project and variant
info:
    @./scripts/info.sh

# Template maintainer self-test (renamed from `test` so the app owns `just test`;
# see feedback/2026-06-18-template-dogfood-proj-001.md). Works from the pre-init
# template root only — after `just init`, variants/ is gone and this fails early.
# Template's end-to-end happy-path tests (maintainers only; uses a temp dir).
selftest:
    @./scripts/test.sh

# ----------------------------------------------------------------------------
# APP COMMANDS (Animal Slots) — the actual app's build/dev/test/lint.
# These wrap the npm scripts so AGENTS.md §6 and the justfile agree. They
# work once STAGE-001 scaffolds package.json; before that they fail fast.
# ----------------------------------------------------------------------------

# Install app dependencies.
install:
    @npm install

# Start the Vite dev server.
dev:
    @npm run dev

# Run the app test suite (Vitest). Pass a path to run one file:
#   just test src/engine/spin.test.ts
test *ARGS:
    @npm test -- {{ARGS}}

# Lint (ESLint, incl. the engine-no-dom import boundary).
lint:
    @npm run lint

# Typecheck (tsc --noEmit, strict).
typecheck:
    @npm run typecheck

# Production build (static assets).
build:
    @npm run build

# Simulate machine metrics (RTP / hit-frequency / tier distribution) for tuning.
# Usage: just simulate [machine-id] [--spins N] [--seed S]
simulate *ARGS:
    @node_modules/.bin/vite-node scripts/simulate.ts {{ARGS}}

# Supply-chain gates (same as the CI supply-chain job).
license-check:
    @node scripts/license-check.mjs
audit:
    @npm audit --omit=dev --audit-level=high

# ----------------------------------------------------------------------------
# PROJECT TRACKING — brag log + template feedback capture.
# ----------------------------------------------------------------------------

# Record an accomplishment (via the Bragfile CLI; falls back to a repo file).
# Usage: just brag "shipped the slot engine with full coverage"
brag *MESSAGE:
    @./scripts/brag.sh "$@"

# Scaffold a dated feedback entry (feedback/YYYY-MM-DD-<slug>.md) from the
# template — capture template/process feedback while dogfooding.
# Usage: just new-feedback "new-stage glob collides on duplicate proj ids"
new-feedback *SLUG:
    @./scripts/new-feedback.sh "$@"
