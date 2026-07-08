---
name: lpz-agent-schedule-oneoff
lastUpdate: 2026-07-06 00:00
---

# Rules
- Always `recurring: false`. This skill is exclusively for one-shot runs, never recurring schedules.
- Default model is `claude-opus-4-8` (Opus 4.8) unless the user explicitly names a different model.
- Uses `CronCreate` (in-session, in-memory), never `RemoteTrigger`/cloud routines. Cloud routines clone fresh from GitHub and can't see local uncommitted files or git state.
- Re-check current time with `date` before computing the fire time. Never trust a stale reference or guess.
- The `CronCreate` prompt must be fully self-contained and must explicitly instruct spawning an `Agent` tool call with the chosen model. The cron only wakes the session; the `Agent` call is the actual delegated one-off task.
- Always disclose the caveats to the user: ⚠️ WARNING: session-only (not persisted to disk), dies if the session closes before fire time. Also, make sure the agent has enough permissions to complete the task.
