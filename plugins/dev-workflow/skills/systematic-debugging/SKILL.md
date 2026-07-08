---
name: systematic-debugging
description: "Use before proposing a fix for any bug, test failure, or unexpected behavior. Use especially when a first fix didn't work, when about to guess at a cause, or when under time pressure to patch something fast."
---

# Systematic Debugging

## Announce first

Before any other tool call, send one line:

> Using the `systematic-debugging` skill to investigate <one-line summary>.

## Iron law

NO FIX WITHOUT ROOT CAUSE INVESTIGATION FIRST.

Symptom fixes are failure, not progress. Complete each phase below before moving to the next.

## When to use

Any bug, test failure, unexpected behavior, or performance problem. Use especially when:
- under time pressure (guessing gets tempting)
- a fix seems obvious
- you already tried a fix and it didn't work
- you don't fully understand the issue yet

Don't skip it because the issue "seems simple." Simple bugs have root causes too, and the process is fast for them.

## Phase 1: Reproduce

Before touching any fix:
1. Read the full error message and stack trace. Note exact line numbers, file paths, error codes, they usually contain the answer.
2. Reproduce consistently: exact steps, every time. If it won't reproduce, gather more data, don't guess.
3. Check recent changes: git diff, recent commits, new dependencies, config or environment changes.
4. In multi-component systems (CI to build to signing, API to service to database), add diagnostic logging at each boundary before guessing which layer is broken. Log what enters and exits each component, run once, see where it actually breaks.
5. If the bad value is deep in a call stack, trace backward: where does it originate, what called this with the bad value, keep tracing up until you hit the source. Fix at the source, not where it surfaces.

## Phase 2: Isolate

Find the pattern before touching code:
1. Locate similar working code in the same codebase.
2. If replicating a pattern, read the reference implementation completely, not skimmed.
3. List every difference between the working and broken cases, however small. Don't dismiss any as "can't matter."
4. Understand what the broken code depends on: config, environment, other components, assumptions.

## Phase 3: Root cause

Scientific method, not trial and error:
1. State a single hypothesis: "I think X is the root cause because Y." Write it down.
2. Test the smallest possible change that would confirm or deny it. One variable at a time.
3. Confirmed -> go to Phase 4. Not confirmed -> form a new hypothesis, don't stack another fix on top.
4. If you don't understand something, say so. Don't pretend and don't guess past it.

## Phase 4: Fix

1. Write a failing test that reproduces the bug first (or the smallest reproduction script if there's no test framework).
2. Implement one change addressing the root cause. No "while I'm here" cleanup, no bundled refactor.
3. Verify: does the new test pass, do the existing tests still pass, is the original issue actually gone.
4. Fix didn't work -> stop and count attempts:
   - Under 3 failed fixes: return to Phase 1 with what you just learned.
   - **3+ failed fixes: stop fixing and question the architecture** (below). Do not attempt a 4th fix blind.

## 3+ failures: question the architecture

Signs the problem is architectural, not another missing fix:
- each fix reveals new coupling or shared state somewhere else
- each fix would need "massive refactoring" to land
- each fix creates a new symptom elsewhere

This isn't a failed hypothesis, it's the wrong design. Stop and raise it with the user before attempting fix #4: is this pattern sound, or is it continuing out of inertia?

## When investigation finds no root cause

If exhaustive investigation shows the issue really is environmental, timing-dependent, or external:
1. Confirm all 4 phases actually completed, don't shortcut here.
2. Document what you ruled out.
3. Implement the appropriate handling (retry, timeout, clear error message).
4. Add logging so the next occurrence is easier to diagnose.

Most "no root cause" conclusions are actually incomplete investigation. Default to suspicion of this conclusion.

## Rationalizations - reality

| Excuse | Reality |
|---|---|
| "Issue is simple, skip the process" | Simple bugs have root causes too. The process is fast for them. |
| "Emergency, no time for process" | Systematic debugging is faster than guess-and-check thrashing. |
| "Just try this first, investigate after" | The first fix sets the pattern. Do it right from the start. |
| "I'll write the test after confirming the fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | You can't isolate what worked. Causes new bugs. |
| "Reference is long, I'll adapt the pattern from memory" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing a symptom isn't understanding the root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures means an architecture problem. Question the pattern, don't fix again. |

## Red flags - stop

If you catch yourself thinking any of these, stop and return to Phase 1:
- "Quick fix now, investigate later"
- "Just try changing X and see"
- "Skip the test, I'll manually verify"
- "It's probably X" (without having traced to X)
- "I don't fully understand but this might work"
- Proposing a fix before tracing data flow
- Already tried 2+ fixes and reaching for a 3rd

## Rules

- No fix without completing root cause investigation (Phase 1) first. Symptom fixes are failure, not progress.
- Don't reason your way out of root cause analysis. "Simple" or "urgent" is never a reason to skip it; it's faster than thrashing.
- Phases run in order: reproduce, isolate, root cause, fix. Don't skip ahead.
- One change at a time when testing a hypothesis or applying a fix.
- Write a failing test before the fix. TDD approach.
- 3+ failed fixes -> stop and question the architecture with the user, don't attempt a 4th.
