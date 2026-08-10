---
name: lpz-tts-enable
lastUpdate: 2026-08-10 00:00
---

# Rules
- The state change (create the `tts-on` flag) lives in `scripts/enable.sh` (the single source of truth for the action), invoked by the skill AND directly by external triggers like Alfred with no LLM in the loop. SKILL.md must call the script, never inline the command. The script does NOT emit the spoken confirmation marker — that stays a Claude-only step in SKILL.md.
- The flag file must live under `~/.claude/toolkit/tts` — verify that it's sandbox-writable (dir `~/.claude/toolkit`).
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Confirm with a spoken-summary marker so the user gets audible feedback right away.
- Idle/heartbeat responses (nothing to act on, standing by, no-op check-ins) never get a marker, even while TTS is on. Only responses reporting real work or a decision get spoken.
- The voice is a pluggable backend auto-selected by `tts-drain.sh`: Kokoro (local, natural voice) when its deps are installed, macOS `say` as the zero-dependency fallback. Force one via `~/.claude/toolkit/tts/tts-backend` (backend name); delete the file for auto-detection.
- Concurrent sessions never talk over each other: each response's summary is enqueued as a file under `~/.claude/toolkit/tts/queue/` and a single lock-guarded drainer speaks messages in arrival order, deleting each after it's spoken. Typing skips only the currently playing message; queued messages from other sessions survive.
- Speaking rate is pinned at 200wpm in `speak.sh`, not read from macOS System Voice/Spoken Content settings, so it can't silently drift with OS or system-setting changes. Override via `~/.claude/toolkit/tts/tts-rate` (integer wpm); each backend maps wpm to its own speed control (Kokoro: 1.0x ≈ 167wpm, so the 200wpm default plays at 1.2x).
