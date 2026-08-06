#!/bin/bash
# Stop hook (async): speaks the 📢 marker of the final assistant message
# through a pluggable TTS backend (see backends/README.md). No-op unless the
# flag file exists. Toggled by /lpz-tts-enable and /lpz-tts-disable. Marker
# format (HTML comment so markdown rendering survives):
#   <!--📢 spoken summary -->
#
# Sandbox constraints:
#   - only ~/.claude/toolkit is writable inside the hook sandbox
#   - signals to other processes are blocked -> interruption is cooperative:
#     one sentence per backend `speak` call, checking the token file between
#     sentences; rewriting the token (new speaker, tts-interrupt.sh,
#     /lpz-tts-disable) stops the loop at the next sentence boundary.
#
# The final assistant message is flushed to the transcript slightly after Stop
# fires, so we poll for a marker NEWER than the last user prompt. Requires
# "async": true in the hook registration or polling would stall every turn.
#
# Speaking rate is pinned to 200wpm (not the macOS default) so it can't drift
# with System Voice / Spoken Content changes. Override by writing an integer
# to ~/.claude/toolkit/tts/tts-rate. Interpretation of the rate is up to the
# active backend.

# Resolve through symlinks (the dogfooding harness symlinks this file into
# ~/.claude/hooks/) so BACKEND_DIR finds backends/ next to the real source,
# not next to wherever this script was invoked from.
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
DBG="$TTS_DIR/tts-debug.log"
mkdir -p "$TTS_DIR"

# Preferred backend order. `say` ships with macOS and needs no install step,
# so it stays last — the guaranteed fallback when nothing else is available.
# Add new backend names here, ahead of `say`, as they're added to backends/.
BACKEND_PRIORITY=(kokoro say)

# Words-per-minute for `say`. Pinned here so speed doesn't drift with macOS
# System Voice / Spoken Content settings. Override by writing an integer to
# $RATE_FILE (see lpz-tts-enable).
RATE=$(cat "$RATE_FILE" 2>/dev/null)
case "$RATE" in
  ''|*[!0-9]*) RATE=200 ;;
esac

# Rotate debug log if > 100KB
if [ -f "$DBG" ] && [ "$(stat -f%z "$DBG" 2>/dev/null || echo 0)" -gt 102400 ]; then
  tail -100 "$DBG" > "$DBG.tmp" && mv "$DBG.tmp" "$DBG"
fi

if [ ! -f "$FLAG" ]; then
  echo "$(date +%H:%M:%S) skip: flag off" >> "$DBG"
  exit 0
fi
echo "$(date +%H:%M:%S) start pid=$$" >> "$DBG"

# Pick a backend: an explicit override wins if set and usable, otherwise the
# first BACKEND_PRIORITY entry whose `check` passes. `say` is always last in
# BACKEND_PRIORITY, so this never falls through empty.
BACKEND=""
FORCED_BACKEND=$(cat "$BACKEND_OVERRIDE_FILE" 2>/dev/null)
if [ -n "$FORCED_BACKEND" ] && [ -x "$BACKEND_DIR/$FORCED_BACKEND.sh" ]; then
  BACKEND="$FORCED_BACKEND"
else
  for name in "${BACKEND_PRIORITY[@]}"; do
    script="$BACKEND_DIR/$name.sh"
    if [ -x "$script" ] && "$script" check; then
      BACKEND="$name"
      break
    fi
  done
fi
[ -n "$BACKEND" ] || BACKEND="say"
BACKEND_SCRIPT="$BACKEND_DIR/$BACKEND.sh"
echo "$(date +%H:%M:%S) backend: $BACKEND" >> "$DBG"

