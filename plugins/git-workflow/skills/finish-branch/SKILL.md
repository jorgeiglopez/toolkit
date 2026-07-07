---
name: finish-branch
description: "Guide completion of a development branch: verify tests, then present exactly 4 options (merge, PR, keep, discard) and execute the choice. Use when implementation is complete and tests pass, or when the user says finish this branch, wrap up this work, or asks what to do with a finished branch."
---

# Finish Branch

## Announce first

Before any other tool call, send one line:

> Using the `finish-branch` skill to wrap up <branch>.

## Goal

Verify tests -> detect environment -> present exactly the right option set -> execute the chosen one -> clean up. Never leave the user with an open-ended "what next?"

Complements `pr-create` (used here for the push+PR path) and `worktree-workflow` (defines the worktree conventions this skill assumes). Don't duplicate their logic, reference them.

## Step 1: Verify tests

Run the project's test suite (or the `pre-flight` script if one exists) before presenting any option.

Tests failing -> stop, show the failures. Do not offer merge or PR options.

## Step 2: Detect environment

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

| State | Menu | Cleanup |
|---|---|---|
| `GIT_DIR == GIT_COMMON` (normal repo) | 4 options | nothing to clean up |
| `GIT_DIR != GIT_COMMON`, named branch (worktree) | 4 options | see Step 5 |
| `GIT_DIR != GIT_COMMON`, detached HEAD | 3 options (no local merge) | none, externally managed |

## Step 3: Determine base branch

`git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null`. Ambiguous -> ask.

## Step 4: Present options and execute

Normal repo or named-branch worktree, exactly these 4, no extra explanation:

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work

Which option?
```

Detached HEAD, exactly these 3 (no local-merge option):

```
1. Push as a new branch and create a Pull Request
2. Keep as-is
3. Discard this work
```

**1. Merge locally**

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git checkout <base-branch> && git pull
git merge <feature-branch>
<test command>          # verify the merged result, not just the branch
```

Merge succeeded -> clean up worktree (Step 5) -> `git branch -d <feature-branch>`. Never delete the branch before the worktree is gone: `git branch -d` fails while a worktree still references it.

**2. Push and create PR**: hand off to the `pr-create` skill for the push, `gh pr create`, and body writing. Do not duplicate its logic here. Do not clean up the worktree, the user needs it alive to iterate on review feedback.

**3. Keep as-is**: report the branch name and worktree path. No cleanup.

**4. Discard**: confirm first:

```
This will permanently delete:
- Branch <name>
- Commits: <list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for the literal typed word. Confirmed -> `cd` to the main root -> clean up worktree (Step 5) -> `git branch -D <feature-branch>`.

## Step 5: Clean up worktree (Options 1 and 4 only)

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

`GIT_DIR == GIT_COMMON` -> normal repo, nothing to remove, done.

Worktree path under `.claude/worktrees/` (this toolkit's convention, see `worktree-workflow`) -> we own cleanup:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune
```

Anywhere else -> the harness or user manages this workspace. Use the `ExitWorktree` tool if available, otherwise leave it in place. Don't remove a worktree you didn't create.

## Red flags - stop

| Rationalization | Reality |
|---|---|
| "Tests probably still pass" | Verify. A broken merge or PR wastes everyone's time. |
| "Delete the branch, then clean up the worktree" | Order matters: merge -> remove worktree -> delete branch. Reversed, it fails or corrupts state. |
| "Skip confirmation, they clearly want to discard" | Always require the typed `discard`. |
| "Clean up the worktree for the PR option too" | Never for Option 2. The user needs it alive for review iteration. |
| "Run `git worktree remove` from inside it" | `cd` to the main root first, or it fails silently. |
| "This worktree isn't under `.claude/worktrees/`, clean it anyway" | Provenance check first. Only remove what this skill or `worktree-workflow` created. |

## Rules

- Verify tests before presenting any option; failing tests stop the flow.
- Detect environment before the menu: 4 options normally, 3 for detached HEAD.
- Exactly the listed options, no extra explanation, no open-ended question.
- Merge/discard before worktree removal before branch delete; `cd` to main root first.
- Clean up worktrees only under `.claude/worktrees/`, only for Options 1 and 4.
- Discard needs the literal typed word `discard`.
- Delegate the push+PR mechanics to `pr-create`; don't reimplement them here.
