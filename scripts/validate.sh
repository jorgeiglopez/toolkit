#!/usr/bin/env bash
# Validate the toolkit's structural invariants. Run before every ship.
#
# FAILURES (exit 1):
#   - skill folder missing SKILL.md or RULES.md (the RULES.md contract)
#   - SKILL.md frontmatter missing name/description, or name != folder name
#   - non-kebab-case skill folder name
#   - RULES.md frontmatter missing name/lastUpdate
#   - version drift: VERSION vs marketplace.json vs plugin.json files
#   - plugin dir not registered in marketplace.json (or vice versa)
#
# WARNINGS (reported, exit 0 unless --strict):
#   - RULES drift heuristic: SKILL.md last committed after RULES.md
#   - em dash (U+2014) found in a skill/agent markdown file
#   - SKILL.md description over 1024 chars
#
# Usage: scripts/validate.sh [--strict]

set -uo pipefail
cd "$(dirname "$0")/.."

STRICT=0
[ "${1:-}" = "--strict" ] && STRICT=1

fails=0
warns=0
fail() { echo "FAIL: $*" >&2; fails=$((fails + 1)); }
warn() { echo "warn: $*" >&2; warns=$((warns + 1)); }

command -v jq >/dev/null 2>&1 || { echo "Error: jq required (brew install jq)" >&2; exit 1; }

# frontmatter <file> <key> -> value (empty if missing)
frontmatter() {
  awk -v key="$2" '
    NR==1 && $0=="---" { inside=1; next }
    inside && $0=="---" { exit }
    inside && index($0, key ":")==1 { sub(key ":[[:space:]]*", ""); print; exit }
  ' "$1"
}

## 1. Versions in lockstep
version=$(tr -d '[:space:]' < VERSION 2>/dev/null || true)
[ -z "$version" ] && fail "VERSION file missing or empty"
if [ -n "$version" ]; then
  while IFS= read -r v; do
    [ "$v" = "$version" ] || fail "marketplace.json has version $v, VERSION says $version"
  done < <(jq -r '.plugins[].version' .claude-plugin/marketplace.json)
  for pj in plugins/*/.claude-plugin/plugin.json; do
    v=$(jq -r '.version // empty' "$pj")
    [ "$v" = "$version" ] || fail "$pj has version ${v:-<none>}, VERSION says $version"
  done
fi

## 2. Marketplace registration matches plugin dirs
registered=$(jq -r '.plugins[].source' .claude-plugin/marketplace.json | sed 's|^\./plugins/||')
for dir in plugins/*/; do
  name=$(basename "$dir")
  echo "$registered" | grep -qx "$name" || fail "plugins/$name not registered in marketplace.json"
  [ -f "plugins/$name/.claude-plugin/plugin.json" ] || fail "plugins/$name missing .claude-plugin/plugin.json"
done
while IFS= read -r name; do
  [ -d "plugins/$name" ] || fail "marketplace.json registers ./plugins/$name but the dir does not exist"
done <<< "$registered"

## 3. Skill contract
for skill in plugins/*/skills/*/; do
  sname=$(basename "$skill")
  smd="$skill/SKILL.md"; rmd="$skill/RULES.md"

  echo "$sname" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$' || fail "$sname: folder name not kebab-case"
  [ -f "$smd" ] || { fail "$sname: missing SKILL.md"; continue; }
  [ -f "$rmd" ] || fail "$sname: missing RULES.md (the contract requires the pair)"

  fm_name=$(frontmatter "$smd" name)
  fm_desc=$(frontmatter "$smd" description)
  [ -n "$fm_name" ] || fail "$sname: SKILL.md frontmatter missing name"
  [ -n "$fm_desc" ] || fail "$sname: SKILL.md frontmatter missing description"
  [ -z "$fm_name" ] || [ "$fm_name" = "$sname" ] || fail "$sname: SKILL.md name '$fm_name' != folder name"
  [ ${#fm_desc} -le 1024 ] || warn "$sname: description over 1024 chars (${#fm_desc})"

  if [ -f "$rmd" ]; then
    [ -n "$(frontmatter "$rmd" name)" ] || fail "$sname: RULES.md frontmatter missing name"
    [ -n "$(frontmatter "$rmd" lastUpdate)" ] || fail "$sname: RULES.md frontmatter missing lastUpdate"

    # Drift heuristic: SKILL.md committed after RULES.md suggests an unreviewed drift.
    st=$(git log -1 --format=%ct -- "$smd" 2>/dev/null)
    rt=$(git log -1 --format=%ct -- "$rmd" 2>/dev/null)
    if [ -n "$st" ] && [ -n "$rt" ] && [ "$st" -gt "$rt" ]; then
      warn "$sname: SKILL.md committed after RULES.md; check for drift"
    fi
  fi
done

## 4. Em dashes (banned by house style; single summary, details via grep)
# Skills that teach about em dashes (brevify, humanify) hit this legitimately,
# so it stays a warning. Investigate with: grep -rln $'—' plugins/
emdash_count=$(grep -rl $'—' plugins/*/skills plugins/*/agents 2>/dev/null | wc -l | tr -d ' ')
[ "$emdash_count" -gt 0 ] && warn "em dash found in $emdash_count file(s) under plugins/ (see header for grep)"

## Result
echo ""
echo "validate: $fails failure(s), $warns warning(s)"
[ "$fails" -gt 0 ] && exit 1
[ "$STRICT" = "1" ] && [ "$warns" -gt 0 ] && exit 1
exit 0
