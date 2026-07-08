#!/usr/bin/env python3
"""Estimate total Claude Code cost of the current project.

Sums token usage across every transcript for this project — main sessions,
subagents, and workflows — and prints a markdown cost table.

Usage: estimate_cost.py [project_dir]
  project_dir: a ~/.claude/projects/<encoded> dir, or any cwd to encode.
  Defaults to $PWD.
"""
import json, os, re, sys, glob
from collections import defaultdict

PRICE = {  # USD per MTok, Opus 4.x standard tier (sonnet/haiku scaled below)
    "opus":   {"input": 15.0, "cw5m": 18.75, "cw1h": 30.0, "cread": 1.5, "output": 75.0},
    "sonnet": {"input": 3.0,  "cw5m": 3.75,  "cw1h": 6.0,  "cread": 0.3, "output": 15.0},
    "haiku":  {"input": 1.0,  "cw5m": 1.25,  "cw1h": 2.0,  "cread": 0.1, "output": 5.0},
}

def tier(m):
    m = m.lower()
    return "opus" if "opus" in m else "sonnet" if "sonnet" in m else "haiku" if "haiku" in m else "opus"

def cost_of(m, v):
    p = PRICE[tier(m)]
    return sum(v[k] * p[k] / 1_000_000 for k in p)

def resolve_project_dir(arg):
    base = os.path.expanduser("~/.claude/projects")
    if arg and os.path.isdir(arg) and os.path.basename(os.path.dirname(arg)) == "projects":
        return arg
    cwd = arg or os.getcwd()
    enc = re.sub(r"[/.]", "-", os.path.abspath(cwd))
    cand = os.path.join(base, enc)
    if os.path.isdir(cand):
        return cand
    # fallback: fuzzy match on trailing path component
    leaf = os.path.basename(os.path.abspath(cwd))
    hits = [d for d in glob.glob(os.path.join(base, "*")) if d.endswith(leaf)]
    if len(hits) == 1:
        return hits[0]
    return cand  # may not exist; caller reports

def bucket_for(path):
    if "/workflows/" in path: return "workflows"
    if "/subagents/" in path: return "subagents"
    return "main"

def collect(root):
    buckets = {b: defaultdict(lambda: defaultdict(int)) for b in ("main", "subagents", "workflows")}
    seen = set()
    for dirpath, _, files in os.walk(root):
        for fn in files:
            if not fn.endswith(".jsonl"):
                continue
            path = os.path.join(dirpath, fn)
            b = buckets[bucket_for(path)]
            try:
                fh = open(path)
            except OSError:
                continue
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    d = json.loads(line)
                except Exception:
                    continue
                if d.get("type") != "assistant":
                    continue
                msg = d.get("message", {})
                u = msg.get("usage")
                if not u:
                    continue
                mid = msg.get("id")
                key = (mid, u.get("output_tokens"), u.get("input_tokens"))
                if mid and key in seen:
                    continue
                if mid:
                    seen.add(key)
                model = msg.get("model", "unknown")
                if model == "<synthetic>":
                    continue
                cc = u.get("cache_creation", {}) or {}
                b[model]["input"] += u.get("input_tokens", 0)
                if cc:
                    b[model]["cw5m"] += cc.get("ephemeral_5m_input_tokens", 0)
                    b[model]["cw1h"] += cc.get("ephemeral_1h_input_tokens", 0)
                else:
                    b[model]["cw5m"] += u.get("cache_creation_input_tokens", 0)
                b[model]["cread"] += u.get("cache_read_input_tokens", 0)
                b[model]["output"] += u.get("output_tokens", 0)
    return buckets

def fmt_tok(n):
    if n >= 1_000_000: return f"{n/1_000_000:.1f}M"
    if n >= 1_000:     return f"{n/1_000:.0f}k"
    return str(n)

def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    root = resolve_project_dir(arg)
    name = os.path.basename(os.getcwd()) if not arg else os.path.basename(root.rstrip("-"))
    if not os.path.isdir(root):
        print(f"No transcripts found for this project.\nLooked in: `{root}`")
        return

    buckets = collect(root)
    rows, totals = {}, 0.0
    opus_cost = 0.0
    for b in ("main", "subagents", "workflows"):
        tok = sum(sum(v.values()) for v in buckets[b].values())
        cost = sum(cost_of(m, v) for m, v in buckets[b].items())
        opus_cost += sum(cost_of(m, v) for m, v in buckets[b].items() if tier(m) == "opus")
        rows[b] = (tok, cost)
        totals += cost

    main_cost = rows["main"][1] or 1e-9
    dom = max(("subagents", "workflows", "main"), key=lambda b: rows[b][1])
    dom_pct = rows[dom][1] / totals * 100 if totals else 0
    undercount = totals / main_cost
    opus_pct = opus_cost / totals * 100 if totals else 0

    label = {"main": "Main (sessions)", "subagents": "Subagents", "workflows": "Workflows"}
    print(f"## Project cost estimate — {name}\n")
    print("| Bucket | Tokens | Cost |")
    print("|---|---|---|")
    for b in ("main", "subagents", "workflows"):
        tok, cost = rows[b]
        print(f"| {label[b]} | {fmt_tok(tok)} | ${cost:,.2f} |")
    tot_tok = sum(rows[b][0] for b in rows)
    print(f"| **Total** | **{fmt_tok(tot_tok)}** | 💰 **${totals:,.2f}** |\n")

    print("**Takeaways**")
    print(f"- {label[dom]} = {dom_pct:.0f}% of spend")
    print(f"- Statusline shows only the session ($ {main_cost:,.0f}) — ~{undercount:.0f}x undercount")
    print(f"- {opus_pct:.0f}% of cost is Opus\n")

    print("_Prices used: Opus 4.x tier — input $15, output $75, cache-write-1h $30, cache-read $1.50 /MTok._")

if __name__ == "__main__":
    main()
