---
name: pr-create
lastUpdate: 2026-08-15 15:30
---

# Rules
- Preflight before opening: on a branch (never PR from `main`/`master`), clean tree, fastest meaningful check passes.
- Title: imperative, ≤50 chars (hard cap 72), no trailing period.
- Body: 2–4 summary bullets; no test plan, testing strategy, or verification checklist.
- One concern per PR; split unrelated changes via the `commit` skill.
- Open the PR without asking first; offer edits after.
- Never `--force` push without an explicit ask.
- Never include `Co-Authored-By` or any co-author trailer, and no generated-with footer — deliberate override of the Claude Code harness default.
