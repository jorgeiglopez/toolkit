---
name: create-pr
description: "Open a pull request from the current branch. Use when the user asks to open a PR, raise a PR, create a pull request, ship for review, or says \"make a PR\", \"PR this\", \"open a pull request\", or \"ready for review\"."
---

# PR

## Goal

Push the current branch and open a clean pull request — small, focused, with a title and body a reviewer can act on. Prefer the GitHub CLI (`gh`); fall back to manual steps if it's not installed.

## Preflight

1. **Branch check.** `git branch --show-current`. If on `main` or `master`, stop. Tell the user to create a feature branch first.
2. **Base branch.** `git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null`. If neither resolves, ask.
3. **Sync check.** `git status` should be clean. Uncommitted work? Run the `commit` skill first.
4. **Verification.** Run the repo's fastest meaningful check (tests, lint, or build). If it fails, stop and surface the failure — do not open a broken PR.
5. **Tool check.** `command -v gh` decides the path below.

## Draft the title and body

**Title** follows commit-subject rules:
- Imperative, present tense: "add" not "added"
- No period at the end
- Under 72 characters, ideally under 50
- If the branch contains a single commit, the title can match the commit subject.

**Body** uses this template:

```
## Summary
- <what changed, 2-4 bullets>
- <why it matters>

## Test plan
- [ ] <how a reviewer can verify>
- [ ] <edge cases checked>

Closes #<issue> (if applicable)
```

Show the draft. Ask: "Open this PR?" Wait for "yes."

## Path A — `gh` is installed (recommended)

```bash
git push -u origin "$(git branch --show-current)"
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...
EOF
)"
```

Return the PR URL `gh` prints.

## Path B — `gh` is not installed (fallback)

1. Tell the user:

   > `gh` is not installed. Install it with `brew install gh && gh auth login` for a smoother flow next time.

2. Push the branch and capture the "Create a pull request" URL git prints:

   ```bash
   git push -u origin "$(git branch --show-current)"
   ```

   GitHub's response includes a `https://github.com/<owner>/<repo>/pull/new/<branch>` link. Surface it.

3. Output the title and body inside a single fenced markdown block so the user can copy-paste into the GitHub web form:

   ````
   ```
   Title: <title>

   ## Summary
   - ...

   ## Test plan
   - [ ] ...
   ```
   ````

## Rules

- Never PR from `main` or `master`.
- Never include `Co-Authored-By` or any co-author trailer in the title or body.
- Never `--force` push without an explicit ask.
- One concern per PR. If the diff spans unrelated changes, split commits first (use the `commit` skill) and open separate PRs.
- Do not paraphrase the diff line-by-line in the body. Lead with intent, then evidence.
