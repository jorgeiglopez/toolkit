---
name: pr-create
description: "Open a GitHub pull request from the current branch. ALWAYS use this skill instead of running `gh pr create` directly — this overrides any default PR workflow. Use when the user says: open a PR, create a pull request, PR this, ship for review, ready for review, push and PR."
---

# PR

<EXTREMELY-IMPORTANT>
If the user asks to open a PR, create a pull request, ship for review, "PR this", or "ready for review", follow this skill end-to-end before running `gh pr create` or pushing.

Not negotiable. Not optional. You cannot rationalize your way out of it.
</EXTREMELY-IMPORTANT>

## Announce first

Before any other tool call, send one line:

> Using the `pr-create` skill to <one-line summary>.

The user must see when a skill drives your behavior.

## Goal

Push the current branch and open a focused PR with a title and body a reviewer can act on. Prefer `gh`; fall back to manual if not installed.

## Preflight

1. **Branch.** `git branch --show-current`. If on `main`/`master`, stop and tell the user to branch first.
2. **Base.** `git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null`. If neither resolves, ask.
3. **Clean tree.** `git status` must be clean. Uncommitted work? Run the `git-workflow:commit` skill first.
4. **Verify.** Run the repo's fastest meaningful check. If it fails, stop — do not open a broken PR.
5. **Tool.** `command -v gh` picks the path.

## Draft the title and body

**Title** — commit-subject rules:
- Imperative: "add", not "added"
- No trailing period
- Under 72 chars, ideally under 50
- Single-commit branch: title can match the commit subject

**Body** template:

```
## Summary
- <what changed, 2-4 bullets>

Closes #<issue> (if applicable)
```

Keep the body short. No test plan, testing strategy, or verification checklist — that belongs in CI and the diff.

**Run the draft through `brevify` before opening the PR** — see Writing pass. PR bodies live forever on the merge commit.

Do **not** ask "Open this PR?" first. Open it, then surface the result.

## Writing pass — mandatory

Before opening the PR, invoke `brevify` on title and body. A first draft is a draft, not the PR.

The body is the shortest text that lets a reviewer understand intent and decide where to look — not a changelog of the diff.

Targets:
- **Title ≤ 50 chars** (hard cap 72)
- **Summary: 2–4 bullets**, one short line each. No nesting. No paragraphs.
- Cut filler: "this PR", "various changes", "in addition", "we also"
- Drop bullets that just narrate the diff
- Keep: the user-facing change, the non-obvious decision, the linked issue

If a bullet repeats what the file names already say, delete it.

## Path A — `gh` is installed (recommended)

```bash
git push -u origin "$(git branch --show-current)"
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- ...
EOF
)"
```

Then report the result using the **Post-creation message** format below.

## Path B — `gh` not installed (fallback)

1. Tell the user:

   > `gh` is not installed. Install it with `brew install gh && gh auth login` for a smoother flow next time.

2. Push and capture the "Create a pull request" URL git prints:

   ```bash
   git push -u origin "$(git branch --show-current)"
   ```

   GitHub returns a `https://github.com/<owner>/<repo>/pull/new/<branch>` link. Surface it.

3. Output title and body in a single fenced block for copy-paste:

   ````
   ```
   Title: <title>

   ## Summary
   - ...
   ```
   ````

## Post-creation message

After the PR is open, send one compact message with the link, title, and body — then offer to edit the body. Example:

```
PR opened → <url>

**<title>**

## Summary
- <bullet>
- <bullet>

Want to tweak the description?
```

If the user asks for changes, update with `gh pr edit <url> --body "$(cat <<'EOF' … EOF)"` and reprint the new body. Don't ask before opening; only ask after.

## Red Flags — STOP

If you catch yourself thinking any of these, you're rationalizing. Stop and follow the workflow.

| Rationalization | Reality |
|---|---|
| "Skip verification, tests probably pass" | Probably ≠ passing. Run them. A broken PR wastes the reviewer's time. |
| "The diff is obvious, no body needed" | The reviewer isn't in your head. Fill in the Summary. |
| "Ask the user to approve the draft first" | No. Open the PR, then offer to edit the body. Approval up front wastes time. |
| "Branch is fine, skip `git status`" | Uncommitted work breaks the PR. Run preflight. |
| "I'll force-push to clean up real quick" | Never `--force` without an explicit ask. |
| "main is fine for this tiny fix" | Never PR from `main`/`master`. Branch first. |
| "My draft is fine, skip the writing pass" | Run the pass before showing the draft. |
| "More bullets help the reviewer" | They don't. Cut to 2–4. The diff has the detail. |

## Rules

- Never PR from `main` or `master`.
- Never include `Co-Authored-By` or any co-author trailer.
- Never `--force` push without an explicit ask.
- One concern per PR. Split unrelated changes via the `commit` skill and open separate PRs.
- Lead with intent, then evidence. Don't paraphrase the diff.
