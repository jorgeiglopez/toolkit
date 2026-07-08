---
name: dispatch
description: Discipline for delegating work to subagents and teammates. Run when the user explicitly calls it to orchestrate multi-agent work or dispatch subagents.
disable-model-invocation: true
---

# dispatch

Every dispatch has four parts: constraints by reference, inputs by file,
a budget, and a completion contract. Long orchestrations add a ledger.

## 1. Constraints by reference, never retyped

Standing rules (environment limits, tool bans, test frameworks, timeouts)
live in `<project>/.claude/dispatch-skill/dispatch-constraints.md`. The
dispatch prompt says:

> Read and obey `<project>/.claude/dispatch-skill/dispatch-constraints.md` before starting.

- File missing? Copy `dispatch-constraints.template.md` (shipped in this
  skill's folder) to that path and fill it in, then reference it.
- Typing the same constraint a second time in one project is the signal:
  it belongs in the file.

## 2. Inputs by file, never by paste

Write plans, diffs, findings, and prior context to a file; pass the path.
A dispatch prompt over ~50 lines of pasted context is a bug: the agent
re-reads stale prose instead of live files, and the tokens are wasted.

## 3. Budget

One line, explicit: "Budget: at most N files touched, M tool calls (or T
minutes). Stop and report if you hit it." Runaway agents are cheaper to
re-dispatch than to let wander.

## 4. Completion contract

End every dispatch prompt with all that apply:

- "Your final message IS the deliverable report; do not idle waiting for
  follow-up." (Prevents silent idle agents that need nudging.)
- "Leave the project gate green (`<gate command>`); a red gate means you
  are not done."
- UI-facing work: "Verify by driving the running app (or the built-in
  verify skill), not just by reading code. Review passing is not clicking."
- Structured return: name the exact sections or schema you want back.

## 5. Ledger for long orchestrations

Multi-day or multi-wave work keeps a ledger under
`<project>/.claude/dispatch-skill/ledger/` (one file per orchestration,
e.g. `ledger/<orchestration-name>.md`):

```
Task 3: complete (commits a1b2c3..d4e5f6), gate green
Task 4: in progress, agent web-fixer, worktree wt/task-4
```

Update it as waves land; re-read it after any compaction instead of
trusting conversation memory. The ledger, not the transcript, is the state.

## 6. Reap

When an agent's work is merged and it has nothing assigned, stop it:
`TaskStop` the agent, verify the process is actually gone, and recover any
partial work from its branch before dropping it. Finished waves end with
zero idle teammates.
