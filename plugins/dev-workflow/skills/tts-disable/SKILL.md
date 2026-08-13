---
name: tts-disable
description: "Turn off spoken summaries: stops reading <cc-speak> blocks aloud and silences any speech in progress. Use when the user says disable tts, tts off, turn off voice, stop speaking, mute, or shut up."
---

# Disable TTS

Stop speaking the cc-speak summaries. Takes effect immediately — the Stop hook
checks the flag on every turn. Responses still contain the spoken-summary
markers; they are just no longer read aloud.

## Steps

1. Run exactly this script (do not inline the commands — the script is the
   single source of truth, also invoked directly by Alfred with no LLM in the loop):
   ```bash
   "${CLAUDE_PLUGIN_ROOT}/skills/tts-disable/scripts/disable.sh"
   ```
   It clears the `tts-on` flag, drops any queued summaries, and rewrites the
   token so speech in progress stops at the next block boundary — each 📢
   marker block plays as one continuous clip, and signals like `pkill` are
   blocked in the sandbox. See `scripts/disable.sh` for the per-step
   rationale.
2. Confirm to the user that TTS is off. Do not add an audible confirmation. Instruct the user that needs to reset the session to stop seen the markers `<!--📢 Speech block -->`
