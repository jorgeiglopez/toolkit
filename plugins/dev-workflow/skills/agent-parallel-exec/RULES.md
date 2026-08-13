---
name: agent-parallel-exec
lastUpdate: 2026-07-08 00:00
---

# Rules

- Get crystal clarity on the candidates BEFORE spending any tokens: ask questions, get answers, propose the approaches back, refine. If the approaches aren't clearly different, pin down the difference with the user first.
- Fix the rubric BEFORE spawning anything; no post-hoc scoring criteria.
- One candidate = one agent = one isolated worktree. Candidates never touch the source branch.
- Every candidate worktree gets unique resources (ports, DB names) so parallel runs never share a dev server.
- Identical task prompt across candidates; only the approach section differs.
- Results land in one comparison table; the winner is picked by rubric, or by the user when scores are close.
- Merge the winner into the source branch, run the project gate, then delete ALL candidate branches and worktree dirs (winner's included, it is merged).
- Exit condition is mechanical: `git worktree list` shows only the main checkout and no candidate branches remain. Zero orphans, every time.
