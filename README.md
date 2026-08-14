# jorgeiglopez-toolkit

Personal [Claude Code](https://www.anthropic.com/claude-code) plugin marketplace — domain-focused plugins for day-to-day engineering work. macOS, single-user.

Built and maintained by **[Jorge I. Lopez](https://jorgeiglopez.com)**.

## Plugins

- **writing** — tighten prose, strip AI-tells, trim docs, interview drills.
- **git-workflow** — staged reviewable commits, PRs, local CI mirror, worktree lifecycle.
- **dev-workflow** — repo ramp-up, systematic debugging, head-to-head parallel-exec, subagent dispatch, spoken summaries.
- **mgt-workflow** — project cost, weekly digests, CLAUDE.md hygiene, on-call agents, pattern-library code review.

## Install

From inside Claude Code:

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install <plugin>@jorgeiglopez-toolkit
```

Update after new commits:

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

Plugins are cached by `version`, so `marketplace update` serves new code only after a bump.

## Conventions

The `RULES.md` contract, versioning, and ship flow live in **[CLAUDE.md](./CLAUDE.md)**.
