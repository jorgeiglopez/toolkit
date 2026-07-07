---
name: receiving-review
description: "Use when receiving code review feedback (from a human, an automated reviewer, or /code-review output), before implementing any suggestion. Use especially when feedback seems unclear, technically questionable, or you feel the pull to just agree and comply."
---

# Receiving Review

## Announce first

Before any other tool call, send one line:

> Using the `receiving-review` skill to triage this feedback.

## Core principle

Verify before implementing. Ask before assuming. Technical correctness over social comfort. Review feedback is a set of claims to evaluate, not orders to execute.

## Check the decision log first

Before triaging, read `docs/code_review_decisions.md` if it exists. A finding matching a prior settled decision (applied/rejected/deferred) is not re-litigated: apply the existing decision and say so.

## The response pattern

1. **Read** the full feedback before reacting.
2. **Restate** the requirement in your own words, or ask if you can't.
3. **Verify** against the actual codebase. Don't trust the reviewer's framing on faith.
4. **Evaluate** whether it's technically sound for *this* codebase, not in the abstract.
5. **Respond**: a technical acknowledgment or reasoned pushback. Never performative agreement.
6. **Implement** one item at a time, testing each before moving to the next.

## Forbidden responses

Never: "You're absolutely right!", "Great point!", "Excellent feedback!", any gratitude ("Thanks for catching that"), or "Let me implement that now" before verifying.

Instead: restate the requirement, ask a clarifying question, push back with reasoning, or just fix it and let the diff speak.

## Unclear feedback

If any item in a batch is unclear, stop before implementing anything in that batch: items are often related, and partial understanding produces a wrong implementation. Ask about the unclear items specifically; don't implement the clear ones first and circle back.

## Evaluating external feedback

Before implementing a suggestion from an external reviewer, check:
- Is it technically correct for this codebase specifically?
- Does it break existing functionality?
- Is there a reason the current implementation looks this way?
- Does it hold across all platforms/versions this code needs to support?
- Does the reviewer have the full context?

Seems wrong -> push back with technical reasoning. Can't verify -> say so explicitly and ask how to proceed. Conflicts with a prior decision the user made -> stop and raise it with the user before acting.

## YAGNI check

If a reviewer suggests "implementing this properly" (more robust error handling, a fuller feature, etc.), grep the codebase for actual usage first. Unused -> ask whether to remove it instead of building it out. Used -> implement properly.

## Implementation order

Clarify everything unclear first. Then: blocking issues (breaks, security) before simple fixes (typos, imports) before complex fixes (refactors, logic changes). Test each individually; verify no regressions before moving to the next.

## Triage ledger

After triaging a review, append one line per finding to `docs/code_review_decisions.md` (create it if missing):

```
<ID> | applied | <one-line rationale>
<ID> | rejected | <one-line rationale>
<ID> | deferred | <one-line rationale>
```

Keep it short: one line per finding, no prose. This is what the next review reads to avoid re-litigating settled calls.

## Correcting your own pushback

Pushed back and turned out wrong: "You were right, I checked X and it does Y. Fixing." State it factually and move on, no apology, no defending the original pushback.

## Common mistakes

| Mistake | Fix |
|---|---|
| Performative agreement | State the requirement or just act. |
| Blind implementation | Verify against the codebase first. |
| Batch-implementing without testing each | One at a time, test each. |
| Assuming the reviewer is right | Check whether it actually breaks something. |
| Skipping the decision log | Check it before triaging, append after. |

## Rules

- Verify every finding against the codebase before implementing it.
- No performative agreement, ever. Restate, ask, push back, or just fix it.
- Unclear item in a batch -> stop and ask before implementing the rest of the batch.
- Reviewer suggests a fuller build-out of something unused -> grep for usage, raise YAGNI removal if unused.
- Read `docs/code_review_decisions.md` before triaging; append triage results after.
