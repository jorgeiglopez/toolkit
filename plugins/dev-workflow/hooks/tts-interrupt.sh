#!/bin/bash
# Stops the CURRENTLY PLAYING TTS message at the next sentence boundary.
# Used by the UserPromptSubmit hook (typing interrupts speech) and by
# /lpz-tts-disable. Signals are blocked inside the hook sandbox, so this works
# cooperatively: tts-drain.sh re-reads the token file between sentences and
# drops the rest of the current message when the token no longer matches —
# then continues with the next queued message. Mid-sentence speech cannot be
# cut, and queued messages from other sessions are not discarded.

TTS_DIR="$HOME/.claude/toolkit/tts"
mkdir -p "$TTS_DIR"
printf 'stop' > "$TTS_DIR/tts-token"
exit 0
