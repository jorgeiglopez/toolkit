---
name: weekly-review
description: "Weekly digest of your own commits and PRs, across one repo or many. Use when asked for a weekly review, weekly digest, 'what changed this week', or a summary of recent work across projects."
---

# weekly-review

Summarize what you shipped in the last 7 days: commits and PRs, grouped by theme, with a watchlist for risk.

## Scope

- **Single repo**: current directory is inside a git repo.
- **Multi-repo**: current directory is not a git repo, or the user says "all repos," "across projects," or names a parent folder. Default parent folder: `~/repo/private`. Discover repos beneath it with `find <folder> -maxdepth 3 -name .git -type d`, then aggregate per-repo.

## Author filter

Always filter `git log` by `--author="$(git config user.email)"` so teammates' commits don't drown out the user's own work. In multi-repo mode, run `git config` inside each repo, identities can differ per repo.

## Steps

1. **Gather.** For each repo in scope, collect commits from the last 7 days filtered by author. Read the diff of each significant commit or PR. If a repo has zero commits after filtering, note the week was quiet there and move on.
2. **Analyze and cluster.** Group related commits into themes with user-facing or system impact. Flag security-relevant changes and anything shipped with missing test coverage or rollout risk.
3. **Compose the digest.** Output two sections, Key Changes and Watchlist, grouped by repo in multi-repo mode. Skip repos with no commits. If there are no commits anywhere in scope, say so and stop.

## When to run

- Weekly (e.g. Friday or Monday).
- Whenever asked for a weekly summary or digest of recent work.
