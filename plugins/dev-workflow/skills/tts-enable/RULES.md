---
name: tts-enable
lastUpdate: 2026-07-03 00:00
---

# Rules
- The flag file must live under `~/.claude/toolkit` — the only sandbox-writable dir in `~/.claude`.
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Confirm with a spoken-summary marker so the user gets audible feedback right away.
