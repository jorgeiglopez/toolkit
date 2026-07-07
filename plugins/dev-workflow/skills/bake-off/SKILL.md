---
name: bake-off
description: Run N candidate approaches head-to-head in isolated worktrees, score them, merge the winner, delete the losers. Use when the user wants to compare implementations or approaches, says bake-off, try both ways, spawn a few and pick a winner, or asks which of several techniques works best in practice.
---

# bake-off

Competitive evaluation with mechanical cleanup. One invocation covers
dispatch, scoring, comparison, merge, and teardown.

## 1. Frame the contest

Before spawning anything, write down:

- **Candidates**: the distinct approaches (2 to 5). Name each.
- **Rubric**: measurable criteria and weights, fixed now. Good dimensions:
  tests passed, recall/precision on a shared fixture set, latency, lines
  changed, subjective simplicity (1-5). Ask the user only if the rubric is
  genuinely ambiguous.
- **Source branch**: note the current branch; it is the merge target and
  single coordination point. Candidates never commit to it.

## 2. Dispatch

Spawn one agent per candidate, in parallel, each with worktree isolation:

- Identical task prompt; only the "your approach" section differs.
- Unique resources per candidate: pass a distinct port / DB name / temp dir
  in the prompt so parallel dev servers never collide.
- Budget: state a file-count and time ceiling.
- Completion contract: "Implement, run the rubric measurements yourself,
  commit on your worktree branch, and return your final message as:
  scores per rubric dimension + evidence (test output, timings) + branch name."

## 3. Score and pick

Collect results into one table: candidate x rubric dimension, plus total.

- Decisive winner (clear margin on the weighted total): proceed.
- Close call or conflicting evidence: show the table, let the user pick.
- All candidates fail the rubric: stop, report, and recommend a reframe.

## 4. Merge the winner

1. From the source-branch checkout: merge the winner's branch.
2. Run the project gate (pre-flight script or test suite) on the result.
3. Gate fails: fix forward or revert the merge; never leave the source
   branch red.

## 5. Teardown (not optional)

For EVERY candidate, winner included:

```bash
git worktree remove <path>        # or --force after confirming no unmerged work
git branch -d <branch>            # -D only for confirmed losers
```

Before deleting a loser, check for unmerged commits worth salvaging
(`git log <source>..<branch> --oneline`); flag anything interesting to the
user first.

Exit check, mechanical: `git worktree list` shows only the main checkout;
`git branch --list '*<candidate-prefix>*'` is empty. Report the final table,
the merge commit, and this proof.

## Red flags

| Excuse | Reality |
|---|---|
| "The winner is obvious, skip measuring" | Unmeasured winners are opinions. Run the rubric. |
| "I'll clean the worktrees up later" | Later never comes; orphans linger for weeks. Teardown is part of the skill. |
| "Let me tweak the rubric now that I see results" | Post-hoc criteria pick your favorite, not the best. The rubric is frozen at step 1. |
