#!/bin/bash
# Stops the CURRENTLY PLAYING TTS message at the next block boundary (each
# 📢 marker block is synthesized and played as one continuous clip).
# Used by the UserPromptSubmit hook (typing interrupts speech) and by
# /tts-disable. Signals are blocked inside the hook sandbox, so this works
# cooperatively: tts-drain.sh re-reads the token file between blocks and
# drops the rest of the current message when the token no longer matches —
# then continues with the next queued message. Mid-block speech cannot be
# cut, and queued messages from other sessions are not discarded.

TTS_DIR="$HOME/.claude/toolkit/tts"
mkdir -p "$TTS_DIR"
printf 'stop' > "$TTS_DIR/tts-token"
exit 0
