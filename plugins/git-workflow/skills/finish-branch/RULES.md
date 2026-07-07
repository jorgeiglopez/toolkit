---
name: finish-branch
lastUpdate: 2026-07-07 00:00
---

# Rules
- Verify tests pass before presenting any option. Failing tests -> stop, show failures, no menu.
- Detect environment first (normal repo / named worktree / detached HEAD) to pick the right menu: 4 options normally, 3 for detached HEAD (no local merge).
- Present exactly the option set, no open-ended "what next." No extra explanation before the menu.
- Strict order on merge and discard: merge (or confirm discard) first, then remove the worktree, then delete the branch. Always `cd` to the main repo root before `git worktree remove`.
- Only clean up worktrees under `.claude/worktrees/` (see `worktree-workflow`). Never remove a worktree this skill didn't create.
- Never clean up the worktree for "keep as-is" or "push and PR", the user needs it alive.
- Discard requires the literal typed word `discard` before deleting anything.
- Use the `pr-create` skill for the push + PR path, don't duplicate its `gh` logic here. Use `worktree-workflow` for the worktree conventions this skill assumes.
