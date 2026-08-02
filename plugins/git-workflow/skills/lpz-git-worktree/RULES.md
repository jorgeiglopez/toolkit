---
name: lpz-git-worktree
lastUpdate: 2026-07-17 00:00
---

# Rules
- Before begining any work, take note on which branch are you located. Treat that branch as the source_of_truth (could be main or feature branch)
- Then, claim the task on source_of_truth branch and push before starting any work — source_of_truth is the single coordination point.
- One worktree per branch per task; never implement on the source_of_truth checkout.
- Be smart with the required artifacts:
    - Avoid `npm install` inside a worktree — symlink `node_modules` from the MAIN checkout. Coordinate with the main agent if you need to install a new dependency that will require install.
    - The above was one example, but any other artifact or file that is expensive, conside symlink it first.
    - pnpm ≥10 with a symlinked `node_modules`: never run `pnpm install` or `pnpm run` in the worktree, and never set `CI=true` around them — pnpm tries to purge the modules dir and would delete the source_of_truth's real `node_modules` through the symlink. Invoke `./node_modules/.bin/<tool>` directly for gate steps.
- Land multi-file work via a PR (rebase on source_of_truth, run the gate, then merge).
- On abandon, remove the worktree and revert the claim to pending on source_of_truth.
- Clean up after the work is done.
- Detect context first: GIT_DIR differing from GIT_COMMON_DIR means you are inside a worktree; redirect "work directly on main" requests instead of attempting them.
- Unique runtime resources per worktree (dev-server port, DB name, temp dir); two worktrees never share a running server.
- Gitignored files a worktree needs (.env, keys) arrive via `.worktreeinclude` or explicit symlink, never hand-copied.
- Cleanup sweep on demand: every branch merged into source_of_truth loses its branch AND its worktree dir together; `git worktree list` + `git branch --merged` is the audit, zero orphans is the pass bar.
