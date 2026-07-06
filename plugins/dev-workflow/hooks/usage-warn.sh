#!/bin/bash
# Warns the model (via additionalContext) when the 5-hour rate-limit
# window is near exhaustion, so it can pause/wrap up a long task and
# offer to resume after the reset instead of running into a hard stop.
set -f

THRESHOLD=89
DEBOUNCE_SECONDS=300
STATE_FILE="/tmp/claude/usage-warn-last"
LIB="$HOME/.claude/hooks/lib/session-usage.sh"

input=$(cat)
hook_event=$(echo "$input" | jq -r '.hook_event_name // "Hook"' 2>/dev/null)
[ -z "$hook_event" ] || [ "$hook_event" = "null" ] && hook_event="Hook"

usage_data=$(bash "$LIB" 2>/dev/null)
[ -z "$usage_data" ] && exit 0

five_hour_pct=$(echo "$usage_data" | jq -r '.five_hour.utilization // 0' | awk '{printf "%.0f", $1}')
resets_at=$(echo "$usage_data" | jq -r '.five_hour.resets_at // empty')

[ -z "$five_hour_pct" ] && exit 0
[ "$five_hour_pct" -lt "$THRESHOLD" ] 2>/dev/null && exit 0

mkdir -p -m 700 /tmp/claude
now=$(date +%s)
last_warn=0
[ -f "$STATE_FILE" ] && last_warn=$(cat "$STATE_FILE" 2>/dev/null)
[ -z "$last_warn" ] && last_warn=0
elapsed=$(( now - last_warn ))
[ "$elapsed" -lt "$DEBOUNCE_SECONDS" ] 2>/dev/null && exit 0

echo "$now" > "$STATE_FILE"

reset_epoch=""
if [ -n "$resets_at" ] && [ "$resets_at" != "null" ]; then
    stripped="${resets_at%%.*}"
    stripped="${stripped%%Z}"
    stripped="${stripped%%+*}"
    reset_epoch=$(env TZ=UTC date -j -f "%Y-%m-%dT%H:%M:%S" "$stripped" +%s 2>/dev/null)
    [ -z "$reset_epoch" ] && reset_epoch=$(date -d "${resets_at}" +%s 2>/dev/null)
fi

countdown=""
reset_time_str=""
if [ -n "$reset_epoch" ]; then
    remaining=$(( reset_epoch - now ))
    if [ "$remaining" -gt 0 ]; then
        if [ "$remaining" -ge 3600 ]; then
            countdown="$(( remaining / 3600 ))h $(( (remaining % 3600) / 60 ))m"
        else
            countdown="$(( remaining / 60 ))m"
        fi
    fi
    reset_time_str=$(date -j -r "$reset_epoch" +"%l:%M%p" 2>/dev/null | sed 's/^ //; s/\.//g' | tr '[:upper:]' '[:lower:]')
fi

msg="SESSION USAGE WARNING: ${five_hour_pct}% of the 5-hour rate-limit window used."
[ -n "$reset_time_str" ] && msg="${msg} Resets at ${reset_time_str}"
[ -n "$countdown" ] && msg="${msg} (in ${countdown})"
msg="${msg}. If a long-running task is in progress, wrap up cleanly, tell the user, and offer to resume after the reset (e.g. via /schedule) rather than risk running into the limit mid-task."

jq -n --arg event "$hook_event" --arg ctx "$msg" \
  '{hookSpecificOutput: {hookEventName: $event, additionalContext: $ctx}}'

exit 0
