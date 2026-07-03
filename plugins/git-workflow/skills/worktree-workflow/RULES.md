---
name: worktree-workflow
lastUpdate: 2026-07-02 00:00
---

# Rules
- Before begining any work, take note on which branch are you located. Treat that branch as the source_of_truth (could be main or feature branch)
- Then, claim the task on source_of_truth branch and push before starting any work — source_of_truth is the single coordination point.
- One worktree per branch per task; never implement on the source_of_truth checkout.
- Be smart with the required artifacts:
    - Avoid `npm install` inside a worktree — symlink `node_modules` from the MAIN checkout. Coordinate with the main agent if you need to install a new dependency that will require install.
    - The above was one example, but any other artifact or file that is expensive, conside symlink it first.
- Land multi-file work via a PR (rebase on source_of_truth, run the gate, then merge).
- On abandon, remove the worktree and revert the claim to pending on source_of_truth.
- Clean up after the work is done.
