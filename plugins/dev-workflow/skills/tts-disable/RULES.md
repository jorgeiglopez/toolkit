---
name: tts-disable
lastUpdate: 2026-07-03 00:00
---

# Rules
- Rewrite the token file, don't `pkill` — signals are blocked in the sandbox. Rewriting stops speech at the next sentence boundary.
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Don't add an audible confirmation — TTS is off.
- Tell the user to reset the session to stop seeing the `<!--📢-->` markers in responses.
