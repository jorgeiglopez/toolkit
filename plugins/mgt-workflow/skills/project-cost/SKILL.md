---
name: project-cost
description: Estimate the total Claude Code cost of the current project. Sums consumed tokens across every transcript — main sessions, subagents, and workflows — then prints a cost table. Use when the user asks how much this project cost, to estimate project spend, or for a project cost breakdown.
---

# Project cost estimate

Run the bundled script from the project directory and relay its output verbatim:

```bash
python3 ~/.claude/skills/project-cost/estimate_cost.py
```

The script auto-detects the project's transcript dir from `$PWD`, sums token
usage across main sessions + subagents + workflows, applies Opus 4.x pricing,
and prints the full markdown report (table, takeaways, prices). Do not add
commentary — the script output is the answer.

Pass an explicit path as `$1` only if auto-detection fails.
