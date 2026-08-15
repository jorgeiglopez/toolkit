---
name: commit
lastUpdate: 2026-08-15 15:30
---

# Rules
- Group changes into logically scoped commits a reviewer can follow; split unrelated work. File renames commit alone.
- Subject: Conventional Commits, imperative, ≤50 chars (hard cap 72), no trailing period. Body: why over what, wrap at 72.
- Never `--amend`. We always move forward: fix a faulty landed commit with a new commit on top.
- Never `git add -A` or `git add .` — patch staging or named paths only.
- Never `--no-verify` unless the user asks.
- Never commit secrets, `.env*`, credentials, tokens, or large binaries.
- Each commit must compile and pass the fastest meaningful check.
- Never include `Co-Authored-By` or any co-author trailer — deliberate override of the Claude Code harness default.
