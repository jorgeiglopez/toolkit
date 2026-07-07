---
name: agents-ctl
lastUpdate: 2026-07-04 00:00
---

# Rules

- Stopping means TaskStop, never a SendMessage asking the agent to stop; messages do not terminate processes.
- Every stop is verified afterward and reported in a per-agent status table; "probably stopped" is not a status.
- Listing shows: name/ID, type, age, last activity, current state.
- Partial work from a stopped agent is recoverable from its transcript (see recall-agent); offer it, do not let it vanish silently.
- End-of-orchestration reap is proactive: merged + unassigned = stopped, without the user asking.
