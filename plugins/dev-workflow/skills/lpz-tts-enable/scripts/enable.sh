#!/usr/bin/env bash
# Turn TTS on: create the flag the Stop hook checks every turn.
# Deterministic state change, extracted so it can be run WITHOUT an LLM in the
# loop — by the lpz-tts-enable skill, by Alfred, or from any shell. Effect is
# immediate; no restart. It does NOT emit the spoken confirmation marker (that
# is a Claude-only behavior handled in SKILL.md).
set -euo pipefail

TTS_DIR="$HOME/.claude/toolkit/tts"
mkdir -p "$TTS_DIR"
touch "$TTS_DIR/tts-on"
