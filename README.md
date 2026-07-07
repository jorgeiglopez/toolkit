# jorgeiglopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

## Plugins

| Plugin | Ships | What it does |
|---|---|---|
| [writing](./plugins/writing) | skills: `brevify`, `humanify`, `grill-me`, `doc-trim` | Clearer, more human writing: tighten prose, strip AI-tells, trim existing docs, interview drills |
| [git-workflow](./plugins/git-workflow) | skills: `commit`, `pr-create`, `pre-flight`, `worktree-workflow`, `finish-branch`, `receiving-review` · hooks: `blocked-commands`, `stop-gate` | Git actions plus guardrails: staged reviewable commits, PRs, local CI mirror, full worktree lifecycle, branch finishing, review response; hooks block bad commands and gate session end on quality |
| [dev-workflow](./plugins/dev-workflow) | skills: `ramp-up`, `systematic-debugging`, `bake-off`, `doc-audit`, `dispatch`, `rename-verify`, `codebase-diagnostic`, `debate-team`, `recall-agent`, `tts-enable`, `tts-disable` · hooks: TTS trio, usage warning | Working effectively in repos: onboard fast, debug by root cause, compare approaches head-to-head, audit docs, delegate to subagents with discipline |
| [mgt-workflow](./plugins/mgt-workflow) | skills: `project-cost`, `backlog`, `agents-ctl`, `weekly-review`, `claude-deslop`, `update-claude` · agents: `toolkit-manager`, `staff-engineer-reviewer` · hook: skill-use logging | Management & observability: token spend, ticket capture and pickup, agent lifecycle with proof, weekly digests, CLAUDE.md hygiene, pattern-library code review |
| [nextjs](./plugins/nextjs) | skills: `react-dev`, `react-useeffect` | React 19 / Next.js engineering patterns and Effect discipline |
| [web-quality](./plugins/web-quality) | skills: `web-quality-audit`, `performance`, `core-web-vitals`, `accessibility`, `seo` | Lighthouse-style audits, framework-agnostic with Next.js emphasis |

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

- Every skill ships `SKILL.md` + `RULES.md`; `RULES.md` is the source of truth for intent. See [CLAUDE.md](./CLAUDE.md) for the contract, the authoring doctrine, and the ship flow.
- `scripts/validate.sh` enforces the structural invariants (run it before shipping).

## Versioning

All plugins ship in lockstep at the value in `VERSION`. `scripts/set-version.sh` propagates it into every manifest:

```bash
scripts/set-version.sh 0.3.0   # bump VERSION, then sync every manifest
scripts/set-version.sh         # no args: re-sync manifests to VERSION
```

Bump rule: default **patch**; **minor** for a new skill/plugin or meaningful rewrite; **major** for breaking changes.

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
