#!/usr/bin/env bash
# SessionStart hook for using-toolkit plugin.
# Injects the using-toolkit bootstrap (skill TOC + mandatory-use rule)
# into the model's context at session start / clear / compact.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SKILL_PATH="${PLUGIN_ROOT}/skills/using-toolkit/SKILL.md"

if [ ! -f "$SKILL_PATH" ]; then
  # Fail open: don't break the session if the skill file is missing.
  exit 0
fi

skill_content=$(cat "$SKILL_PATH")

# JSON-escape via bash parameter substitution. Same approach superpowers uses —
# avoids depending on jq being installed.
escape_for_json() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/\\r}"
  s="${s//$'\t'/\\t}"
  printf '%s' "$s"
}

skill_escaped=$(escape_for_json "$skill_content")

# The literal "\n" sequences below are intentional — they end up in the JSON
# string as escape sequences, which the JSON parser then interprets as newlines.
session_context="<EXTREMELY_IMPORTANT>\nYou have the \`jorgeiglopez-toolkit\` installed.\n\nBelow is the full content of your \`using-toolkit\` bootstrap. For each skill listed in the table of contents, invoke it via the \`Skill\` tool when the user's request matches its triggers — do not run the underlying action directly.\n\n${skill_escaped}\n</EXTREMELY_IMPORTANT>"

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$session_context"
