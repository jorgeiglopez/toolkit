#!/usr/bin/env bash
# kokoro-setup.sh — check & install everything the kokoro backend needs.
#
# Idempotent: each step is check-first, install-only-if-missing. Safe to
# re-run any time; a fully set-up machine prints "✓ kokoro ready" and exits.
# Not a TTS backend itself — tts-drain.sh only considers names listed in
# BACKEND_PRIORITY, so this file living in backends/ is fine.
#
# Steps:
#   1. Apple Silicon macOS (mlx requirement — otherwise `say` fallback is it)
#   2. uv (brew if available, else the official installer)
#   3. mlx-audio via `uv tool install`, with the two --with pins that make
#      misaki/spacy work inside a uv tool env (see README.md for why)
#   4. prime the Kokoro model + voice cache (one-time network download;
#      the backend then runs with HF_HUB_OFFLINE=1 forever after)
#   5. final verification via kokoro.sh check
set -euo pipefail

MODEL="mlx-community/Kokoro-82M-bf16"
VOICE="af_heart"
MODEL_CACHE="$HOME/.cache/huggingface/hub/models--mlx-community--Kokoro-82M-bf16"
SPACY_WHEEL="https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"

# Resolve through symlinks so we find kokoro.sh next to the real file.
SCRIPT_PATH="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_PATH" ]; do
  LINK_TARGET="$(readlink "$SCRIPT_PATH")"
  case "$LINK_TARGET" in
    /*) SCRIPT_PATH="$LINK_TARGET" ;;
    *) SCRIPT_PATH="$(dirname "$SCRIPT_PATH")/$LINK_TARGET" ;;
  esac
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

# --- 1. platform ------------------------------------------------------------
if [ "$(uname -sm)" != "Darwin arm64" ]; then
  echo "✗ kokoro needs Apple Silicon macOS (mlx); this is $(uname -sm)." >&2
  echo "  Nothing to install — the \`say\` fallback will be used." >&2
  exit 1
fi

# --- 2. uv -------------------------------------------------------------------
if command -v uv >/dev/null 2>&1; then
  UV="$(command -v uv)"
elif [ -x "$HOME/.local/bin/uv" ]; then
  UV="$HOME/.local/bin/uv"
else
  echo "· uv not found — installing…"
  if command -v brew >/dev/null 2>&1; then
    brew install uv
    UV="$(command -v uv)"
  else
    curl -LsSf https://astral.sh/uv/install.sh | sh
    UV="$HOME/.local/bin/uv"
  fi
  [ -x "$UV" ] || { echo "✗ uv install failed" >&2; exit 1; }
  echo "+ uv installed ($UV)"
fi

# --- 3. mlx-audio tool ---------------------------------------------------------
GEN="$HOME/.local/bin/mlx_audio.tts.generate"
[ -x "$GEN" ] || GEN="$(command -v mlx_audio.tts.generate 2>/dev/null || true)"
if [ -z "$GEN" ] || [ ! -x "$GEN" ]; then
  echo "· mlx-audio not found — installing (this pulls a few hundred MB of deps)…"
  # Both --with pins matter: misaki[en] isn't declared by mlx-audio, and the
  # spaCy model wheel can't be fetched lazily inside a uv tool env.
  "$UV" tool install --force \
    --with "misaki[en]" \
    --with "en_core_web_sm @ $SPACY_WHEEL" \
    mlx-audio
  GEN="$HOME/.local/bin/mlx_audio.tts.generate"
  [ -x "$GEN" ] || GEN="$(command -v mlx_audio.tts.generate 2>/dev/null || true)"
  [ -n "$GEN" ] && [ -x "$GEN" ] || { echo "✗ mlx-audio install failed (mlx_audio.tts.generate not on PATH)" >&2; exit 1; }
  echo "+ mlx-audio installed ($GEN)"
fi

# --- 4. model + voice cache -----------------------------------------------------
if [ ! -d "$MODEL_CACHE" ]; then
  echo "· Kokoro model cache missing — priming (~350MB download, one time)…"
  PRIME="$(mktemp -d "${TMPDIR:-/tmp}/kokoro-prime.XXXXXX")"
  trap 'rm -rf "$PRIME"' EXIT
  "$GEN" --model "$MODEL" --voice "$VOICE" --text "setup test" \
    --output_path "$PRIME" --file_prefix prime >/dev/null
  [ -d "$MODEL_CACHE" ] || { echo "✗ model download failed ($MODEL_CACHE still missing)" >&2; exit 1; }
  echo "+ model cache primed"
fi

# --- 5. verify with the backend's own check -----------------------------------
if "$SCRIPT_DIR/kokoro.sh" check; then
  echo "✓ kokoro ready"
else
  echo "✗ kokoro.sh check still failing after setup — investigate manually" >&2
  exit 1
fi
