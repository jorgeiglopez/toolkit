---
name: schedule-one-off-agent
description: "Schedule a one-off (never recurring) delegated subagent task to fire at a future time inside the current local session, via CronCreate. Defaults to Opus 4.8 if no model is specified. Use when the user says 'schedule an agent to do X at/in <time>', wants a task delegated to run once later, or needs a future local action with access to the local filesystem/git state (unlike the built-in cloud /schedule skill, which clones fresh from GitHub and can't see uncommitted local changes)."
---

# Schedule one-off agent

Delegate a task to a subagent that fires once, at a specific future wall-clock time, inside this session.

## Announce first

Before any other tool call:

> Using `schedule-one-off-agent` to schedule <task> for <time>.

## Step 1: resolve the time

Re-check current time with `date` (never trust a stale reference, especially in a long conversation). Convert any relative phrase ("in 20 min", "at 3pm", "tomorrow morning") into an absolute local time and confirm it with the user before scheduling.

## Step 2: pick the model

Default: `claude-opus-4-8` (Opus 4.8). Use a different model only if the user names one explicitly.

## Step 3: build the cron call

Always set `recurring: false`. This skill exists only for one-shot runs, never recurring schedules. Compute the 5-field cron expression `M H DoM Mon DoW` for the resolved local fire time.

## Step 4: write a self-contained prompt

`CronCreate`'s prompt fires inside this same session with no memory of this conversation's reasoning, so it must be fully self-contained: the exact task, exact scope (files, repo, paths), explicit constraints on what NOT to touch, and an explicit instruction to spawn an `Agent` tool call with the chosen model to actually do the work. The cron firing only wakes the session. The `Agent` call is the actual delegated one-off agent.

## Step 5: call CronCreate

```
CronCreate({cron: "<M H DoM Mon DoW>", recurring: false, prompt: "Spawn an Agent with model: <model>. <full self-contained task>"})
```

## Step 6: disclose the caveats

Always state, don't bury:
- Session-only: lives in this session's memory, not written to disk, dies if the session or terminal closes before fire time.
- Fires only while the session is idle (not mid-query).
- Not a real OS cronjob.

## Not this skill

For recurring schedules, or anything that must run even if this local session isn't open (needs GitHub access, needs to survive a closed terminal), use the built-in `/schedule` skill (cloud routines) instead. Note that cloud routines clone fresh from GitHub and cannot see local uncommitted changes.
