---
name: lpz-agent-recall-exec
lastUpdate: 2026-07-03 00:00
---

# Rules
- Determine if the transcript to recover was from a team teammate or a regular subagent first — different transcript paths (top-level `.jsonl` vs nested `subagents/agent-<id>.jsonl`). Ask the user if stuck.
- If the project transcript dir is gone, halt and tell the user — nothing to recover.
- Narrow by mtime, then identify candidates by their spawn prompt before extracting.
- Read-only. Never edit or delete transcripts.
- Transcript files are `0600` — don't ship them off the machine.
- Surface recovered content directly to the user; don't paraphrase unless asked.
