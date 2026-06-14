#!/bin/bash
# Stop hook (async): speaks the cc-speak marker of the final assistant message
# via macOS `say`. No-op unless the flag file exists. Toggled by /tts-enable and
# /tts-disable. Marker format (HTML comment so markdown rendering survives):
#   <!--📢 spoken summary -->
#
# Sandbox constraints (see dogfooding/README.md gotchas):
#   - only ~/.claude/toolkit is writable inside the hook sandbox
#   - signals to other processes are blocked -> interruption is cooperative:
#     one sentence per `say` call, checking the token file between sentences;
#     rewriting the token (new speaker, tts-interrupt.sh, /tts-disable) stops
#     the loop at the next sentence boundary.
#
# The final assistant message is flushed to the transcript slightly after Stop
# fires, so we poll for a marker NEWER than the last user prompt. Requires
# "async": true in the hook registration or polling would stall every turn.
#
# Every run appends a trace line to ~/.claude/toolkit/tts-debug.log.

TTS_DIR="$HOME/.claude/toolkit"
FLAG="$TTS_DIR/tts-on"
TOKEN_FILE="$TTS_DIR/tts-token"
DBG="$TTS_DIR/tts-debug.log"
mkdir -p "$TTS_DIR"

if [ ! -f "$FLAG" ]; then
  echo "$(date +%H:%M:%S) skip: flag off" >> "$DBG"
  exit 0
fi
echo "$(date +%H:%M:%S) start pid=$$" >> "$DBG"

SENTENCES=$(python3 -c '
import sys, json, os, re, time

LOG = os.path.expanduser("~/.claude/toolkit/tts-debug.log")
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
    # async hooks should still pass stdin; fall back to the newest transcript
    # for this project if the payload is ever missing
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

def scan():
    """(index of last genuine user prompt, index of last marked assistant message, marker)"""
    user_idx, tag_idx, tag = -1, -1, ""
    with open(path) as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue
            if e.get("isSidechain") or e.get("isMeta"):
                continue
            kind = e.get("type")
            content = e.get("message", {}).get("content", [])
            if kind == "user":
                # genuine prompt: plain string or a text block (tool results have
                # neither, so they are excluded)
                if isinstance(content, str) or any(
                    isinstance(b, dict) and b.get("type") == "text" for b in content
                ):
                    user_idx = i
            elif kind == "assistant":
                if isinstance(content, str):
                    text = content
                else:
                    text = "\n".join(
                        b.get("text", "") for b in content
                        if isinstance(b, dict) and b.get("type") == "text"
                    )
                # markers inside fenced code blocks are quoted examples, not speech
                text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
                # current format is the emoji sandwich; cc-speak: kept for
                # backward compatibility
                found = re.findall(r"<!--\s*(?:\U0001F4E2|cc-speak:)(.*?)-->", text, re.DOTALL)
                if found:
                    tag_idx, tag = i, " ".join(m.strip() for m in found)
    return user_idx, tag_idx, tag

prompt_idx, _, _ = scan()
deadline = time.monotonic() + float(os.environ.get("TTS_MAX_WAIT", "15"))
while True:
    u, t, tag = scan()
    if u != prompt_idx:
        log("exit: newer prompt arrived (u %d -> %d)" % (prompt_idx, u))
        sys.exit(0)
    if t > u:
        flat = re.sub(r"\s+", " ", tag).strip()
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", flat) if s.strip()]
        log("speak %d sentence(s) from entry %d" % (len(sentences), t))
        # one sentence per line so the speaker can stop between sentences
        print("\n".join(sentences))
        sys.exit(0)
    if time.monotonic() > deadline:
        log("exit: timeout (u=%d t=%d)" % (u, t))
        sys.exit(0)
    time.sleep(0.25)
')

[ -n "$SENTENCES" ] || exit 0

# Claim the speaker token: any previous speaker stops at its next sentence.
TOKEN="$$.$(date +%s)"
printf '%s' "$TOKEN" > "$TOKEN_FILE"

export TTS_TOKEN="$TOKEN" TTS_TOKEN_FILE="$TOKEN_FILE" TTS_SENTENCES="$SENTENCES" TTS_DBG="$DBG"
nohup bash -c '
  while IFS= read -r s; do
    [ "$(cat "$TTS_TOKEN_FILE" 2>/dev/null)" = "$TTS_TOKEN" ] || { echo "$(date +%H:%M:%S) speaker: interrupted" >> "$TTS_DBG"; exit 0; }
    [ -n "$s" ] && printf "%s" "$s" | say
    echo "$(date +%H:%M:%S) speaker: said sentence (say exit $?)" >> "$TTS_DBG"
  done <<< "$TTS_SENTENCES"
' >/dev/null 2>&1 &

exit 0
