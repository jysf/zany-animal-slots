#!/usr/bin/env bash
# scripts/backlog.sh — spec-grained "what should I pick up next" view.
#
# Surfaces three things `just status` deliberately doesn't:
#   1. In-flight specs (cycle ≠ ship/archived) grouped by cycle, scoped
#      to the active stage by default.
#   2. Stage backlog bullets that haven't been promoted to specs yet —
#      the `(not yet written)` rows in the active stage's `## Spec
#      Backlog`. This is the main new value vs. status.
#   3. Counts (not contents) of un-promoted bullets in upcoming stages.
#
# `--all` expands #1 and #2 to non-active stages too.
#
# Read-only. No writes.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

require_initialized

SHOW_ALL=0
JSON_OUT=0
for arg in "$@"; do
    case "$arg" in
        --all) SHOW_ALL=1 ;;
        --json) JSON_OUT=1 ;;
        -h|--help)
            cat <<EOF
Usage: just backlog [--all] [--json]

  --all    Include in-flight specs and un-promoted bullets across all
           stages, not just the active one. Counts for upcoming stages
           stay rolled up.
  --json   Machine-readable output (DEC-001 §2).
EOF
            exit 0
            ;;
        *) usage_error "Unknown argument: $arg (try --help)" ;;
    esac
done

ACTIVE_PROJECT=$(get_active_project)
ACTIVE_DIR="${REPO_ROOT}/projects/${ACTIVE_PROJECT}"
STAGES_DIR="${ACTIVE_DIR}/stages"
SPECS_DIR="${ACTIVE_DIR}/specs"

ACTIVE_STAGE_FILE=$(get_active_stage_file "$ACTIVE_DIR" || true)
ACTIVE_STAGE_ID=""
ACTIVE_STAGE_NAME=""
if [ -n "$ACTIVE_STAGE_FILE" ]; then
    ACTIVE_STAGE_NAME=$(basename "$ACTIVE_STAGE_FILE" .md)
    ACTIVE_STAGE_ID=$(echo "$ACTIVE_STAGE_NAME" | sed -E 's/^(STAGE-[0-9]+).*/\1/')
fi

# --- Helpers --------------------------------------------------------

# Read complexity (S/M/L) from spec front-matter.
get_spec_complexity() {
    awk '
        /^---$/ { fm = !fm; next }
        !fm { exit }
        /^task:/ { in_t = 1; next }
        in_t && /^[a-zA-Z_]/ { in_t = 0 }
        in_t && /^[[:space:]]+complexity:/ { print $2; exit }
    ' "$1"
}

# Read project.stage from a spec.
get_spec_stage_id() {
    awk '
        /^---$/ { fm = !fm; next }
        !fm { exit }
        /^project:/ { in_p = 1; next }
        in_p && /^[a-zA-Z_]/ { in_p = 0 }
        in_p && /^[[:space:]]+stage:/ { print $2; exit }
    ' "$1"
}

