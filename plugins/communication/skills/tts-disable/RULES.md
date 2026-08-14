---
name: tts-disable
lastUpdate: 2026-08-10 00:00
---

# Rules
- The state change lives in `scripts/disable.sh` (the single source of truth for the action), invoked by the skill AND directly by external triggers like Alfred with no LLM in the loop. SKILL.md must call the script, never inline the commands.
- Rewrite the token file, don't `pkill` — signals are blocked in the sandbox. Rewriting stops speech at the next block boundary (each 📢 marker block plays as one continuous clip; mid-block speech can't be cut).
- Also delete everything in `~/.claude/toolkit/tts/queue/` — disable means silence, including messages other sessions already queued.
- Takes effect immediately: the Stop hook checks the flag every turn, no restart needed.
- Don't add an audible confirmation when TTS is off.
- Tell the user to reset the session to stop seeing the `<!--📢-->` markers in responses.
