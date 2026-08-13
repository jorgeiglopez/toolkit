---
name: agent-parallel-exec
description: Run N candidate approaches head-to-head in isolated worktrees, score them, merge the winner, delete the losers. Use when the user wants to compare implementations or approaches, says compare approaches, try both ways, spawn a few and pick a winner, or asks which of several techniques works best in practice.
---

# agent-parallel-exec

Competitive evaluation with mechanical cleanup. One invocation covers
dispatch, scoring, comparison, merge, and teardown.

## 0. Make the contest crystal clear FIRST

Do not spawn anything, do not burn tokens, until you and the user agree on
exactly what is being compared. Vague candidates waste every agent you launch.

Ask questions, get answers, propose the approaches back, and refine until each
candidate is a distinct, well-defined approach the user has confirmed. If the
approaches aren't clearly different from one another, say so and pin down the
difference before moving on.

## 1. Frame the contest

Once the candidates are confirmed, write down:

- **Candidates**: the distinct approaches (2 to 5). Name each.
- **Rubric**: measurable criteria and weights, fixed now. Good dimensions:
  tests passed, recall/precision on a shared fixture set, latency, lines
  changed, subjective simplicity (1-5). Ask the user only if the rubric is
  genuinely ambiguous.
- **Source branch**: note the current branch; it is the merge target and
  single coordination point. Candidates never commit to it.

## 2. Dispatch

Spawn one agent per candidate, in parallel, each with worktree isolation.
Dispatch mechanics (budgets, file handoffs, completion contract) follow the
`agent-dispatch` skill; worktree mechanics follow `git-worktree`. Bake-off
specifics on top:

- Identical task prompt; only the "your approach" section differs.
- Unique resources per candidate: pass a distinct port / DB name / temp dir
  in the prompt so parallel dev servers never collide.
- Completion contract addition: "run the rubric measurements yourself, commit
  on your worktree branch, and report scores per dimension + evidence
  (test output, timings) + branch name as your final message."

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

Run `git-worktree`'s cleanup sweep over EVERY candidate, winner
included: merged branches and their worktree dirs die together; before
deleting a loser, check `git log <source>..<branch> --oneline` for
salvageable commits and flag anything interesting to the user first.

Exit check, mechanical: `git worktree list` shows only the main checkout;
`git branch --list '*<candidate-prefix>*'` is empty. Report the final table,
the merge commit, and this proof.

## Red flags

| Excuse | Reality |
|---|---|
| "I'll spawn now and figure out the differences later" | Undefined candidates waste every agent. Nail the differences in step 0 first. |
| "The winner is obvious, skip measuring" | Unmeasured winners are opinions. Run the rubric. |
| "I'll clean the worktrees up later" | Later never comes; orphans linger for weeks. Teardown is part of the skill. |
| "Let me tweak the rubric now that I see results" | Post-hoc criteria pick your favorite, not the best. The rubric is frozen at step 1. |
