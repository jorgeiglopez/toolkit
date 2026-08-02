---
name: lpz-git-worktree
description: "Run two or more agents in one repo without collisions using git worktrees, then merge back cleanly. Use when coordinating parallel work in a single repository, isolating an agent on its own branch"
---

# Worktree Workflow

Multiple agents, one repo, zero collisions. A worktree gives each agent its own working
directory and index on its own branch, so file edits and staging never clash.
Coordination happens on one branch: the **source_of_truth**.

## Announce first

Before any other tool call, send one line:

> Using the `lpz-git-worktree` skill to <one-line summary>.

## Step 0: know where you are

Before anything, detect whether you are already inside a worktree:

```bash
[ "$(git rev-parse --git-dir)" != "$(git rev-parse --git-common-dir)" ] && echo "inside a worktree"
```

Inside a worktree, a request to "work directly on main" cannot be honored
from here: say so immediately and offer the two real options (commit on this
worktree's branch and merge, or switch to the main checkout). Do not attempt
it and explain after.

## source_of_truth: pick it before anything else

The source_of_truth is whichever branch you're on when you start — often `main`,
sometimes a feature branch. Note it first; every step below refers back to it.

```bash
SOURCE_OF_TRUTH=$(git branch --show-current)
```

## Collaboration protocol

1. **Claim first on `source_of_truth`.** Before touching code, mark the task claimed
   in the shared status file (the task board) on `source_of_truth` and push. This is
   the only coordination point — the other agent reads `source_of_truth` to see
   what's taken.
2. **Isolate in a worktree.** Create a worktree on its own branch. All implementation
   happens there, never on the `source_of_truth` checkout. One worktree = one branch
   = one task.
3. **Keep to disjoint file areas.** Work different files/dirs than the other agent. The
   status file is the one shared surface — keep claim edits tiny, immediate, and pushed
   so the contention window is near zero.
4. **Merge back via PR.** For any multi-file change, open a PR, rebase on latest
   `source_of_truth`, run the quality gate, then merge. Cherry-pick only for a tiny
   isolated hotfix.
5. **Un-claim on abandon.** Dropping the work? Remove the worktree and revert the
   claim to pending on `source_of_truth` so the task frees up.

### PR vs cherry-pick

| Situation | PR (default) | Cherry-pick |
|---|---|---|
| Multi-file feature | Preferred — atomic, fully reviewed | Misses files, lands partial state |
| Concurrent commits on `source_of_truth` | Rebase resolves before merge | Picks a stale snapshot; silent conflicts |
| Running the test/quality gate | Gate runs on the merged result | Gate skipped or run on the wrong base |
| One-file hotfix, no deps | Overkill | Acceptable shortcut |

Default to a PR. Reach for cherry-pick only in the last row.

## Setup: symlink expensive artifacts — do NOT reinstall or regenerate

A fresh worktree does **not** contain `node_modules` (it's gitignored), so package
binaries are missing and builds/tests die with `sh: astro: command not found`. The
same problem hits any other expensive, gitignored artifact — build caches, downloaded
models, generated assets. Symlink first; regenerate only if you must.

Do **not** run `npm install` — it re-downloads everything. Instead symlink
`node_modules` from the source_of_truth checkout. Same machine and arch, so the
modules are identical — the link is instant:

```bash
# From inside the worktree. Derive the source_of_truth working tree robustly:
MAIN=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')

# Link node_modules for each package dir that has one.
ln -s "$MAIN/node_modules" node_modules            # root package
ln -s "$MAIN/blog/node_modules" blog/node_modules  # nested package — repeat per dir

# Any other expensive artifact — same move.
ln -s "$MAIN/.cache" .cache
```

Need a new dependency? Don't `npm install` in the worktree — coordinate with the
source_of_truth agent to install it there; your symlink picks it up.

**pnpm ≥ 10 — never `pnpm install` or `pnpm run` here, and never `CI=true`.**
pnpm detects the symlinked `node_modules` as another project's and tries to
purge the modules dir: TTY-less it aborts with
`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` (breaking gate scripts that call
`pnpm install`); with `CI=true` it proceeds and deletes the source_of_truth's
real `node_modules` **through the symlink**. Env overrides
(`npm_config_verify_deps_before_run=false`) do not disable the check. Run gate
steps via the package binaries directly:

```bash
(cd <pkg> && ./node_modules/.bin/tsc --noEmit)
./node_modules/.bin/vitest run
./node_modules/.bin/vite build
```

**Gitignored config the worktree needs** (`.env`, keys): list the patterns in a
`.worktreeinclude` file at the repo root (gitignore syntax); Claude Code's
native worktree flow copies files matching BOTH `.worktreeinclude` and
`.gitignore` into new worktrees automatically. This is a Claude Code feature,
not git (docs: code.claude.com/docs/en/worktrees). Without it, symlink the
files explicitly like any other artifact. Never hand-copy secrets ad hoc.

**Unique runtime resources.** Two worktrees sharing a fixed dev-server port
silently test each other's bundles. Give each worktree its own port, DB name,
and temp dir (e.g. `QA_PORT=81<NN>`, one NN per worktree) and pass it to every
test/server command run there.

Why this is safe:

- Gitignored artifacts are never committed, so a symlink is never committed either.
- Same machine + arch → installed modules are byte-identical to the source of truth.
- Instant vs a full reinstall or rebuild.

Caveats:

- Redo the symlinks for every new worktree.
- If dependencies change, install in the **source_of_truth** checkout, not the
  worktree — the symlink picks it up.

## Command flow

```bash
# 0. On your source_of_truth checkout: note the branch, claim the task, push.
SOURCE_OF_TRUTH=$(git branch --show-current)
git pull
#    edit the status board: mark <task> CLAIMED by <agent>
git add <status-file> && git commit -m "chore: claim <task>" && git push

# 1. Create an isolated worktree on its own branch.
#    Claude Code: use the EnterWorktree tool. Plain git equivalent:
git worktree add .claude/worktrees/<name> -b <branch>
cd .claude/worktrees/<name>

# 2. Symlink expensive artifacts (see section above) — never reinstall here.
MAIN=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')
ln -s "$MAIN/node_modules" node_modules
ln -s "$MAIN/blog/node_modules" blog/node_modules   # per nested package

# 3. Implement in disjoint files, then run the gate.
npm test        # or the repo's pre-flight script
# Also run any other static checks, linters, etc

# 4. Rebase on latest source_of_truth, push, open the PR.
git fetch origin && git rebase "origin/$SOURCE_OF_TRUTH"
git push -u origin <branch>
gh pr create --base "$SOURCE_OF_TRUTH" --title "<title>" --body "..."

# 5. After merge: drop the worktree and delete the branch.
#    Claude Code: use the ExitWorktree tool. Plain git equivalent:
cd "$MAIN"
git worktree remove .claude/worktrees/<name>
git branch -d <branch>
```

### Abandon path (un-claim)

```bash
cd "$MAIN"
git worktree remove --force .claude/worktrees/<name>
git branch -D <branch>
git switch "$SOURCE_OF_TRUTH" && git pull
#    revert the status board: <task> back to PENDING
git add <status-file> && git commit -m "chore: un-claim <task>" && git push
```

## Cleanup sweep (run on demand or after any wave)

Merged work must lose its branch AND its worktree dir together; either one
alone is an orphan. Audit and sweep:

```bash
cd "$MAIN"
git worktree list                     # anything besides the main checkout?
git branch --merged "$SOURCE_OF_TRUTH" | grep -v "$SOURCE_OF_TRUTH"

# For each merged leftover:
git worktree remove .claude/worktrees/<name>
git branch -d <branch>

# Unmerged leftovers: check for salvageable commits before -D
git log "$SOURCE_OF_TRUTH"..<branch> --oneline
git worktree prune
```

Pass bar: `git worktree list` shows only the main checkout and no merged
branches remain. Anything unmerged gets surfaced to the user, not silently
deleted.

## Red Flags — STOP

| Rationalization | Reality |
|---|---|
| "I'll start coding, claim it after" | Claim + push first, or both agents pick the same task. |
| "Just edit on the source_of_truth checkout, it's faster" | You collide with the other agent's index. Use a worktree. |
| "`npm install` in the worktree, no big deal" | Slow re-download. Symlink `node_modules` from the source_of_truth checkout instead. |
| "I need a new dep, I'll just install it here" | Coordinate with the source_of_truth agent — install there, symlink picks it up. |
| "pnpm aborts on the symlink — I'll set `CI=true`" | That abort is the safety net. `CI=true` lets pnpm purge the source_of_truth's `node_modules` through the symlink. Call `./node_modules/.bin/<tool>` directly. |
| "Cherry-pick the branch over, skip the PR" | Cherry-pick drops files and ignores new `source_of_truth` commits. PR + rebase. |
| "Skip the rebase, source_of_truth hasn't moved" | The other agent may have merged. `git fetch && rebase` before merge. |
| "I dropped the task, leaving the claim is fine" | Un-claim it, or the task stays locked forever. |

## Rules

- `source_of_truth` is whichever branch you're on when you start — could be `main` or
  a feature branch. It's the only coordination point; claim edits are tiny, immediate,
  and pushed.
- One worktree = one branch = one task. Never implement on the `source_of_truth`
  checkout.
- Never reinstall or regenerate inside a worktree — symlink expensive artifacts
  (`node_modules` and anything similar) from the source_of_truth checkout. Need a new
  dependency? Coordinate with the source_of_truth agent instead of installing solo.
- pnpm ≥10 with a symlinked `node_modules`: no `pnpm install`/`pnpm run` in the
  worktree, no `CI=true` around them (purge risk through the symlink); invoke
  `./node_modules/.bin/<tool>` directly for gate steps.
- Multi-file change → PR. Cherry-pick only for a one-file hotfix.
- Always rebase on latest `source_of_truth` and run the gate before merging.
- Remove the worktree and delete the branch once merged or abandoned.
- Detect context first (Step 0): inside a worktree, redirect "work directly on
  main" requests instead of attempting them.
- Unique runtime resources per worktree (port, DB name, temp dir); two
  worktrees never share a running server.
- Gitignored config enters via `.worktreeinclude` or explicit symlink, never
  hand-copied.
- Cleanup sweep: merged branches and their worktree dirs die together;
  `git worktree list` + `git branch --merged` is the audit, zero orphans.
