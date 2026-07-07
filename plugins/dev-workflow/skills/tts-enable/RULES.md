---
name: tts-enable
lastUpdate: 2026-07-08 00:00
---

# Rules
- The flag file must live under `~/.claude/toolkit` — the only sandbox-writable dir in `~/.claude`.
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Confirm with a spoken-summary marker so the user gets audible feedback right away.
- Idle/heartbeat responses (nothing to act on, standing by, no-op check-ins) never get a marker, even while TTS is on. Only responses reporting real work or a decision get spoken.
