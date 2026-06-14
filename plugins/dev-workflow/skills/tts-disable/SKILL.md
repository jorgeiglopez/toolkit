---
name: tts-disable
description: "Turn off spoken summaries: stops reading <cc-speak> blocks aloud and silences any speech in progress. Use when the user says disable tts, tts off, turn off voice, stop speaking, mute, or shut up."
---

# Disable TTS

Stop speaking the cc-speak summaries. Takes effect immediately — the Stop hook
checks the flag on every turn. Responses still contain the spoken-summary
markers; they are just no longer read aloud.

## Steps

1. Run:
   ```bash
   rm -f ~/.claude/toolkit/tts-on; printf 'stop' > ~/.claude/toolkit/tts-token
   ```
   (Rewriting the token stops any speech in progress at the next sentence
   boundary — signals like `pkill` are blocked in the sandbox.)
2. Confirm to the user that TTS is off. Do not add an audible confirmation. Instruct the user that needs to reset the session to stop seen the markers `<!--📢 Speech block -->`
