# jorgeilopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

## Plugins

| Plugin | Description |
|---|---|
| [hello-world](./plugins/hello-world) | Starter plugin — proves the marketplace + skill loading works |

## Install (local dev)

From inside Claude Code:

```
/plugin marketplace add /Users/jorgeilopez/repo/claude-sample-plugins/toolkit
/plugin install hello-world@jorgeilopez-toolkit
```

Then verify:

```
/hello-world
```

## Add a new plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` (copy `hello-world` as a template).
2. Add skills under `plugins/<name>/skills/<skill>/SKILL.md` with frontmatter `name` + `description`.
3. Append the plugin to `.claude-plugin/marketplace.json`.
4. Reload: `/plugin marketplace update jorgeilopez-toolkit` then `/plugin install <name>@jorgeilopez-toolkit`.

## Layout

```
toolkit/
├── .claude-plugin/
│   └── marketplace.json        # lists every plugin in this repo
├── README.md
└── plugins/
    └── hello-world/
        ├── .claude-plugin/
        │   └── plugin.json     # this plugin's manifest
        ├── README.md
        └── skills/
            └── hello-world/
                └── SKILL.md    # the skill body, with YAML frontmatter
```
