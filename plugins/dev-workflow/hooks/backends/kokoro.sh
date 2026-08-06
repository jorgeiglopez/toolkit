#!/bin/bash
# kokoro backend: Kokoro-82M via mlx-audio, fully local on Apple Silicon.
# Natural-sounding voice; no text leaves the machine. Preferred over `say`
# whenever its dependencies are installed (see README.md for setup).
# Contract: see README.md.
#
# Latency note: each speak call loads the model (~3s warm) before audio
# starts. If that grates, the upgrade path is a persistent Kokoro-FastAPI
# server this script curls instead of invoking mlx_audio per sentence.

MODEL="mlx-community/Kokoro-82M-bf16"
VOICE="af_heart"
MODEL_CACHE="$HOME/.cache/huggingface/hub/models--mlx-community--Kokoro-82M-bf16"
GEN="$HOME/.local/bin/mlx_audio.tts.generate"
[ -x "$GEN" ] || GEN="$(command -v mlx_audio.tts.generate 2>/dev/null)"

case "$1" in
  check)
    [ -n "$GEN" ] && [ -x "$GEN" ] && [ -d "$MODEL_CACHE" ]
    ;;
  speak)
    TEXT="$(cat)"
    [ -n "$TEXT" ] || exit 0
    # tts-rate is wpm with 200 as the pinned default; Kokoro takes a speed
    # multiplier and its 1.0x pace is slower than say's 200wpm, so calibrate
    # 1.0x ~= 167wpm: the 200wpm default lands at 1.2x. Clamped to sane range.
    SPEED=$(awk "BEGIN{ s=${2:-200}/167; if (s<0.5) s=0.5; if (s>2.0) s=2.0; printf \"%.2f\", s }")
    OUT="$(mktemp -d "${TMPDIR:-/tmp}/kokoro.XXXXXX")" || exit 1
    trap 'rm -rf "$OUT"' EXIT
    # HF_HUB_OFFLINE: model + voice are cached; never stall on network checks.
    ERR=$(HF_HUB_OFFLINE=1 "$GEN" --model "$MODEL" --voice "$VOICE" \
      --speed "$SPEED" --text "$TEXT" --output_path "$OUT" --file_prefix out 2>&1 >/dev/null)
    if ! ls "$OUT"/out*.wav >/dev/null 2>&1; then
      echo "kokoro.sh: generation produced no audio: $ERR" >&2
      exit 1
    fi
    for f in "$OUT"/out*.wav; do afplay "$f"; done
    ;;
  *)
    echo "usage: $(basename "$0") {check|speak <rate>}" >&2
    exit 1
    ;;
esac
