#!/usr/bin/env bash
# scripts/brag.sh — append an accomplishment to the repo-wide brag log.
# Usage: brag.sh "what you accomplished"
#
# The brag log is ./ACCOMPLISHMENTS.md at the repo root: a single running,
# newest-last list of notable things achieved in this app (zany-animal-slots),
# accumulating across every project/wave of work. Entries may reference the
# project they came from. Promote highlights into stage/project reflections at
# ship time.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

require_initialized

MESSAGE="${*:-}"
if [ -z "$MESSAGE" ]; then
    die "Usage: just brag \"what you accomplished\""
fi

REPO_NAME="$(basename "$REPO_ROOT")"
BRAG_FILE="${REPO_ROOT}/ACCOMPLISHMENTS.md"
if [ ! -f "$BRAG_FILE" ]; then
    cat > "$BRAG_FILE" <<EOF
# Accomplishments — ${REPO_NAME}

A running brag log for this app: notable things shipped or achieved, newest
last, accumulating across every project (wave of work). Append with
\`just brag "..."\`. Promote highlights into stage/project reflections at ship time.

## Log

EOF
fi

printf -- '- %s — %s\n' "$(today)" "$MESSAGE" >> "$BRAG_FILE"
success "Bragged to ${BRAG_FILE#"${REPO_ROOT}/"}"
