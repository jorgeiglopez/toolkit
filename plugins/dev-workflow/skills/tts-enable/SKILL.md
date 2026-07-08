---
name: tts-enable
description: "Turn on spoken summaries: Claude's <cc-speak> closing summary is read aloud via macOS say after each response. Use when the user says enable tts, tts on, turn on voice, start speaking, or read responses aloud."
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
