---
name: weekly-review
lastUpdate: 2026-07-08 00:00
---

# Rules
- Current repo only. No cross-project or multi-repo discovery. If cwd isn't a git repo, say so and stop.
- Filter every `git log` by `--author="$(git config user.email)"`, never let teammates' commits crowd out the user's own work.
- Cover all branches/worktrees: use `git log --all --since="7 days ago"` (or enumerate `git worktree list`) and dedupe by hash, so work in a sibling worktree isn't missed.
- Output is Key Changes plus Watchlist. Zero commits means say so and stop.
- No pattern-evolution or lessons-file tracking, this skill is the digest only.
