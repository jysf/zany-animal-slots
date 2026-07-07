#!/usr/bin/env bash
# scripts/cost-audit.sh — the mechanical backstop for the Cost Tracking
# Discipline (AGENTS.md §4). Fails if any SHIPPED spec is missing real
# build/verify cost data (a positive `tokens_total` on those cycles) OR the
# recorded_at date on its ship session (the ship date `specs-by-stage` reads;
# an active-stage spec that omits it renders "—" — the drift this check stops).
#
# Why this exists: documentation alone tells agents to record cost, and
# documentation alone is skippable — cost tracking silently goes empty
# (all-null numerics) the moment a prompt says "leave it null". A check
# makes it stick. Same pattern as wiring a license policy into CI: a
# discipline made mechanical with a `just` check + a CI job.
#
# Scope: only build/verify cycles are required (those run as metered
# subagents whose token count is in the Agent result). design/ship are
# orchestrator main-loop cycles and may legitimately be null.
#
# Grandfathered pre-process specs are skipped — see
# COST_AUDIT_GRANDFATHERED in scripts/_lib.sh (empty in a fresh template
# instance; populate it only if you adopt the gate after shipping specs
# without it).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/_lib.sh
source "${SCRIPT_DIR}/_lib.sh"

require_initialized
project=$(get_active_project)
project_dir="${REPO_ROOT}/projects/${project}"

offenders=0
while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in *-timeline.md) continue ;; esac
    name=$(basename "$f" .md)
    # "shipped" = archived under done/, or front-matter cycle == ship.
    shipped=0
    case "$f" in
        */specs/done/*) shipped=1 ;;
        *) if [ "$(get_spec_cycle "$f")" = "ship" ]; then shipped=1; fi ;;
    esac
    [ "$shipped" = "1" ] || continue
    if is_grandfathered_cost "$name"; then continue; fi
    missing=$(spec_missing_cost_cycles "$f")
    if [ -n "$missing" ]; then
        printf "  %-58s missing cost on: %s\n" "$name" "$missing"
        offenders=$((offenders + 1))
    fi
    # Ship session must carry recorded_at — it is the ship date `specs-by-stage`
    # reads (active stages have no shipped_at to fall back on). Written at ship
    # bookkeeping per the cost-snippet template; grandfathered pre-convention specs skip.
    if ! is_grandfathered_ship_date "$name" && [ -z "$(ship_recorded_at "$f")" ]; then
        printf "  %-58s missing ship recorded_at\n" "$name"
        offenders=$((offenders + 1))
    fi
done < <(find_all_specs "$project_dir")

if [ "$offenders" -gt 0 ]; then
    echo ""
    die "cost-audit: ${offenders} shipped spec(s) with incomplete cost capture (build/verify tokens_total, or the ship session's recorded_at). See AGENTS.md §4 / docs/cost-tracking.md."
fi
success "cost-audit: all shipped specs have build/verify cost + a ship recorded_at."
