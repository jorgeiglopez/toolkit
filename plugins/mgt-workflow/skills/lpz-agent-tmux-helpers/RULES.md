---
name: lpz-agent-tmux-helpers
lastUpdate: 2026-07-08 00:00
---

# Rules

- Two standing teammates, spawned named and in background: `sonnet-agent` (model sonnet) and `haiku-agent` (model haiku).
- The spawn prompt makes them idle by default: stay alive, never exit on their own, act only when instructed by the lead or the user.
- Every report back is a TL;DR of 3 lines max; never full context, transcripts, or file dumps.
- SendMessage with a string message always includes `summary`; omitting it errors ("summary is required when message is a string").
- The lead never sends to "main"; "main" IS the lead. Agents address "main", the lead addresses agents by name.
- `idle_notification` heartbeats are harness noise: no action, no reply, no relay to the user.
- Teardown is TaskStop with verification the process ended, never a shutdown message.
