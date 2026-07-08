---
name: weekly-review
description: "Weekly digest of your own commits and PRs in the current repo. Use when asked for a weekly review, weekly digest, 'what changed this week', or a summary of recent work."
---

# weekly-review

Summarize what you shipped in the last 7 days: commits and PRs, grouped by theme, with a watchlist for risk.

## Scope

The current repo only. Run from inside a git repo; if the cwd isn't one, say so and stop. No cross-project or multi-repo discovery.

**Worktrees.** A repo can have several linked worktrees checked out on different branches. Their commits all land in the same shared object store, but a plain `git log` only walks the current branch and misses work done in a sibling worktree this week. Walk every branch with `git log --all --author=... --since="7 days ago"` (or enumerate branches via `git worktree list`), and dedupe by commit hash.

## Author filter

Always filter `git log` by `--author="$(git config user.email)"` so teammates' commits don't drown out the user's own work.

## Steps

1. **Gather.** Collect the current repo's commits from the last 7 days, filtered by author, across all branches/worktrees (see Scope). Read the diff of each significant commit or PR. Zero commits after filtering means a quiet week: say so and stop.
2. **Analyze and cluster.** Group related commits into themes with user-facing or system impact. Flag security-relevant changes and anything shipped with missing test coverage or rollout risk.
3. **Compose the digest.** Output two sections: Key Changes and Watchlist.

## When to run

- Weekly (e.g. Friday or Monday).
- Whenever asked for a weekly summary or digest of recent work.
