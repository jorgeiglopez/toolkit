#!/usr/bin/env bash
# Stop-hook quality gate. Per-project opt-in; blocks at most once per session.
#
# Opt in by creating <project>/.claude/quality-gate.json:
#   {"command": "./pre-flight.sh", "timeout": 300}
#
# Behavior: when the session ends with a dirty tree or a fresh commit
# (< 60 min), run the gate command. On failure, block the Stop exactly once
# (exit 2 + tail of output on stderr) so the model fixes it; a session marker
# prevents an infinite block loop. No config file, no effect.

set -uo pipefail

input=$(cat)
command -v jq >/dev/null 2>&1 || exit 0

# Never re-block while already continuing from a Stop-hook block.
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ] && exit 0

proj="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cfg="$proj/.claude/quality-gate.json"
[ -f "$cfg" ] || exit 0

gate_cmd=$(jq -r '.command // empty' "$cfg" 2>/dev/null)
[ -z "$gate_cmd" ] && exit 0

session=$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)
marker="/tmp/claude/quality-gate-block-${session}"
[ -f "$marker" ] && exit 0

# Only gate sessions that actually changed something.
if git -C "$proj" rev-parse --git-dir >/dev/null 2>&1; then
  dirty=$(git -C "$proj" status --porcelain 2>/dev/null | head -1)
  last_commit=$(git -C "$proj" log -1 --format=%ct 2>/dev/null || echo 0)
  age=$(( $(date +%s) - last_commit ))
  [ -z "$dirty" ] && [ "$age" -gt 3600 ] && exit 0
fi

timeout_s=$(jq -r '.timeout // 300' "$cfg" 2>/dev/null)
# GNU timeout when present; perl alarm on stock macOS (no coreutils). A gate
# that never exits (watch mode, hung server) must not block Stop forever.
# Output goes to a temp file, not command substitution: orphaned grandchildren
# of a killed gate would hold a $() pipe open past the timeout.
tmp_out=$(mktemp /tmp/claude-stop-gate.XXXXXX)
if command -v timeout >/dev/null 2>&1; then
  ( cd "$proj" && timeout "$timeout_s" bash -c "$gate_cmd" >"$tmp_out" 2>&1 ) 2>/dev/null
  status=$?
elif command -v perl >/dev/null 2>&1; then
  ( cd "$proj" && perl -e 'alarm shift; exec @ARGV' "$timeout_s" bash -c "$gate_cmd" >"$tmp_out" 2>&1 ) 2>/dev/null
  status=$?
else
  ( cd "$proj" && bash -c "$gate_cmd" >"$tmp_out" 2>&1 ) 2>/dev/null
  status=$?
fi
out=$(tail -30 "$tmp_out" 2>/dev/null)
rm -f "$tmp_out"
[ "$status" -eq 0 ] && exit 0

mkdir -p /tmp/claude
touch "$marker"
{
  echo "Quality gate failed: '$gate_cmd' exited $status. Fix it before finishing."
  echo "This gate blocks once per session (marker: $marker). Last output:"
  printf '%s\n' "$out"
} >&2
exit 2
