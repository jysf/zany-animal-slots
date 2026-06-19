#!/usr/bin/env bash
# scripts/new-feedback.sh — scaffold a dated feedback entry from the template.
# Usage: new-feedback.sh "short slug describing the feedback"
#
# Creates feedback/YYYY-MM-DD-<slug>.md from feedback/_template.md (stripping
# the template's instructional preamble) and pre-fills captured_at / captured_by.
# Use this to capture template/process feedback while dogfooding, then set
# status: addressed and link the fix when you act on it.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_lib.sh"

require_initialized

TITLE="${*:-}"
if [ -z "$TITLE" ]; then
    die "Usage: just new-feedback \"short slug\""
fi

TEMPLATE="${REPO_ROOT}/feedback/_template.md"
if [ ! -f "$TEMPLATE" ]; then
    die "Template not found: ${TEMPLATE}"
fi

SLUG="$(slugify "$TITLE")"
DATE="$(today)"
FEEDBACK_FILE="${REPO_ROOT}/feedback/${DATE}-${SLUG}.md"
if [ -f "$FEEDBACK_FILE" ]; then
    die "Feedback entry already exists: ${FEEDBACK_FILE}"
fi

# Copy the template starting from its first YAML front-matter delimiter,
# dropping the human-facing "# Feedback entry template" preamble above it.
awk 'f || /^---[[:space:]]*$/ { f = 1; print }' "$TEMPLATE" > "$FEEDBACK_FILE"

sed_inplace() {
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

sed_inplace "s|^captured_at: .*|captured_at: ${DATE}|" "$FEEDBACK_FILE"
sed_inplace "s|^captured_by: .*|captured_by: claude|" "$FEEDBACK_FILE"

success "Created ${FEEDBACK_FILE#"${REPO_ROOT}/"}"
echo ""
echo "Next: fill in the issue, set source, and (when acted on) status + Resolution."
