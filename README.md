# jorgeiglopez-toolkit

Personal [Claude Code](https://www.anthropic.com/claude-code) plugin marketplace — domain-focused plugins for day-to-day engineering work. macOS, single-user.

Built and maintained by **[Jorge I. Lopez](https://jorgeiglopez.com)**.

## Plugins

- **communication** — tighten prose, strip AI-tells, trim docs, interview drills, plus spoken summaries read aloud.
- **git-workflow** — staged reviewable commits, PRs, local CI mirror, worktree lifecycle.
- **dev-workflow** — repo ramp-up, systematic debugging, head-to-head parallel-exec, subagent dispatch.
- **mgt-workflow** — project cost, weekly digests, CLAUDE.md hygiene, on-call agents, pattern-library code review.

## Installation (30-second setup)

**Requires:** [Claude Code](https://www.anthropic.com/claude-code) on macOS.

**1. Add the marketplace**

```
/plugin marketplace add jorgeiglopez/toolkit
```

**2. Install the plugins you want**

```
/plugin install dev-workflow@jorgeiglopez-toolkit
```

Repeat for any of: `communication`, `git-workflow`, `dev-workflow`, `mgt-workflow`.

**3. Done** — skills, hooks, and agents load in your next session.

Updates ship automatically; pull the latest anytime with:

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

## Conventions

The `RULES.md` contract, versioning, and ship flow live in **[CLAUDE.md](./CLAUDE.md)**.
