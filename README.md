# jorgeiglopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

## Plugins

| Plugin | Description |
|---|---|
| [hello-world](./plugins/hello-world) | Starter plugin — proves the marketplace + skill loading works |
| [communication](./plugins/communication) | Skills for clearer, more human writing and communication |

## Install (from GitHub)

From inside Claude Code:

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install hello-world@jorgeiglopez-toolkit
/plugin install communication@jorgeiglopez-toolkit
```

To pull updates after pushing new commits:

```
/plugin marketplace update jorgeiglopez-toolkit
```

## Install (local dev)

If working on the marketplace locally:

```
/plugin marketplace add /Users/jorgeilopez/repo/claude-sample-plugins/toolkit
/plugin install hello-world@jorgeiglopez-toolkit
```

Verify with `/hello-world`.

## Add a new plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` (copy `hello-world` as a template).
2. Add skills under `plugins/<name>/skills/<skill>/SKILL.md` with frontmatter `name` + `description`.
3. Append the plugin entry to `.claude-plugin/marketplace.json`.
4. Reload: `/plugin marketplace update jorgeiglopez-toolkit` then `/plugin install <name>@jorgeiglopez-toolkit`.

## Layout

```
toolkit/
├── .claude-plugin/
│   └── marketplace.json        # lists every plugin in this repo
├── README.md
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json     # this plugin's manifest
        ├── README.md
        └── skills/
            └── <skill-name>/
                └── SKILL.md    # the skill body, with YAML frontmatter
```
