---
name: commit
description: "Stage files and create a git commit with a Conventional Commits message. ALWAYS use this skill instead of running `git commit` directly. Use when the user asks to commit, save changes, stage files, write a commit message, or split work into commits."
---

# Commit

<EXTREMELY-IMPORTANT>
If the user asks to commit, save, stage, craft a commit message, or split work into commits, follow this skill end-to-end before running `git commit`.

Not negotiable. Not optional. You cannot rationalize your way out of it.

Violating the letter violates the spirit.
</EXTREMELY-IMPORTANT>

## Announce first

Before any other tool call, send one line:

> Using the `commit` skill to <one-line summary>.

The user must see when a skill drives your behavior.

## Goal

Commits that are easy to review and safe to ship:
- only intended changes included
- logically scoped (split when needed)
- messages explain what changed and why

## Workflow

1. **Inspect the working tree**
   - `git status`
   - `git diff HEAD` — staged + unstaged in one pass
   - `git diff --stat` if many changes
   - `git branch --show-current` — if on `main`/`master`, ask whether to branch first
   - `git log --oneline -10` to match house style

2. **Decide commit boundaries — split when needed**
   - Split feature vs refactor, backend vs frontend, formatting vs logic, tests vs prod, deps vs behavior.
   - **File renames go in their own commit.** Stage the rename alone so git records it as a rename; mixing with edits hides the move.
   - For mixed changes inside one file, use patch staging.

3. **Stage only what belongs in this commit**
   - Patch staging: `git add -p`
   - Unstage: `git restore --staged -p` or `git restore --staged <path>`
   - Never `git add -A` or `git add .`

4. **Review the staging**
   - `git diff --cached`
   - Reject if you see secrets, tokens, `.env*`, credentials, debug prints, or unrelated churn.

5. **Describe the change in one sentence — what + why.** If you can't, the commit is too big or mixed; go back to step 2.

6. **Write the message** (format below), then run it through `brevify` — see Writing pass. `git log` is forever.

7. **Run the smallest meaningful check** — tests, lint, or build.

8. **Repeat** until the tree is clean.

9. **Report back** — print the result box (see Report back).

## Writing pass — mandatory

Before `git commit`, invoke `brevify` on the drafted message. A first draft is a draft, not the commit.

A commit message is the shortest text that lets a future reviewer understand the change and decide whether to revert it. Cut any sentence that wouldn't change what a reader does.

Targets:
- **Subject ≤ 50 chars** (hard cap 72)
- **Body ≤ 3 short paragraphs**, ideally one. Wrap at 72.
- Cut filler: "this commit", "basically", "various", "some", "a bit of"
- Cut diff narration: "renamed X to Y, then updated the import" — the diff says that
- Keep: motivation, the non-obvious decision, the trade-off, the bug fixed

If the body is longer than the diff is interesting, the body is wrong.

## Message format

```
<type>(<scope>): <imperative summary>

Body explaining why this change matters. Wrap at 72.
Cover motivation and trade-offs, not a line-by-line diff.

Fixes #123
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `style`, `revert`. Breaking: append `!` after type/scope and add a `BREAKING CHANGE:` footer.

**Subject rules:**
- Imperative: "add", not "added" or "adds"
- No trailing period
- Length budget: see Writing pass

**Example:**

```
fix(auth): handle null session on concurrent login

Two simultaneous login attempts could leave the session lookup
returning nil before the row was written. Add a row-level lock
around the upsert.

Fixes #234
```

## Report back

After the commit(s) land, print this box so the result is easy to spot in the CLI. One line per commit (`<short-hash>  <subject>`):

```
╭─ ✅ Committed ──────────────────────────────╮
│ 9680cdf  refactor(home): rename statusline  │
│ b64b1ea  feat(home): add minimal statusline │
╰─────────────────────────────────────────────╯
```

- Pad the top border to the widest line; keep it tight.
- Pushed too? Swap the title to `✅ Committed & pushed 🚀`.
- Nothing to commit? `╰─ 🟰 Working tree already clean ─╯` (single line, no box).

## Red Flags — STOP

If you catch yourself thinking any of these, you're rationalizing. Stop and follow the workflow.

| Rationalization | Reality |
|---|---|
| "Tiny change, I'll skip the staging review" | Tiny changes hide secrets and churn too. Run `git diff --cached`. |
| "I already know what's in the diff" | Confidence ≠ evidence. Read it. |
| "Just `git add -A` this once" | No. Use `git add -p` or named paths. No exceptions. |
| "I'll combine these unrelated changes" | Split them. Mixed commits are unreviewable. |
| "The user is in a hurry" | Speed comes from doing this once, not from skipping steps. |
| "I'll `--amend` to fix the message" | Never amend. Create a new commit. |
| "My draft is fine, skip the writing pass" | Drafts read worse than you think. Run the pass. |
| "More context is better, leave the body long" | Cut. The reader's attention is the scarce resource. |

## Rules

- Never `--amend`. If a pre-commit hook fails, fix it and create a new commit.
- Never `--no-verify` unless the user asks.
- Never include `Co-Authored-By` or any co-author trailer.
- Never include `.env*`, credentials, tokens, or large binaries.
- Each commit must compile and pass the fastest meaningful check.
