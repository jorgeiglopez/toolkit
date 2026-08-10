#!/usr/bin/env bash
# Turn TTS off and silence anything queued or mid-message.
# Deterministic state change, extracted so it can be run WITHOUT an LLM in the
# loop — by the lpz-tts-disable skill, by Alfred, or from any shell. Effect is
# immediate; no restart.
#   - rm tts-on      : clears the enable flag the Stop hook checks each turn.
#   - rm queue/*     : drops summaries other sessions had lined up (disable = silence).
#   - printf 'stop'  : tts-drain.sh re-reads this token between blocks (each
#                      📢 marker block plays as one continuous clip) and
#                      abandons the current message at the next block boundary
#                      (signals like pkill are blocked in the hook sandbox).
set -euo pipefail

TTS_DIR="$HOME/.claude/toolkit/tts"
mkdir -p "$TTS_DIR"
rm -f "$TTS_DIR/tts-on" "$TTS_DIR"/queue/*
printf 'stop' > "$TTS_DIR/tts-token"
