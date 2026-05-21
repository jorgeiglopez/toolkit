---
name: recall-agent
description: "Recover the verbatim text, tool calls, or messages a subagent or team teammate produced — from its on-disk session transcript. Use when the Agent tool returned only a summary, when a teammate was shut down or TeamDelete'd and you need to dig the synthesis back out, or when you want the full research trail behind a spawn. Read-only."
---

# Recall agent transcript

Recover full output from a spawned agent. Read-only.

## Announce first

Before any other tool call:

> Using the `recall-agent` skill to dig up <what>.

## Step 1 — detect case

| Case | Spawn signal | Transcript path |
|---|---|---|
| **Team teammate** | `Agent` called with `team_name` | `~/.claude/projects/<cwd-sanitized>/<session-uuid>.jsonl` (top-level) |
| **Regular subagent** | `Agent` called without `team_name` | `~/.claude/projects/<cwd-sanitized>/<parent-uuid>/subagents/agent-<id>.jsonl` (nested) |

`<cwd-sanitized>` = pwd with every `/` replaced by `-`. Example: `/Users/me/repo/foo` → `-Users-me-repo-foo`.

Pick from conversation context. If unclear, ask: "Team teammate or regular subagent?"

## Step 2 — sanity check

```bash
PROJ=~/.claude/projects/$(pwd | sed 's|/|-|g')
[ -d "$PROJ" ] || { echo "No project dir at $PROJ — transcripts reaped or wrong cwd"; exit 1; }
```

If the dir is gone, halt and tell the user. `cleanupPeriodDays` (default 30) reaps old transcripts; nothing to recover.

## Step 3 — find the file

Narrow by mtime first. Roughly when did the agent run?

**Team teammate:**

```bash
find "$PROJ" -maxdepth 1 -name '*.jsonl' -mmin -<minutes> -ls
```

Identify which session is which by the spawn prompt:

```bash
for f in "$PROJ"/*.jsonl; do
  echo "=== $(basename $f .jsonl) ==="
  head -1 "$f" | jq -r '.message.content[]?.text? // empty' | head -2
done
```

**Regular subagent:**

```bash
find "$PROJ" -path '*/subagents/agent-*.jsonl' -mmin -<minutes> -ls
```

Same identification trick on the candidates.

## Step 4 — extract

Set `F=<matched-file>`, then pick the pattern.

| Want | Command |
|---|---|
| All assistant text | `jq -r 'select(.type=="assistant").message.content[]?\|select(.type=="text").text' "$F"` |
| All tool calls | `jq -c 'select(.type=="assistant").message.content[]?\|select(.type=="tool_use")\|{name,input}' "$F"` |
| `SendMessage` to a recipient | `jq -c 'select(.type=="assistant").message.content[]?\|select(.type=="tool_use" and .name=="SendMessage" and .input.to=="<name>").input' "$F"` |
| Longest single message body | `python3 -c "import json,sys; m=[c['input'].get('message','') for line in sys.stdin for c in json.loads(line).get('message',{}).get('content',[]) if c.get('type')=='tool_use' and c.get('name')=='SendMessage']; print(max(m,key=len))" < "$F"` |

If a tool result line points at `<session-uuid>/tool-results/*.txt`, read that file too — large outputs spill there instead of inline.

## Rules

- Read-only. Don't edit or delete transcripts.
- Files are `0600`. Don't ship them off the machine.
- Surface the recovered content directly to the user; don't paraphrase unless asked.
