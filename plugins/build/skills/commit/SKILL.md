---
name: commit
description: "Guidelines how to perform a git commit. Use when the user asks to commit, save changes, commit changes, craft a commit message, stage changes, or split work into multiple commits."
---

# Commit

## Goal

Make commits that are easy to review and safe to ship:
- only intended changes are included
- commits are logically scoped (split when needed)
- messages describe what changed and why

## Workflow

1. **Inspect the working tree**
   - `git status`
   - `git diff HEAD` (staged + unstaged in one pass)
   - `git diff --stat` if many changes
   - `git branch --show-current` — if on `main`/`master`, ask the user whether to create a feature branch first.
   - `git log --oneline -10` to match house style

2. **Decide commit boundaries — split when needed**
   - Split by: feature vs refactor, backend vs frontend, formatting vs logic, tests vs prod code, dependency bumps vs behavior changes.
   - **File renames go in their own commit.** Stage the rename alone so git records it as a rename in history; mixing renames with content edits hides the move.
   - If changes mix inside one file, use patch staging.

3. **Stage only what belongs in the next commit**
   - Patch staging for mixed changes: `git add -p`
   - Unstage a hunk or file: `git restore --staged -p` or `git restore --staged <path>`
   - Never `git add -A` or `git add .`

4. **Review what will actually be committed**
   - `git diff --cached`
   - Reject the staging if you see secrets, tokens, `.env*`, credentials, debug prints, or unrelated churn.

5. **Describe the staged change in one sentence before writing the message**
   - What + why. If you cannot describe it cleanly, the commit is too big or mixed — go back to step 2.

6. **Write the message** (format below).

7. **Run the smallest relevant check** — unit tests, lint, or build — before moving on.

8. **Repeat** until the tree is clean.

## Message format

```
<type>(<scope>): <imperative summary>

Body explaining why this change matters. Wrap at 72.
Cover motivation and trade-offs, not a line-by-line diff.

Fixes #123
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `style`, `revert`. Breaking change: append `!` after type/scope and add a `BREAKING CHANGE:` footer.

**Subject rules:**
- Imperative, present tense: "add" not "added" or "adds"
- No period at the end
- Under 72 characters, ideally under 50

**Example:**

```
fix(auth): handle null session on concurrent login

Two simultaneous login attempts could leave the session lookup
returning nil before the row was written. Add a row-level lock
around the upsert.

Fixes #234
```

## Rules

- Never `--amend`. If a pre-commit hook fails, fix the issue and create a new commit.
- Never `--no-verify` unless the user asks for it.
- Never include a `Co-Authored-By` trailer or any co-author attribution.
- Never include `.env*`, credentials, tokens, or large binaries.
- Each commit should compile and pass the fastest meaningful check.
