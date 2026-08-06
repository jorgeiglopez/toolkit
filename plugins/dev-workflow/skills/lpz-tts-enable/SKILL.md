---
name: lpz-tts-enable
description: "Turn on spoken summaries: Claude's <cc-speak> closing summary is read aloud after each response via a local TTS backend (Kokoro when installed, macOS say fallback). Use when the user says enable tts, tts on, turn on voice, start speaking, or read responses aloud."
---

# Enable TTS

Turn on speaking of `<cc-speak>` summaries. The Stop hook reads this flag on every
turn, so the change applies immediately — no restart.

## Steps

1. Run:
   ```bash
   mkdir -p ~/.claude/toolkit/tts && touch ~/.claude/toolkit/tts/tts-on
   ```
   (The flag lives under `~/.claude/toolkit/tts`; its parent `~/.claude/toolkit` is the only sandbox-writable dir in `~/.claude`.)
2. Confirm to the user that TTS is on. End the response with a spoken-summary
   marker confirming it aloud, so the user gets immediate audible feedback:
   ```
   <!--📢
   Text to speech is now on.
   -->
   ```

## Idle and heartbeat responses

Once TTS is on, idle or heartbeat check-ins (nothing to act on, standing by,
no-op pings) never get a spoken-summary marker. Only add a marker when the
response reports real work done or a decision made.

## Voice backend

`speak.sh` auto-picks the voice each turn: Kokoro (local, natural voice via
mlx-audio) when its dependencies are installed, otherwise macOS `say` — the
zero-dependency fallback. Setup and details: `hooks/backends/README.md` in
the dev-workflow plugin. To force a specific backend:

```bash
echo say > ~/.claude/toolkit/tts/tts-backend   # or kokoro
```

Delete the file to return to auto-detection.

## Changing the speaking rate

Speed is pinned at 200wpm in `speak.sh`, independent of macOS System
Voice / Spoken Content settings (so it can't drift when those change). Each
backend maps wpm onto its own speed control (Kokoro: 1.0x ≈ 167wpm, so the
200wpm default plays at 1.2x). To adjust it, write the new words-per-minute
integer to the rate file:

```bash
echo 170 > ~/.claude/toolkit/tts/tts-rate
```

Takes effect on the next spoken response, no restart needed. Delete the file
to fall back to the 200wpm default.
