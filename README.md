# jorgeiglopez-toolkit

Personal Claude Code plugin marketplace. macOS only, Claude Code only, single-user.

## Plugins

| Plugin | Description |
|---|---|
| [using-toolkit](./plugins/using-toolkit) | Bootstrap: injects the toolkit's skill TOC at session start so domain skills get invoked reliably |
| [communication](./plugins/communication) | Skills for clearer, more human writing and communication |
| [build](./plugins/build) | Commit, PR, and pre-flight skills, with skill-usage logging hook |

## Install (from GitHub)

From inside Claude Code:

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install communication@jorgeiglopez-toolkit
/plugin install build@jorgeiglopez-toolkit
```

To pull updates after pushing new commits, **first bump the plugin's `version`** in both `plugins/<name>/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, then:

```
/plugin marketplace update jorgeiglopez-toolkit
/plugin install <name>@jorgeiglopez-toolkit
```

Why both steps: Claude Code keys each plugin's install cache on `version`. Without a version bump, `marketplace update` refreshes the marketplace clone but the installed plugin keeps serving stale, cached files. See [Updating a plugin](#updating-a-plugin) below.

## Install (local dev)

If working on the marketplace locally:

```
/plugin marketplace add /Users/jorgeilopez/repo/claude-sample-plugins/toolkit
/plugin install build@jorgeiglopez-toolkit
```

Verify by asking Claude to commit something — the `commit` skill should engage.

## Add a new plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` (copy `communication` as a template).
2. Add skills under `plugins/<name>/skills/<skill>/SKILL.md` with frontmatter `name` + `description`.
3. Append the plugin entry to `.claude-plugin/marketplace.json`.
4. Reload: `/plugin marketplace update jorgeiglopez-toolkit` then `/plugin install <name>@jorgeiglopez-toolkit`.

## Updating a plugin

Every push that changes a plugin's behavior **must** bump that plugin's version. Claude Code caches each installed plugin under `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Without a version bump, the cache key doesn't change and the installed plugin keeps serving the old code — even after `marketplace update`.

1. Bump `version` in `plugins/<name>/.claude-plugin/plugin.json`.
2. Bump the matching `version` in `.claude-plugin/marketplace.json`.
3. Commit and push.
4. In Claude Code:
   ```
   /plugin marketplace update jorgeiglopez-toolkit
   /plugin install <name>@jorgeiglopez-toolkit
   ```

Use semver: patch for fixes, minor for additions, major for breaking changes. Trivial doc-only edits to a plugin's README can skip the bump.

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
