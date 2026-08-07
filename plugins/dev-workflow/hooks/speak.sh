#!/bin/bash
# Stop hook (async): extracts the 📢 marker of the final assistant message and
# ENQUEUES it for speech — it never speaks directly. A single tts-drain.sh
# instance (spawned below, deduplicated by lock) speaks queued messages in
# arrival order and deletes each after it's spoken, so concurrent Claude
# sessions never talk over each other. Backend selection, rate, and the
# cooperative interruption token all live in tts-drain.sh; the pluggable
# voices live in backends/ (see backends/README.md).
# No-op unless the flag file exists. Toggled by /lpz-tts-enable and
# /lpz-tts-disable. Marker format (HTML comment so markdown rendering
# survives):
#   <!--📢 spoken summary -->
#
# Sandbox constraints:
#   - only ~/.claude/toolkit is writable inside the hook sandbox
#   - signals to other processes are blocked -> interruption is cooperative
#     via the token file (see tts-drain.sh)
#
# The final assistant message is flushed to the transcript slightly after Stop
# fires, so we poll for a marker NEWER than the last user prompt. Requires
# "async": true in the hook registration or polling would stall every turn.

# Resolve through symlinks (the dogfooding harness symlinks this file into
# ~/.claude/hooks/) so tts-drain.sh is found next to the real source, not
# next to wherever this script was invoked from.
SCRIPT_PATH="${BASH_SOURCE[0]}"
while [ -L "$SCRIPT_PATH" ]; do
  LINK_TARGET="$(readlink "$SCRIPT_PATH")"
  case "$LINK_TARGET" in
    /*) SCRIPT_PATH="$LINK_TARGET" ;;
    *) SCRIPT_PATH="$(dirname "$SCRIPT_PATH")/$LINK_TARGET" ;;
  esac
done
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
TTS_DIR="$HOME/.claude/toolkit/tts"
FLAG="$TTS_DIR/tts-on"
QUEUE_DIR="$TTS_DIR/queue"
DBG="$TTS_DIR/tts-debug.log"
mkdir -p "$QUEUE_DIR"

# Rotate debug log if > 100KB
if [ -f "$DBG" ] && [ "$(stat -f%z "$DBG" 2>/dev/null || echo 0)" -gt 102400 ]; then
  tail -100 "$DBG" > "$DBG.tmp" && mv "$DBG.tmp" "$DBG"
fi

if [ ! -f "$FLAG" ]; then
  echo "$(date +%H:%M:%S) skip: flag off" >> "$DBG"
  exit 0
fi
echo "$(date +%H:%M:%S) start pid=$$" >> "$DBG"

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
            # one entry per marker block, whitespace collapsed to a single line;
            # blocks are NOT split into sentences (each is spoken as one clip)
            state["tag"] = [re.sub(r"\s+", " ", m).strip() for m in found if m.strip()]

# Initial full scan to find the last user prompt
state = {"user_idx": -1, "tag_idx": -1, "tag": []}
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
        # tag is already a list of cleaned, single-line blocks (one per marker)
        blocks = [b for b in tag if b]
        log("speak %d block(s) from entry %d" % (len(blocks), t))
        if blocks:
            print("\n".join(blocks))
        sys.exit(0)
    if time.monotonic() > deadline:
        log("exit: timeout (u=%d t=%d)" % (u, t))
        sys.exit(0)
    time.sleep(0.9)
')

[ -n "$SENTENCES" ] || exit 0

# Enqueue atomically: write outside the queue dir, then mv in (same
# filesystem, so the drainer can never read a half-written message). Names
# sort by arrival time; the pid breaks same-second ties between sessions.
MSG_NAME="$(date +%s).$$"
MSG_TMP="$(mktemp "$TTS_DIR/msg.XXXXXX")" || exit 1
printf '%s\n' "$SENTENCES" > "$MSG_TMP"
mv "$MSG_TMP" "$QUEUE_DIR/$MSG_NAME"
echo "$(date +%H:%M:%S) enqueued $MSG_NAME" >> "$DBG"

# Ensure a drainer is running. Extra spawns exit instantly on its lock.
nohup "$SCRIPT_DIR/tts-drain.sh" >>"$DBG" 2>&1 &

exit 0
