---
name: lpz-tts-enable
lastUpdate: 2026-07-09 00:00
---

# Rules
- The flag file must live under `~/.claude/toolkit/tts` — verify that it's sandbox-writable (dir `~/.claude/toolkit`).
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Confirm with a spoken-summary marker so the user gets audible feedback right away.
- Idle/heartbeat responses (nothing to act on, standing by, no-op check-ins) never get a marker, even while TTS is on. Only responses reporting real work or a decision get spoken.
- Speaking rate is pinned at 200wpm in `speak.sh`, not read from macOS System Voice/Spoken Content settings, so it can't silently drift with OS or system-setting changes. Override via `~/.claude/toolkit/tts/tts-rate` (integer wpm).