SENTENCES=$(python3 -c '
import sys, json, os, re, time

LOG = os.path.expanduser("~/.claude/toolkit/tts/tts-debug.log")
def log(msg):
    try:
        with open(LOG, "a") as f:
            f.write(time.strftime("%H:%M:%S ") + msg + "\n")
    except OSError:
        pass

raw = sys.stdin.read()
path = ""
try:
    payload = json.loads(raw) if raw.strip() else {}
    path = payload.get("transcript_path", "")
except json.JSONDecodeError:
    log("payload not json (%d bytes)" % len(raw))
if not path:
    proj = os.path.expanduser(
        "~/.claude/projects/" + re.sub(r"[^A-Za-z0-9]", "-", os.getcwd()))
    try:
        cands = [os.path.join(proj, n) for n in os.listdir(proj) if n.endswith(".jsonl")]
        path = max(cands, key=os.path.getmtime) if cands else ""
    except OSError:
        path = ""
    log("fallback transcript: " + (path or "NONE"))
if not path or not os.path.exists(path):
    log("exit: no transcript")
    sys.exit(0)

MARKER_RE = re.compile(r"<!--\s*(?:\U0001F4E2|cc-speak:)(.*?)-->", re.DOTALL)

def parse_entry(raw_line, idx, state):
    raw_line = raw_line.strip()
    if not raw_line:
        return
    try:
        e = json.loads(raw_line)
    except json.JSONDecodeError:
        return
    if e.get("isSidechain") or e.get("isMeta"):
        return
    kind = e.get("type")
    content = e.get("message", {}).get("content", [])
    if kind == "user":
        if isinstance(content, str) or any(
            isinstance(b, dict) and b.get("type") == "text" for b in content
        ):
            state["user_idx"] = idx
    elif kind == "assistant":
        if isinstance(content, str):
            text = content
        else:
            text = "\n".join(
                b.get("text", "") for b in content
                if isinstance(b, dict) and b.get("type") == "text"
            )
        # strip matched code fences, then any unclosed trailing fence
        text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
        text = re.sub(r"```.*$", "", text, flags=re.DOTALL)
        found = MARKER_RE.findall(text)
        if found:
            state["tag_idx"] = idx
            state["tag"] = " ".join(m.strip() for m in found)

# Initial full scan to find the last user prompt
state = {"user_idx": -1, "tag_idx": -1, "tag": ""}
line_count = 0
with open(path) as f:
    for i, line in enumerate(f):
        parse_entry(line, i, state)
        line_count = i + 1
    offset = f.tell()

prompt_idx = state["user_idx"]
max_wait = min(float(os.environ.get("TTS_MAX_WAIT", "15")), 60)
if max_wait != max_wait or max_wait < 1:
    max_wait = 15
deadline = time.monotonic() + max_wait

# Poll only NEW bytes appended after the initial scan
while True:
    with open(path) as f:
        f.seek(offset)
        new_lines = f.readlines()
        new_offset = f.tell()
    # guard against reading a partially-written last line
    if new_lines and not new_lines[-1].endswith("\n"):
        offset = new_offset - len(new_lines[-1].encode("utf-8"))
        new_lines.pop()
    else:
        offset = new_offset
    for j, ln in enumerate(new_lines):
        parse_entry(ln, line_count + j, state)
    line_count += len(new_lines)

    u, t, tag = state["user_idx"], state["tag_idx"], state["tag"]
    if u != prompt_idx:
        log("exit: newer prompt arrived (u %d -> %d)" % (prompt_idx, u))
        sys.exit(0)
    if t > u:
        flat = re.sub(r"\s+", " ", tag).strip()
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", flat) if s.strip()]
        if not sentences and flat:
            sentences = [flat]
        log("speak %d sentence(s) from entry %d" % (len(sentences), t))
        print("\n".join(sentences))
        sys.exit(0)
    if time.monotonic() > deadline:
        log("exit: timeout (u=%d t=%d)" % (u, t))
        sys.exit(0)
    time.sleep(0.9)
')

[ -n "$SENTENCES" ] || exit 0

# Claim the speaker token: any previous speaker stops at its next sentence.
TOKEN="$$.$(date +%s)"
printf '%s' "$TOKEN" > "$TOKEN_FILE"

SPEAKER_DEADLINE=$(($(date +%s) + 120))
export TTS_TOKEN="$TOKEN" TTS_TOKEN_FILE="$TOKEN_FILE" TTS_SENTENCES="$SENTENCES" TTS_DBG="$DBG" TTS_DEADLINE="$SPEAKER_DEADLINE" TTS_RATE="$RATE" TTS_BACKEND="$BACKEND" TTS_BACKEND_SCRIPT="$BACKEND_SCRIPT"
nohup bash -c '
  while IFS= read -r s; do
    [ "$(cat "$TTS_TOKEN_FILE" 2>/dev/null)" = "$TTS_TOKEN" ] || { echo "$(date +%H:%M:%S) speaker: interrupted" >> "$TTS_DBG"; exit 0; }
    [ "$(date +%s)" -ge "$TTS_DEADLINE" ] && { echo "$(date +%H:%M:%S) speaker: deadline" >> "$TTS_DBG"; exit 0; }
    [ -n "$s" ] && printf "%s" "$s" | "$TTS_BACKEND_SCRIPT" speak "$TTS_RATE"
    echo "$(date +%H:%M:%S) speaker: said sentence (backend $TTS_BACKEND, exit $?, rate $TTS_RATE)" >> "$TTS_DBG"
  done <<< "$TTS_SENTENCES"
' >>"$DBG" 2>>"$DBG" &

exit 0
