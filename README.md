# jorgeiglopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

## Plugins

| Plugin | Skills | What it does |
|---|---|---|
| [writing](./plugins/writing) | `brevify`, `humanify`, `caveman`, `grill-me` | Clearer, more human writing: tighten prose, strip AI-tells, caveman mode, interview drills |
| [git-workflow](./plugins/git-workflow) | `commit`, `pr-create`, `pre-flight` | Stage & commit, open PRs, mirror CI locally before shipping |
| [dev-workflow](./plugins/dev-workflow) | `ramp-up`, `debate-team`, `recall-agent` | Working in unfamiliar repos: onboard fast, run a 3-agent adversarial debate, recover a subagent's transcript |
| [mgt-workflow](./plugins/mgt-workflow) | `project-cost` | Management & observability: estimate a project's Claude Code token cost from transcripts; plus a hook that logs every skill invocation |

## Install (from GitHub)

From inside Claude Code:

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install writing@jorgeiglopez-toolkit
/plugin install git-workflow@jorgeiglopez-toolkit
/plugin install dev-workflow@jorgeiglopez-toolkit
/plugin install mgt-workflow@jorgeiglopez-toolkit
```

To pull updates after new commits:

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

Claude Code caches each installed plugin under `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` and keys the cache on `version` — so `marketplace update` only serves new code once the version is bumped (see [Versioning](#versioning)).

## Versioning

All plugins ship in lockstep at the value in `VERSION`. `scripts/set-version.sh` propagates that value into every `plugins/*/.claude-plugin/plugin.json` and every `.plugins[].version` in `.claude-plugin/marketplace.json`.

```bash
scripts/set-version.sh 0.2.12   # bump VERSION, then sync every manifest
scripts/set-version.sh          # no args: re-sync manifests to whatever VERSION says
```

Bump rule — default to **patch**; **minor** for a new skill/plugin or a meaningful rewrite; **major** for breaking changes.

## Add a new plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` (copy an existing plugin as a template).
2. Add skills under `plugins/<name>/skills/<skill>/SKILL.md` with frontmatter `name` + `description`.
3. Append the plugin entry to `.claude-plugin/marketplace.json`.
4. Run `scripts/set-version.sh` to sync the new manifest, then reload.

## Local development

Day-to-day, changes are dogfooded by symlinking each plugin's skills (and merging its hooks) straight into `~/.claude` via a local, gitignored `dogfooding/` harness — so edits take effect in the next session with no marketplace round-trip. Automated releases are paused while the plugins stabilize.

## Layout

```
toolkit/
├── VERSION                     # single source of truth for the marketplace version
├── scripts/
│   └── set-version.sh          # propagate VERSION → every manifest
├── .claude-plugin/
│   └── marketplace.json        # lists every plugin in this repo
├── README.md
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json     # this plugin's manifest
        └── skills/
            └── <skill-name>/
                └── SKILL.md    # the skill body, with YAML frontmatter
```
