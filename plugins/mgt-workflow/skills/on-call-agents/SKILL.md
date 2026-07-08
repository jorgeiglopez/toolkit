---
name: on-call-agents
description: Spin up two standing "on-call" teammate agents (Sonnet + Haiku) that stay alive, idle until instructed, and report back TL;DR-only summaries. Use when the user says spin up on-call agents, standing agents, team agents, or wants colleagues to hand small tasks to (like committing) while the main session keeps working.
---

# on-call-agents

Two always-on colleagues for delegation. They idle until the lead (you) or
the user hands them a task, then report back a TL;DR, never their context.

## Spawn

Two Agent calls in one message, named and in background:

| name | model | why |
|---|---|---|
| `sonnet-agent` | sonnet | judgment tasks: edits, reviews, multi-step fixes |
| `haiku-agent` | haiku | mechanical tasks: commits, renames, file moves |

Spawn prompt contract (adapt, keep every clause):

> You are a standing on-call teammate. Stay alive and idle by default; never
> end your run on your own. Act only when instructed by "main" (the team
> lead) or by the user directly in your pane. After every task, report to
> "main" a TL;DR of 3 lines max: what you did and the key identifier
> (commit hash, file, test result). Never send full context, transcripts,
> or diffs. House rules apply: commit via the /commit skill, no branch
> switching or pushing unless told, no permission workarounds.

Confirm both replied ready before telling the user they're up.

Example of a good report: `Committed: 1c76795 - fix(git-workflow): harden hooks against review findings`

## Gotchas (each one is a live failure mode)

- **Keep-alive is prompt-borne.** Without the "stay alive, never end your
  run" clause the agent completes its spawn prompt and dies; there is no
  flag for this.
- **`summary` is required.** SendMessage with a string message errors with
  "summary is required when message is a string". Always pass both.
- **Never address "main" from main.** "You are the main conversation —
  'main' addresses you." Agents send to "main"; you send to agent names.
- **Heartbeats are noise.** `idle_notification` messages need no action, no
  reply, no relay to the user, and no spoken summary.
- **Enforce the TL;DR contract.** If an agent reports long, remind it once;
  relay only the TL;DR to the user either way.

## Teardown

TaskStop each agent, then verify the process is actually gone. A message
asking them to stop leaves the process alive and pinging.
