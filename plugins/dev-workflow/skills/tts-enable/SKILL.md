---
name: tts-enable
description: "Turn on spoken summaries: Claude's <cc-speak> closing summary is read aloud after each response via a local TTS backend (Kokoro when installed, macOS say fallback). Use when the user says enable tts, tts on, turn on voice, start speaking, or read responses aloud."
---

# Enable TTS

Turn on speaking of `<cc-speak>` summaries. The Stop hook reads this flag on every
turn, so the change applies immediately — no restart.

## Steps

1. Run exactly this script (do not inline the command — the script is the
   single source of truth, also invoked directly by Alfred with no LLM in the loop):
   ```bash
   "${CLAUDE_PLUGIN_ROOT}/skills/tts-enable/scripts/enable.sh"
   ```
   It creates the `tts-on` flag under `~/.claude/toolkit/tts` (whose parent
   `~/.claude/toolkit` is the only sandbox-writable dir in `~/.claude`).
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

## Voice backend and queue

Spoken summaries are queued, not raced: each response's summary lands in
`~/.claude/toolkit/tts/queue/` and a single drainer speaks them in arrival
order (deleting each afterwards), so parallel sessions never talk over each
other. Typing skips only the message currently playing.

The drainer auto-picks the voice per message: Kokoro (local, natural voice
via mlx-audio) when its dependencies are installed, otherwise macOS `say` —
the zero-dependency fallback. Setup and details: `hooks/backends/README.md`
in the dev-workflow plugin. To force a specific backend:

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

## Changing the volume

Volume is a decimal linear gain applied at playback (`afplay -v`), read per
message from the volume file. The default is 1.8, calibrated to lift
Kokoro-82M's quiet WAVs to roughly `say`'s level (clamped to 0.1–4.0; too
high clips). The `say` backend speaks through the system synthesizer with no
gain hook, so it ignores this setting. To adjust:

```bash
echo 2.5 > ~/.claude/toolkit/tts/tts-volume
```

Takes effect on the next spoken response, no restart needed. Delete the file
to fall back to the 1.8 default.
