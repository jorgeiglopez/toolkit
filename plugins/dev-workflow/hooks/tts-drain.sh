#!/bin/bash
# TTS queue drainer: speaks queued messages in arrival order, one at a time,
# deleting each file after it's spoken. Spawned by speak.sh after every
# enqueue; an mkdir lock guarantees at most one drainer machine-wide, so
# concurrent Claude sessions never talk over each other.
#
# Interruption is cooperative (signals are blocked in the hook sandbox):
# tts-interrupt.sh rewrites the token file, which skips the CURRENT message
# at its next sentence boundary — the drainer then moves on to the next
# queued message. /lpz-tts-disable removes the flag file; the drainer clears
# the whole queue and exits.

# Resolve through symlinks so BACKEND_DIR finds backends/ next to the real
# source (see speak.sh for why).
SCRIPT_PATH="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_PATH" ]; do
  LINK_TARGET="$(readlink "$SCRIPT_PATH")"
  case "$LINK_TARGET" in
    /*) SCRIPT_PATH="$LINK_TARGET" ;;
    *) SCRIPT_PATH="$(dirname "$SCRIPT_PATH")/$LINK_TARGET" ;;
  esac
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backends"

TTS_DIR="$HOME/.claude/toolkit/tts"
FLAG="$TTS_DIR/tts-on"
TOKEN_FILE="$TTS_DIR/tts-token"
RATE_FILE="$TTS_DIR/tts-rate"
BACKEND_OVERRIDE_FILE="$TTS_DIR/tts-backend"
QUEUE_DIR="$TTS_DIR/queue"
LOCK="$TTS_DIR/speaker.lock"
DBG="$TTS_DIR/tts-debug.log"
mkdir -p "$QUEUE_DIR"

# Preferred backend order. `say` ships with macOS and needs no install step,
# so it stays last — the guaranteed fallback when nothing else is available.
BACKEND_PRIORITY=(kokoro say)

log() { echo "$(date +%H:%M:%S) drain[$$]: $*" >> "$DBG"; }

# Re-picked per message so an install/uninstall mid-queue can't wedge us.
pick_backend() {
  BACKEND=""
  local forced name
  forced=$(cat "$BACKEND_OVERRIDE_FILE" 2>/dev/null)
  if [ -n "$forced" ] && [ -x "$BACKEND_DIR/$forced.sh" ]; then
    BACKEND="$forced"
  else
    for name in "${BACKEND_PRIORITY[@]}"; do
      if [ -x "$BACKEND_DIR/$name.sh" ] && "$BACKEND_DIR/$name.sh" check; then
        BACKEND="$name"
        break
      fi
    done
  fi
  [ -n "$BACKEND" ] || BACKEND="say"
  BACKEND_SCRIPT="$BACKEND_DIR/$BACKEND.sh"
}

acquire() { mkdir "$LOCK" 2>/dev/null && printf '%s' $$ > "$LOCK/pid"; }
release() { rm -rf "$LOCK"; }

while :; do
  if ! acquire; then
    holder=$(cat "$LOCK/pid" 2>/dev/null)
    if [ -n "$holder" ] && ps -p "$holder" >/dev/null 2>&1; then
      exit 0  # a live drainer owns the queue; it will speak our message
    fi
    # Empty/stale pid: give a racing creator a beat to write its pid, then
    # steal only if the holder is still absent or dead.
    sleep 1
    holder=$(cat "$LOCK/pid" 2>/dev/null)
    if [ -z "$holder" ] || ! ps -p "$holder" >/dev/null 2>&1; then
      log "stealing stale lock (holder=${holder:-none})"
      release
    fi
    continue
  fi

  while :; do
    if [ ! -f "$FLAG" ]; then
      rm -f "$QUEUE_DIR"/*
      log "flag off: queue cleared"
      break
    fi
    next=$(ls "$QUEUE_DIR" 2>/dev/null | sort | head -1)
    [ -n "$next" ] || break
    msg="$QUEUE_DIR/$next"
    RATE=$(cat "$RATE_FILE" 2>/dev/null)
    case "$RATE" in ''|*[!0-9]*) RATE=200 ;; esac
    pick_backend
    TOKEN="$$.$(date +%s).$next"
    printf '%s' "$TOKEN" > "$TOKEN_FILE"
    deadline=$(($(date +%s) + 120))
    log "speaking $next (backend $BACKEND, rate $RATE)"
    while IFS= read -r s; do
      [ "$(cat "$TOKEN_FILE" 2>/dev/null)" = "$TOKEN" ] || { log "interrupted: dropping rest of $next"; break; }
      [ "$(date +%s)" -ge "$deadline" ] && { log "deadline: dropping rest of $next"; break; }
      [ -n "$s" ] && printf '%s' "$s" | "$BACKEND_SCRIPT" speak "$RATE"
    done < "$msg"
    rm -f "$msg"
  done

  release
  # Race guard: a producer may have enqueued between our empty check and the
  # release, seen the lock held, and exited trusting us. Re-check and re-run.
  next=$(ls "$QUEUE_DIR" 2>/dev/null | head -1)
  if [ -n "$next" ] && [ -f "$FLAG" ]; then
    log "post-release recheck: queue non-empty, re-acquiring"
    continue
  fi
  log "exit: queue empty"
  exit 0
done
