---
name: lpz-tts-enable
lastUpdate: 2026-08-06 00:00
---

# Rules
- The flag file must live under `~/.claude/toolkit/tts` — verify that it's sandbox-writable (dir `~/.claude/toolkit`).
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Confirm with a spoken-summary marker so the user gets audible feedback right away.
- Idle/heartbeat responses (nothing to act on, standing by, no-op check-ins) never get a marker, even while TTS is on. Only responses reporting real work or a decision get spoken.
- The voice is a pluggable backend auto-selected by `speak.sh`: Kokoro (local, natural voice) when its deps are installed, macOS `say` as the zero-dependency fallback. Force one via `~/.claude/toolkit/tts/tts-backend` (backend name); delete the file for auto-detection.
- Speaking rate is pinned at 200wpm in `speak.sh`, not read from macOS System Voice/Spoken Content settings, so it can't silently drift with OS or system-setting changes. Override via `~/.claude/toolkit/tts/tts-rate` (integer wpm); each backend maps wpm to its own speed control (Kokoro: 1.0x ≈ 167wpm, so the 200wpm default plays at 1.2x).