# Extract un-promoted "(not yet written)" bullets from a stage's
# ## Spec Backlog section. Emits ONE LOGICAL bullet per line: a bullet's
# wrapped continuation lines (indented) are joined so the title and the
# trailing `[S]/[M]/[L]` sizing (often on the last wrapped line) survive.
# Convention: `- [ ] SPEC-NNN (not yet written) — **Title**: … **[X]**`.
extract_unpromoted_bullets() {
    awk '
        function flush() {
            if (buf != "" && buf ~ /\(not yet written\)/) print buf
            buf = ""
        }
        /^## Spec Backlog/ { in_b = 1; next }
        in_b && /^## / { flush(); in_b = 0 }
        !in_b { next }
        /^[[:space:]]*-[[:space:]]*\[/ { flush(); buf = $0; next }   # new bullet
        /^[[:space:]]+[^[:space:]]/ && buf != "" {                    # wrapped continuation
            line = $0; sub(/^[[:space:]]+/, " ", line); buf = buf line; next
        }
        { flush() }                                                  # blank / other → flush
        END { flush() }
    ' "$1"
}

# Render a (joined) bullet as "SPEC-NNN  [X]  <title>". Extracts the SPEC id,
# the bracketed S/M/L sizing, and the first bold **title** (the concise name)
# from the full logical bullet. Falls back gracefully when a piece is absent.
format_unpromoted_bullet() {
    local line="$1"
    local specid title complexity
    specid=$(printf '%s' "$line" | grep -oE 'SPEC-[0-9]+' | head -n1)
    # First bold segment = the concise title. Anchor at start so we grab the
    # FIRST **…**, not the trailing **[X]** sizing token.
    title=$(printf '%s' "$line" | sed -E 's/^[^*]*\*\*([^*]+)\*\*.*/\1/')
    if [ "$title" = "$line" ]; then
        # No bold title — fall back to the post-dash summary.
        title=$(printf '%s' "$line" \
            | sed -E 's/^[[:space:]]*-[[:space:]]*\[[ x~?]\][[:space:]]*//' \
            | sed -E 's/SPEC-[0-9]+[[:space:]]*//' \
            | sed -E 's/\(not yet written\)[[:space:]]*[—-][[:space:]]*//' \
            | sed -E 's/[[:space:]]*\*\*\[[SML]\]\*\*.*$//' \
            | sed -E 's/[[:space:]]+$//')
    fi
    complexity=""
    if [[ "$line" =~ \[([SML])\] ]]; then complexity="${BASH_REMATCH[1]}"; fi
    local cx_col="—"
    [ -n "$complexity" ] && cx_col="[$complexity]"
    if [ -n "$specid" ]; then
        printf "%-9s %-4s %s\n" "$specid" "$cx_col" "$title"
    else
        printf "%-4s %s\n" "$cx_col" "$title"
    fi
}

# Count un-promoted bullets in a stage file.
count_unpromoted_bullets() {
    extract_unpromoted_bullets "$1" | wc -l | tr -d ' '
}

# --- JSON output (DEC-001 §2) ---------------------------------------
if [ "$JSON_OUT" = 1 ]; then
    scope=$([ "$SHOW_ALL" = 1 ] && printf all || printf active)
    inflight_json=(); unpromoted_json=(); upcoming_json=()

    if [ -d "$SPECS_DIR" ]; then
        for f in "${SPECS_DIR}"/SPEC-*.md; do
            [ -f "$f" ] || continue
            cycle=$(get_spec_cycle "$f")
            case "$cycle" in frame|design|build|verify|ship) ;; *) continue ;; esac
            stage_id=$(get_spec_stage_id "$f")
            if [ "$SHOW_ALL" = 1 ] || [ "$stage_id" = "$ACTIVE_STAGE_ID" ]; then
                sid=$(basename "$f" | sed -E 's/^(SPEC-[0-9]+).*/\1/')
                cx=$(get_spec_complexity "$f"); [ -n "$cx" ] || cx="?"
                inflight_json+=("$(json_obj "task.id" "$(json_qs "$sid")" "task.cycle" "$(json_qs "$cycle")" \
                    "task.complexity" "$(json_qs "$cx")" "project.stage" "$(json_qs "$stage_id")")")
            fi
        done
    fi

    # Append unpromoted-bullet objects for one stage to unpromoted_json (global).
    # Emits a clean {spec_id, title, complexity} — title is the first bold **…**,
    # matching the human-facing text output.
    emit_bullets_for() {
        local sf="$1" sidp="$2" line specid title complexity
        while IFS= read -r line; do
            [ -n "$line" ] || continue
            specid=$(printf '%s' "$line" | grep -oE 'SPEC-[0-9]+' | head -n1)
            title=$(printf '%s' "$line" | sed -E 's/^[^*]*\*\*([^*]+)\*\*.*/\1/')
            if [ "$title" = "$line" ]; then
                title=$(printf '%s' "$line" \
                    | sed -E 's/^[[:space:]]*-[[:space:]]*\[[ x~?]\][[:space:]]*//; s/SPEC-[0-9]+[[:space:]]*//; s/\(not yet written\)[[:space:]]*[^A-Za-z0-9*]*//; s/[[:space:]]*\*\*\[[SML]\]\*\*.*$//; s/[[:space:]]+$//')
            fi
            complexity=null
            if [[ "$line" =~ \[([SML])\] ]]; then complexity=$(json_qs "${BASH_REMATCH[1]}"); fi
            unpromoted_json+=("$(json_obj "project.stage" "$(json_qs "$sidp")" \
                spec_id "$([ -n "$specid" ] && json_qs "$specid" || printf null)" \
                title "$(json_qs "$title")" complexity "$complexity")")
        done <<< "$(extract_unpromoted_bullets "$sf")"
    }
    if [ -d "$STAGES_DIR" ]; then
        if [ "$SHOW_ALL" = 1 ]; then
            for s in "${STAGES_DIR}"/STAGE-*.md; do
                [ -f "$s" ] || continue
                emit_bullets_for "$s" "$(basename "$s" .md | sed -E 's/^(STAGE-[0-9]+).*/\1/')"
            done
        elif [ -n "$ACTIVE_STAGE_FILE" ]; then
            emit_bullets_for "$ACTIVE_STAGE_FILE" "$ACTIVE_STAGE_ID"
        fi
    fi

    upcoming_ondisk=" "
    if [ -d "$STAGES_DIR" ]; then
        for s in "${STAGES_DIR}"/STAGE-*.md; do
            [ -f "$s" ] || continue
            sid=$(basename "$s" .md | sed -E 's/^(STAGE-[0-9]+).*/\1/')
            upcoming_ondisk="${upcoming_ondisk}${sid} "
            [ "$sid" = "$ACTIVE_STAGE_ID" ] && continue
            status=$(get_stage_status "$s")
            { [ "$status" = shipped ] || [ "$status" = cancelled ]; } && continue
            cnt=$(count_unpromoted_bullets "$s")
            upcoming_json+=("$(json_obj "project.stage" "$(json_qs "$sid")" state "$(json_qs framed)" backlog_count "$cnt")")
        done
    fi
    # Planned-but-unframed stages from the brief's Stage Plan.
    while IFS='|' read -r pid ptitle; do
        [ -n "$pid" ] || continue
        case "$upcoming_ondisk" in *" $pid "*) continue ;; esac
        upcoming_json+=("$(json_obj "project.stage" "$(json_qs "$pid")" state "$(json_qs planned)" title "$(json_qs "$ptitle")")")
    done < <(list_planned_stages "$ACTIVE_DIR")

    mkarr() { if [ "$#" -gt 0 ] && [ -n "${1:-}" ]; then json_arr "$@"; else printf '[]'; fi; }
    data=$(json_obj \
        active_project "$(json_qs "$ACTIVE_PROJECT")" \
        active_stage "$([ -n "$ACTIVE_STAGE_ID" ] && json_qs "$ACTIVE_STAGE_ID" || printf null)" \
        scope "$(json_qs "$scope")" \
        in_flight "$(mkarr "${inflight_json[@]:-}")" \
        unpromoted "$(mkarr "${unpromoted_json[@]:-}")" \
        upcoming "$(mkarr "${upcoming_json[@]:-}")")
    json_emit backlog "$data"
    exit 0
