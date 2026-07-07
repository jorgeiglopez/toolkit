---
name: agents-ctl
description: List, stop, and verify background agents and teammates. Use when the user asks what agents are running, says kill or stop the agents, doubts an agent actually stopped, or an orchestration wave ends with idle teammates still pinging.
---

# agents-ctl

Agent lifecycle with proof. Idle pings are a bug, not a status report.

## List

Use TaskList (and TaskGet for detail) to enumerate running tasks, agents,
and teammates. Report a table:

| name | type | age | last activity | state |
|---|---|---|---|---|

Cross-check teammates against the team config when present; an agent the
task list has forgotten but whose process pings is exactly the case to
surface.

## Stop

1. `TaskStop(task_id or name)` for each target. SendMessage is NOT a stop:
   a polite request to shut down leaves the process running and pinging.
2. **Verify**: re-list after stopping. Confirm each target is gone or
   terminal.
3. Report the same table with a result column (stopped / already dead /
   still running: escalate).

## Recover

Before or after stopping, partial work is recoverable from the agent's
transcript (`agent-<id>.jsonl` under the session dir, or the teammate's
session file). For anything non-trivial the agent produced, offer recovery;
the recall-agent skill has the extraction procedure.

## Reap proactively

At the end of any orchestration wave you ran: every agent whose work is
merged and who has no new assignment gets stopped and verified, without
being asked. A finished wave with idle teammates still attached is
unfinished cleanup, the same as orphan worktrees.
