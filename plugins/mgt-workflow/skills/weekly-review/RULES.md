---
name: weekly-review
lastUpdate: 2026-07-04 00:00
---

# Rules
- Filter every `git log` by `--author="$(git config user.email)"`, never let teammates' commits crowd out the user's own work.
- Single-repo when cwd is a git repo; multi-repo when it isn't, or the user says "all repos" / names a parent folder. Default multi-repo parent: `~/repo/private`.
- Multi-repo: discover with `find <folder> -maxdepth 3 -name .git -type d`, run `git config` per repo (identities can differ), aggregate per-repo, skip repos with zero commits.
- Output is Key Changes plus Watchlist, grouped by repo in multi-repo mode. No commits anywhere means say so and stop.
- No pattern-evolution or lessons-file tracking, this skill is the digest only.