fi

# --- Output ---------------------------------------------------------

echo "${BOLD}Backlog for ${ACTIVE_PROJECT}${RESET}"
if [ -n "$ACTIVE_STAGE_NAME" ]; then
    echo "  ${DIM}Active stage:${RESET} ${ACTIVE_STAGE_NAME}"
else
    echo "  ${DIM}(no active stage in this project yet)${RESET}"
fi
echo ""

# 1) In-flight specs --------------------------------------------------
echo "${BOLD}Specs in flight${RESET}"
if [ -d "$SPECS_DIR" ]; then
    in_flight=()
    for f in "${SPECS_DIR}"/SPEC-*.md; do
        [ -f "$f" ] || continue
        cycle=$(get_spec_cycle "$f")
        # ship cycle still counts as "in flight" only until archived;
        # archived specs live in done/ and we already excluded that.
        case "$cycle" in
            frame|design|build|verify|ship)
                stage_id=$(get_spec_stage_id "$f")
                if [ "$SHOW_ALL" = "1" ] || [ "$stage_id" = "$ACTIVE_STAGE_ID" ]; then
                    name=$(basename "$f" .md)
                    complexity=$(get_spec_complexity "$f")
                    in_flight+=("$cycle|$name|${complexity:-?}|$stage_id")
                fi
                ;;
        esac
    done
    if [ "${#in_flight[@]}" -gt 0 ]; then
        # Sort by cycle order, then by name.
        printf "  ${DIM}(%d total)${RESET}\n" "${#in_flight[@]}"
        for cycle in frame design build verify ship; do
            for entry in "${in_flight[@]}"; do
                IFS='|' read -r c n cx s <<< "$entry"
                if [ "$c" = "$cycle" ]; then
                    if [ "$SHOW_ALL" = "1" ]; then
                        printf "    %-32s cycle: %-7s complexity: %-2s ${DIM}(%s)${RESET}\n" "$n" "$c" "$cx" "$s"
                    else
                        printf "    %-32s cycle: %-7s complexity: %s\n" "$n" "$c" "$cx"
                    fi
                fi
            done
        done
    else
        if [ "$SHOW_ALL" = "1" ]; then
            echo "  ${DIM}(none across all stages)${RESET}"
        else
            echo "  ${DIM}(none in active stage; try --all)${RESET}"
        fi
    fi
