#!/usr/bin/env bash
# PreToolUse[Bash] guard: block known-bad commands. Config-driven.
#
# Built-in rules (always on, intentionally NOT config-overridable; they are
# the safety floor): bulk git staging, git identity mutation.
# Extra rules per project or user, first match wins:
#   <project>/.claude/blocked-commands.json
#   ~/.claude/blocked-commands.json
# Format: [{"pattern": "<ERE>", "reason": "...", "alternative": "..."}]
# Example entry (project-specific known-bad command):
#   {"pattern": "drizzle-kit push|npm run db:push",
#    "reason": "drizzle-kit push hangs then crashes against this DB (known bug)",
#    "alternative": "follow the schema-update steps in CLAUDE.md"}
#
# Blocking contract: exit 2 + reason on stderr (stdout JSON is unreliable).
# Degrades gracefully: missing jq or malformed config never blocks.
# Scope: a cooperating-model guardrail, not an adversarial sandbox. Known
# accepted bypasses: env-var prefixes (FOO=1 git ...), flags taking a
# separate value that itself looks like a subcommand.

set -uo pipefail

input=$(cat)

# Fast pre-filter before any jq: only Bash calls carry a command.
case "$input" in
  *'"command"'*) ;;
  *) exit 0 ;;
esac

command -v jq >/dev/null 2>&1 || exit 0
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$cmd" ] && exit 0

block() { # reason [alternative]
  echo "BLOCKED: $1" >&2
  [ -n "${2:-}" ] && echo "Instead: $2" >&2
  exit 2
}

## Built-in git hygiene rules (bash-native =~, zero forks per call).
# git_prefix: "git" at command/segment start, tolerating global flags with or
# without a separate value (git --no-pager add, git -C /repo add).
git_prefix='(^|[;&|][[:space:]]*)[[:space:]]*git([[:space:]]+-{1,2}[^[:space:]]+([[:space:]]+[^-;&|[:space:]][^[:space:]]*)?)*[[:space:]]+'
re_add="${git_prefix}"'add[[:space:]]+(-A|--all|-u|--update)([[:space:]]|$)'
re_config="${git_prefix}"'config([[:space:]]+--(global|local|system))?[[:space:]]+user\.(name|email)'
re_inline_c="${git_prefix}"'-c[[:space:]]*user\.(name|email)='

if [[ "$cmd" =~ $re_add ]]; then
  block "bulk staging (git add -A/-u) hides unintended changes" "stage explicit paths, or git add -p"
fi
if [[ "$cmd" =~ $re_config ]] || [[ "$cmd" =~ $re_inline_c ]]; then
  block "sessions never mutate git identity" "leave user.name/user.email untouched"
fi

## Config-driven rules
check_config() {
  local file="$1" n i pattern reason alt
  [ -f "$file" ] || return 0
  n=$(jq 'length' "$file" 2>/dev/null) || return 0
  case "$n" in ''|*[!0-9]*) return 0 ;; esac
  for ((i = 0; i < n; i++)); do
    pattern=$(jq -r ".[$i].pattern // empty" "$file" 2>/dev/null)
    [ -z "$pattern" ] && continue
    if [[ "$cmd" =~ $pattern ]] 2>/dev/null; then
      reason=$(jq -r ".[$i].reason // \"matches blocked pattern\"" "$file")
      alt=$(jq -r ".[$i].alternative // empty" "$file")
      block "$reason (rule in $file)" "$alt"
    fi
  done
}

proj="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
check_config "$proj/.claude/blocked-commands.json"
check_config "$HOME/.claude/blocked-commands.json"

exit 0
