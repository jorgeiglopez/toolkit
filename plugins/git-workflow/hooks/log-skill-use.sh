#!/usr/bin/env bash
set -euo pipefail

input=$(cat)

if command -v jq >/dev/null 2>&1; then
  skill_name=$(printf '%s' "$input" | jq -r '.tool_input.skill // "unknown"')
else
  skill_name=$(printf '%s' "$input" | python3 -c 'import json,sys
d=json.load(sys.stdin)
print((d.get("tool_input") or {}).get("skill","unknown"))')
fi

log_file="${HOME}/.claude/skill-usage.log"
mkdir -p "$(dirname "$log_file")"
printf '%s  %s\n' "$(date "+%Y-%m-%d %H:%M:%S")" "$skill_name" >> "$log_file"

if command -v jq >/dev/null 2>&1; then
  jq -nc --arg msg "Skill invoked: $skill_name" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",systemMessage:$msg}}'
else
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","systemMessage":"Skill invoked: %s"}}\n' "$skill_name"
fi
