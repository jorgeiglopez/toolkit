#!/usr/bin/env bash
# Sync every plugin in the jorgeiglopez-toolkit marketplace.
#
# Refreshes the marketplace clone, parses its marketplace.json, then installs
# or updates each plugin listed. Net-new plugins added to the marketplace get
# picked up automatically.
#
# Usage:
#   sync.sh                  # default scope: user
#   TOOLKIT_SYNC_SCOPE=project sync.sh
#
# Requires: claude (CLI), jq.

set -euo pipefail

MARKETPLACE="jorgeiglopez-toolkit"
SCOPE="${TOOLKIT_SYNC_SCOPE:-user}"

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install with: brew install jq" >&2
  exit 1
fi
if ! command -v claude >/dev/null 2>&1; then
  echo "Error: claude CLI not found on PATH." >&2
  exit 1
fi

echo "==> Refreshing marketplace: ${MARKETPLACE}"
claude plugin marketplace update "${MARKETPLACE}"

manifest="${HOME}/.claude/plugins/marketplaces/${MARKETPLACE}/.claude-plugin/marketplace.json"
if [ ! -f "${manifest}" ]; then
  echo "Error: marketplace manifest not found at ${manifest}" >&2
  echo "Has the marketplace been added? Try: claude plugin marketplace add jorgeiglopez/toolkit" >&2
  exit 1
fi

plugins=$(jq -r '.plugins[].name' "${manifest}")
if [ -z "${plugins}" ]; then
  echo "No plugins listed in ${manifest}"
  exit 0
fi

for p in ${plugins}; do
  echo "==> ${p}@${MARKETPLACE}"
  if claude plugin install "${p}@${MARKETPLACE}" -s "${SCOPE}" 2>/dev/null; then
    echo "    installed (or already current)"
  elif claude plugin update "${p}@${MARKETPLACE}" 2>/dev/null; then
    echo "    updated"
  else
    echo "    nothing to do (already at latest version)"
  fi
done

echo
echo "Sync complete. Restart Claude Code to pick up newly installed plugins."
