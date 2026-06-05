#!/usr/bin/env python3
"""Claude Code status line.
Shows: 📁 dir | git branch+dirty | 🧠 model | 🧮 context | 💰 cost
Reads the session JSON from stdin (see Claude Code statusLine docs).
"""
import sys, json, os, subprocess

# ANSI colors (status line supports them)
def c(code, s): return f"\033[{code}m{s}\033[0m"
BLUE, GREEN, YELLOW, MAGENTA, DIM, RED = "38;5;39", "38;5;42", "38;5;220", "38;5;213", "2", "38;5;203"

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        print("📁 …")
        return

    # Debug: keep the last raw payload so we can refine field names if needed.
    try:
        with open(os.path.expanduser("~/.claude/statusline-debug.json"), "w") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

    parts = []

    # 📁 current directory (basename)
    cwd = (data.get("workspace", {}).get("current_dir")
           or data.get("cwd") or os.getcwd())
    parts.append(c(BLUE, f"📁 {os.path.basename(cwd)}"))

    # branch + dirty marker
    try:
        branch = subprocess.run(
            ["git", "-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=1).stdout.strip()
        if branch:
            dirty = subprocess.run(
                ["git", "-C", cwd, "status", "--porcelain"],
                capture_output=True, text=True, timeout=1).stdout.strip()
            mark = c(YELLOW, "*") if dirty else ""
            col = YELLOW if dirty else GREEN
            parts.append(c(col, f" {branch}") + mark)
    except Exception:
        pass

    # 🧠 model
    model = data.get("model", {}).get("display_name") or data.get("model", {}).get("id")
    if model:
        parts.append(c(MAGENTA, f"🧠 {model}"))

    # 🧮 context size — sum tokens from the latest transcript entry
    ctx = context_tokens(data.get("transcript_path"))
    if ctx is not None:
        LIMIT = 200_000
        pct = ctx / LIMIT * 100
        col = RED if pct >= 75 else (YELLOW if pct >= 50 else DIM)
        parts.append(c(col, f"🧮 {ctx//1000}k ({pct:.0f}%)"))

    # 💰 session cost
    cost = data.get("cost", {}).get("total_cost_usd")
    if isinstance(cost, (int, float)):
        parts.append(c(GREEN, f"💰 ${cost:.2f}"))

    print(c(DIM, " · ").join(parts))

def context_tokens(path):
    """Current context window size = the most recent message's input usage
    (input + cache read + cache creation tokens)."""
    if not path or not os.path.exists(path):
        return None
    try:
        last = None
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                usage = obj.get("message", {}).get("usage")
                if usage:
                    last = usage
        if not last:
            return None
        return (last.get("input_tokens", 0)
                + last.get("cache_read_input_tokens", 0)
                + last.get("cache_creation_input_tokens", 0))
    except Exception:
        return None

if __name__ == "__main__":
    main()
