#!/usr/bin/env bash
# Observability hook (mgt-workflow): record every skill invocation.
# Fires on PreToolUse(Skill) and UserPromptExpansion(^/). Reads the hook JSON
# from stdin and appends one line to the mgt-workflow log:
#   timestamp | skill | event | project (cwd) | session id
set -euo pipefail

input=$(cat)

if command -v jq >/dev/null 2>&1; then
  session_id=$(printf '%s' "$input" | jq -r '.session_id // "-"')
  cwd=$(printf '%s' "$input" | jq -r '.cwd // "-"')
  if printf '%s' "$input" | grep -q '"tool_input"'; then
    hook_event="PreToolUse"
    skill_name=$(printf '%s' "$input" | jq -r '.tool_input.skill // "unknown"')
  else
    hook_event="UserPromptExpansion"
    prompt=$(printf '%s' "$input" | jq -r '.prompt // ""')
    skill_name=$(printf '%s' "$prompt" | sed 's|^/\([^ ]*\).*|\1|')
  fi
else
  # Fallback when jq is absent. Tab-delimited so paths with spaces survive.
  IFS=$'\t' read -r hook_event skill_name session_id cwd < <(printf '%s' "$input" | python3 -c '
import json, sys
d = json.load(sys.stdin)
sid = d.get("session_id") or "-"
cwd = d.get("cwd") or "-"
if "tool_input" in d:
    ev, sk = "PreToolUse", (d.get("tool_input") or {}).get("skill", "unknown")
else:
    ev = "UserPromptExpansion"
    p = d.get("prompt", "") or ""
    sk = p[1:].split()[0] if p.startswith("/") else "unknown"
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
    jq -nc --arg msg "Skill invoked: $skill_name" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse",systemMessage:$msg}}'
  else
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","systemMessage":"Skill invoked: %s"}}\n' "$skill_name"
  fi
fi
