# jorgeiglopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

Maintained by [Jorge I. Lopez](https://jorgeiglopez.com).

## Plugins

| Plugin | Ships | What it does |
|---|---|---|
| [writing](./plugins/writing) | skills: `brevify`, `humanify`, `grill-me`, `doc-trim` | Clearer, more human writing: tighten prose, strip AI-tells, trim existing docs, interview drills |
| [git-workflow](./plugins/git-workflow) | skills: `commit`, `pr-create`, `pre-flight`, `worktree-workflow` | Git actions plus guardrails: staged reviewable commits, PRs, local CI mirror, full worktree lifecycle |
| [dev-workflow](./plugins/dev-workflow) | skills: `ramp-up`, `systematic-debugging`, `compare-approaches`, `dispatch`, `debate-team`, `recall-agent`, `check-exit-code`, `schedule-one-off-agent`, `tts-enable`, `tts-disable` · hooks: TTS trio, usage warning | Working effectively in repos: onboard fast, debug by root cause, compare approaches head-to-head, delegate to subagents with discipline |
| [mgt-workflow](./plugins/mgt-workflow) | skills: `project-cost`, `on-call-agents`, `weekly-review`, `claude-deslop`, `improve-claude-from-ctx` · agents: `toolkit-manager`, `staff-engineer-reviewer` · hook: skill-use logging | Management & observability: token spend, on-call agents, weekly digests, CLAUDE.md hygiene, pattern-library code review |

## Install (from GitHub)

From inside Claude Code:

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install <plugin>@jorgeiglopez-toolkit
```

To pull updates after new commits:

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

Claude Code caches installed plugins keyed on `version`; `marketplace update` serves new code only after a version bump.

## Conventions

Every skill ships `SKILL.md` + `RULES.md` (RULES is the source of truth for intent), all plugins version in lockstep from `VERSION`, and `scripts/validate.sh` enforces the structural invariants. The full contract, authoring doctrine, versioning, and ship flow live in **[CLAUDE.md](./CLAUDE.md)** — this README stays install- and overview-only to avoid duplicating it.

## Layout

```
toolkit/
├── VERSION                     # single source of truth for the marketplace version
├── scripts/
│   ├── set-version.sh          # propagate VERSION into every manifest
│   └── validate.sh             # structural invariants (RULES contract, versions, naming)
├── .claude-plugin/
│   └── marketplace.json        # lists every plugin in this repo
├── claude-home/                # versioned ~/.claude config (settings, statuslines)
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/plugin.json
        ├── hooks/              # hook scripts + hooks.json (if any)
        ├── agents/             # agent definitions (if any)
        └── skills/<skill-name>/{SKILL.md,RULES.md}
```
