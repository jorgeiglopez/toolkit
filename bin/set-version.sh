#!/usr/bin/env bash
# Sync every plugin to the central toolkit version (read from ./VERSION).
#
# The toolkit ships all plugins in lockstep — `VERSION` at the repo root is the
# single source of truth. This script propagates that value into every
# `plugins/*/.claude-plugin/plugin.json` and every `.plugins[].version` entry
# in `.claude-plugin/marketplace.json`.
#
# Usage:
#   bin/set-version.sh              # sync everything to whatever VERSION says
#   bin/set-version.sh 0.2.2        # set VERSION to 0.2.2 first, then sync
#
# Requires: jq.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install with: brew install jq" >&2
  exit 1
fi

if [ $# -gt 0 ]; then
  v="$1"
  if ! [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.-]+)?$ ]]; then
    echo "Error: version must be semver (e.g. 0.2.1)" >&2
    exit 1
  fi
  echo "$v" > VERSION
fi

v=$(tr -d '[:space:]' < VERSION)
if [ -z "$v" ]; then
  echo "Error: VERSION is empty" >&2
  exit 1
fi

# Marketplace plugin entries
tmp=$(mktemp)
jq --arg v "$v" '(.plugins[].version) = $v' .claude-plugin/marketplace.json > "$tmp"
mv "$tmp" .claude-plugin/marketplace.json

# Each plugin's plugin.json
count=0
for pj in plugins/*/.claude-plugin/plugin.json; do
  [ -f "$pj" ] || continue
  tmp=$(mktemp)
  jq --arg v "$v" '.version = $v' "$pj" > "$tmp"
  mv "$tmp" "$pj"
  count=$((count + 1))
done

echo "Toolkit version set to ${v} across ${count} plugin manifests + marketplace.json."
