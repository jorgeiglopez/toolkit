#!/bin/bash
# Warns the model (via additionalContext) when the 5-hour rate-limit
# window is near exhaustion, so it can pause/wrap up a long task and
# offer to resume after the reset instead of running into a hard stop.
set -f

THRESHOLD=85
DEBOUNCE_SECONDS=300
STATE_FILE="/tmp/claude/usage-warn-last"
CACHE_FILE="/tmp/claude/statusline-usage-cache.json"
CACHE_MAX_AGE=60

input=$(cat)
hook_event=$(echo "$input" | jq -r '.hook_event_name // "Hook"' 2>/dev/null)
[ -z "$hook_event" ] || [ "$hook_event" = "null" ] && hook_event="Hook"

# Reuses the same cache file as statusline.sh (60s TTL) so the usage API
# is hit at most once per minute combined, never twice.
get_oauth_token() {
    if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
        echo "$CLAUDE_CODE_OAUTH_TOKEN"
        return 0
    fi

    if command -v security >/dev/null 2>&1; then
        local blob
        blob=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)
        if [ -n "$blob" ]; then
            local token
            token=$(echo "$blob" | jq -r '.claudeAiOauth.accessToken // empty' 2>/dev/null)
            if [ -n "$token" ] && [ "$token" != "null" ]; then
                echo "$token"
                return 0
            fi
        fi
    fi

    local creds_file="${HOME}/.claude/.credentials.json"
    if [ -f "$creds_file" ]; then
        local token
        token=$(jq -r '.claudeAiOauth.accessToken // empty' "$creds_file" 2>/dev/null)
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            echo "$token"
            return 0
        fi
    fi

    if command -v secret-tool >/dev/null 2>&1; then
        local blob
        blob=$(timeout 2 secret-tool lookup service "Claude Code-credentials" 2>/dev/null)
        if [ -n "$blob" ]; then
            local token
            token=$(echo "$blob" | jq -r '.claudeAiOauth.accessToken // empty' 2>/dev/null)
            if [ -n "$token" ] && [ "$token" != "null" ]; then
                echo "$token"
                return 0
            fi
        fi
    fi

    echo ""
}

mkdir -p -m 700 /tmp/claude
usage_data=""
needs_refresh=true

if [ -f "$CACHE_FILE" ]; then
    cache_mtime=$(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null)
    now_check=$(date +%s)
    cache_age=$(( now_check - cache_mtime ))
    if [ "$cache_age" -lt "$CACHE_MAX_AGE" ]; then
        needs_refresh=false
        usage_data=$(cat "$CACHE_FILE" 2>/dev/null)
    fi
fi

if $needs_refresh; then
    token=$(get_oauth_token)
    if [ -n "$token" ]; then
        response=$(curl -s --max-time 5 \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -H "anthropic-beta: oauth-2025-04-20" \
            -H "User-Agent: claude-code/2.1.34" \
            "https://api.anthropic.com/api/oauth/usage" 2>/dev/null)
        if [ -n "$response" ] && echo "$response" | jq -e '.five_hour' >/dev/null 2>&1; then
            usage_data="$response"
            echo "$response" > "$CACHE_FILE"
        fi
    fi
    if [ -z "$usage_data" ] && [ -f "$CACHE_FILE" ]; then
        usage_data=$(cat "$CACHE_FILE" 2>/dev/null)
    fi
fi

[ -z "$usage_data" ] && exit 0

five_hour_pct=$(echo "$usage_data" | jq -r '.five_hour.utilization // 0' | awk '{printf "%.0f", $1}')
resets_at=$(echo "$usage_data" | jq -r '.five_hour.resets_at // empty')

[ -z "$five_hour_pct" ] && exit 0
[ "$five_hour_pct" -lt "$THRESHOLD" ] 2>/dev/null && exit 0

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

remaining_pct=$(( 100 - five_hour_pct ))

msg="⚠️ SESSION USAGE WARNING: ⚠️ ${five_hour_pct}% of the 5-hour rate-limit window used, ${remaining_pct}% of budget left."
[ -n "$reset_time_str" ] && msg="${msg} Resets at ${reset_time_str}"
[ -n "$countdown" ] && msg="${msg} (in ${countdown})"
msg="${msg}. This applies ONLY to a long-running, multi-step, or orchestrated task (a Workflow, background Agent/Task run, /loop, /goal, or an extended tool-call sequence) currently in progress. It does NOT apply to a one-off prompt or question, which should just finish normally with no scheduling. If it applies, use the remaining ${remaining_pct}% of budget to wrap up cleanly: persist current progress/state and close any open processes, at your best judgment. Do not wait for user confirmation. Then self-schedule to resume the task at ${reset_time_str:-the reset time} (via ScheduleWakeup, /schedule, or CronCreate, whichever fits) and continue from where you left off."

jq -n --arg event "$hook_event" --arg msg "$msg" \
  '{systemMessage: $msg, hookSpecificOutput: {hookEventName: $event, additionalContext: $msg}}'

exit 0
