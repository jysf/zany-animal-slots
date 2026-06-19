#!/usr/bin/env bash
# scripts/brag.sh — record an accomplishment.
# Usage: brag.sh "what you accomplished"
#
# Prefers the Bragfile CLI (`brag`, https://github.com/ — local-first SQLite at
# ~/.bragfile/db.sqlite) so entries land in the user's real brag corpus,
# auto-associated with this repo's project (brag detects it from cwd). If the
# `brag` CLI isn't installed, falls back to appending a line to ./ACCOMPLISHMENTS.md
# so the template stays portable for people without the CLI.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

require_initialized

MESSAGE="${*:-}"
if [ -z "$MESSAGE" ]; then
    die "Usage: just brag \"what you accomplished\""
fi

if command -v brag >/dev/null 2>&1; then
    # Real Bragfile CLI. Project is auto-detected from the working directory
    # (see `brag project here`); pass --title only.
    brag add --title "$MESSAGE"
    success "Recorded in the Bragfile db (brag list)."
    exit 0
fi

# Fallback: no brag CLI — append to a repo-local markdown log.
BRAG_FILE="${REPO_ROOT}/ACCOMPLISHMENTS.md"
if [ ! -f "$BRAG_FILE" ]; then
    cat > "$BRAG_FILE" <<EOF
# Accomplishments — $(basename "$REPO_ROOT")

A running brag log (fallback when the \`brag\` CLI isn't installed): notable
things shipped or achieved, newest last. Append with \`just brag "..."\`.

## Log

EOF
fi
printf -- '- %s — %s\n' "$(today)" "$MESSAGE" >> "$BRAG_FILE"
success "brag CLI not found — appended to ${BRAG_FILE#"${REPO_ROOT}/"} instead."