else
    echo "  ${DIM}(no specs/ directory yet)${RESET}"
fi
echo ""

# 2) Un-promoted bullets in active stage (or all) ---------------------
echo "${BOLD}Stage backlog (not yet specced)${RESET}"
if [ -d "$STAGES_DIR" ]; then
    if [ "$SHOW_ALL" = "1" ]; then
        any=0
        for s in "${STAGES_DIR}"/STAGE-*.md; do
            [ -f "$s" ] || continue
            sid=$(basename "$s" .md | sed -E 's/^(STAGE-[0-9]+).*/\1/')
            bullets=$(extract_unpromoted_bullets "$s")
            if [ -n "$bullets" ]; then
                any=1
                echo "  — ${sid}"
                while IFS= read -r line; do
                    echo "    $(format_unpromoted_bullet "$line")"
                done <<< "$bullets"
            fi
        done
        if [ "$any" = "0" ]; then echo "  ${DIM}(none)${RESET}"; fi
    else
        if [ -n "$ACTIVE_STAGE_FILE" ]; then
            bullets=$(extract_unpromoted_bullets "$ACTIVE_STAGE_FILE")
            if [ -n "$bullets" ]; then
                echo "  ${DIM}— ${ACTIVE_STAGE_ID}${RESET}"
                while IFS= read -r line; do
                    echo "    $(format_unpromoted_bullet "$line")"
                done <<< "$bullets"
            else
                echo "  ${DIM}(no un-promoted bullets in ${ACTIVE_STAGE_ID})${RESET}"
            fi
        else
            echo "  ${DIM}(no active stage)${RESET}"
        fi
    fi
else
    echo "  ${DIM}(no stages/ directory yet)${RESET}"
fi
echo ""

# 3) Upcoming stages --------------------------------------------------
# Framed-but-not-active stages show a backlog count; planned-but-unframed
# stages (from the brief's Stage Plan, no stage file yet) show their title.
echo "${BOLD}Upcoming stages${RESET}"
if [ -d "$STAGES_DIR" ]; then
    upcoming_any=0
    upcoming_ondisk=" "
    for s in "${STAGES_DIR}"/STAGE-*.md; do
        [ -f "$s" ] || continue
        sid=$(basename "$s" .md | sed -E 's/^(STAGE-[0-9]+).*/\1/')
        upcoming_ondisk="${upcoming_ondisk}${sid} "
        # Skip the active stage and shipped stages.
        if [ "$sid" = "$ACTIVE_STAGE_ID" ]; then continue; fi
        status=$(get_stage_status "$s")
        if [ "$status" = "shipped" ] || [ "$status" = "cancelled" ]; then continue; fi
        sname=$(basename "$s" .md)
        count=$(count_unpromoted_bullets "$s")
        printf "  %-40s framed    %d backlog item%s\n" "$sname" "$count" "$([ "$count" = "1" ] && echo "" || echo "s")"
        upcoming_any=1
    done
    # Planned-but-unframed stages from the brief's Stage Plan.
    while IFS='|' read -r pid ptitle; do
        [ -n "$pid" ] || continue
        case "$upcoming_ondisk" in *" $pid "*) continue ;; esac   # already framed → shown above
        printf "  %-40s planned   %s\n" "$pid" "$ptitle"
        upcoming_any=1
    done < <(list_planned_stages "$ACTIVE_DIR")
    if [ "$upcoming_any" = "0" ]; then echo "  ${DIM}(no upcoming stages)${RESET}"; fi
else
    echo "  ${DIM}(no stages/ directory yet)${RESET}"
fi
