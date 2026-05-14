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

To pull updates after pushing new commits, **first bump the toolkit version** (`bin/set-version.sh <new-version>` — see [Updating a plugin](#updating-a-plugin) below), then from inside Claude Code:

```
/sync
```

`/sync` (from the using-toolkit plugin) refreshes the marketplace and reinstalls every plugin in one shot. Equivalent manual sequence:

```
/plugin marketplace update jorgeiglopez-toolkit
/plugin install <name>@jorgeiglopez-toolkit
```

Why bumping matters: Claude Code keys each plugin's install cache on `version`. Without a bump, `marketplace update` refreshes the marketplace clone but the installed plugin keeps serving stale, cached files.

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

The toolkit ships all plugins in lockstep — one unified version, stored at `toolkit/VERSION`. Every push that changes any plugin's behavior bumps that file, and `bin/set-version.sh` propagates the value into every `plugins/*/.claude-plugin/plugin.json` and every `.plugins[].version` in `marketplace.json`.

Claude Code caches each installed plugin under `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Without a version bump the cache key doesn't change and the installed plugin keeps serving old code — even after `marketplace update`. The unified version means one bump per release.

**Bumping rule — default to patch.**

- **Patch** (0.2.1 → 0.2.2) — default. Every behavioral change.
- **Minor** (0.2.x → 0.3.0) — substantive additions: a new skill, a new plugin, a meaningful rewrite.
- **Major** (0.x.y → 1.0.0) — breaking changes. Rare.

Trivial doc-only edits to a plugin's README can skip the bump.

**Workflow:**

```bash
bin/set-version.sh 0.2.2     # bump VERSION and sync every manifest
git add VERSION plugins .claude-plugin/marketplace.json
git commit -m "..."
git push
```

Then in Claude Code:

```
/sync
```

`/sync` runs `bin/sync.sh` from the using-toolkit plugin, which refreshes the marketplace clone and reinstalls every plugin at the new version. Restart Claude Code after.

**Re-syncing without a version change** (e.g., if a `plugin.json` drifted out of sync): run `bin/set-version.sh` with no args. It reads VERSION and rewrites every manifest to match.

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
