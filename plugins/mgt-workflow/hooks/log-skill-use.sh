#!/usr/bin/env bash
# Observability hook (mgt-workflow): record every skill invocation.
# Fires on PreToolUse(Skill) and UserPromptExpansion (all slash commands). Reads the hook JSON
# from stdin and appends one line to the mgt-workflow log:
#   timestamp | skill | event | project (cwd) | session id
set -euo pipefail

input=$(cat)

if command -v jq >/dev/null 2>&1; then
  session_id=$(printf '%s' "$input" | jq -r '.session_id // "-"')
  cwd=$(printf '%s' "$input" | jq -r '.cwd // "-"')
  hook_event=$(printf '%s' "$input" | jq -r '.hook_event_name // "UserPromptExpansion"')
  if [ "$hook_event" = "PreToolUse" ]; then
    skill_name=$(printf '%s' "$input" | jq -r '.tool_input.skill // "unknown"')
  else
    skill_name=$(printf '%s' "$input" | jq -r '.command_name // "unknown"')
  fi
else
  # Fallback when jq is absent. Tab-delimited so paths with spaces survive.
  IFS=$'\t' read -r hook_event skill_name session_id cwd < <(printf '%s' "$input" | python3 -c '
import json, sys
d = json.load(sys.stdin)
sid = d.get("session_id") or "-"
cwd = d.get("cwd") or "-"
ev = d.get("hook_event_name") or "UserPromptExpansion"
if ev == "PreToolUse":
    sk = (d.get("tool_input") or {}).get("skill", "unknown")
else:
    sk = d.get("command_name") or "unknown"
print("\t".join([ev, sk, sid, cwd]))')
fi

[ -n "${cwd:-}" ] || cwd="-"
[ -n "${session_id:-}" ] || session_id="-"

log_dir="${HOME}/.claude/toolkit/mgt-workflow"
log_file="${log_dir}/skill-usage.log"
mkdir -p "$log_dir"
printf '%s | %-15s | %-20s | %s | %s\n' \
  "$(date "+%Y-%m-%d %H:%M:%S")" "$skill_name" "$hook_event" "$cwd" "$session_id" >> "$log_file"

if [ "$hook_event" = "PreToolUse" ]; then
  if command -v jq >/dev/null 2>&1; then
    jq -nc --arg msg "🎹 Skill invoked: $skill_name" '{systemMessage:$msg}'
  else
    printf '{"systemMessage":"🎹 Skill invoked: %s"}\n' "$skill_name"
  fi
fi
