#!/usr/bin/env bash
set -euo pipefail

input=$(cat)

if printf '%s' "$input" | grep -q '"tool_input"'; then
  # PreToolUse: extract from tool_input.skill
  if command -v jq >/dev/null 2>&1; then
    skill_name=$(printf '%s' "$input" | jq -r '.tool_input.skill // "unknown"')
  else
    skill_name=$(printf '%s' "$input" | python3 -c 'import json,sys
d=json.load(sys.stdin)
print((d.get("tool_input") or {}).get("skill","unknown"))')
  fi
  hook_event="PreToolUse"
else
  # UserPromptExpansion: extract /skill-name from prompt
  if command -v jq >/dev/null 2>&1; then
    prompt=$(printf '%s' "$input" | jq -r '.prompt // ""')
  else
    prompt=$(printf '%s' "$input" | python3 -c 'import json,sys
d=json.load(sys.stdin)
print(d.get("prompt",""))')
  fi
  skill_name=$(printf '%s' "$prompt" | sed 's|^/\([^ ]*\).*|\1|')
  hook_event="UserPromptExpansion"
fi

log_file="${HOME}/.claude/skill-usage.log"
mkdir -p "$(dirname "$log_file")"
printf '%s  %-25s  %s\n' "$(date "+%Y-%m-%d %H:%M:%S")" "$skill_name" "$hook_event" >> "$log_file"

if [ "$hook_event" = "PreToolUse" ]; then
  if command -v jq >/dev/null 2>&1; then
    jq -nc --arg msg "Skill invoked: $skill_name" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse",systemMessage:$msg}}'
  else
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","systemMessage":"Skill invoked: %s"}}\n' "$skill_name"
  fi
fi
