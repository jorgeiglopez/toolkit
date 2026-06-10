# toolkit — `jorgeiglopez-toolkit`

Personal Claude Code plugin marketplace. One marketplace, several domain-focused plugins, all shipped in lockstep at one version.

## Repo map

```
toolkit/
├── VERSION                              # single source of truth for the marketplace version
├── scripts/set-version.sh               # propagates VERSION → every plugin.json + marketplace.json
├── .claude-plugin/marketplace.json      # the marketplace catalog
├── claude-home/                         # versioned ~/.claude config (settings.json, statuslines)
├── dogfooding/                          # GITIGNORED, local-only: symlinks skills/hooks/agents into ~/.claude
└── plugins/
    ├── writing/         # skills: brevify, humanify, caveman, grill-me
    ├── git-workflow/    # skills: commit, pr-create, pre-flight
    ├── dev-workflow/    # skills: ramp-up, debate-team, recall-agent
    └── mgt-workflow/    # skills: project-cost · hooks/ (skill-use logger)
                         # agents/ (toolkit-manager) · templates/ (bug-report)
```

Layout inside a plugin: `plugins/<plugin>/skills/<skill>/SKILL.md` (+ optional `RULES.md`),
`hooks/*.sh`, `agents/*.md`, `.claude-plugin/plugin.json`.

## `RULES.md` inside skills — the user's contract

A skill (`plugins/<plugin>/skills/<skill>/`) may contain a `RULES.md` next to `SKILL.md`. **`RULES.md` is authored by me.** It captures the non-negotiable constraints I care about for that skill.

- **`RULES.md` always wins.** If `SKILL.md` and `RULES.md` disagree, fix the skill.
- Read `RULES.md` first before editing or generating skill content. Treat every rule as a hard constraint.
- Auditing a skill = consistency check against its `RULES.md`. Report any drift.
- Do not edit `RULES.md` unless I explicitly ask. Surface concerns instead of rewriting.

## Adding a new plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` (copy `writing/` as template).
2. Add skills under `plugins/<name>/skills/<skill>/SKILL.md` (YAML frontmatter: `name`, `description`).
3. Append an entry to `.claude-plugin/marketplace.json`.
4. Refresh in Claude Code with the two commands in [Refreshing](#refreshing).

## Versioning — one unified version, default to patch

Every plugin ships at the value in `VERSION`. Claude Code caches plugins under `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`; **the version string is the cache key**, so pushing changes without a bump serves stale code.

`scripts/set-version.sh <new-version>` writes `VERSION` and syncs every `plugins/*/.claude-plugin/plugin.json` + every `.plugins[].version` in `marketplace.json`. Running it with no args re-syncs from `VERSION`.

**Bump rule of thumb — default to patch, increase slowly.**

| Bump | When | Examples |
|---|---|---|
| **Patch** (0.2.1 → 0.2.2) | ~95% of changes during iteration | new skills, rewrites, renames, behavior tweaks |
| **Minor** (0.2.x → 0.3.0) | Stable milestone worth announcing | a coherent batch users should notice — not per-feature |
| **Major** (0.x → 1.0.0) | Breaking changes downstream users must adapt to | rare |

Doc-only edits to this `CLAUDE.md` or a plugin README skip the bump.

When auditing any plugin change, **verify VERSION was bumped and every plugin.json + marketplace entry agrees**. If they drift, run `bin/set-version.sh` with no args.

## How we ship — one-instruction dogfooding

When the user gives a single instruction of the form *"change X in skill/plugin Z"*, treat the whole ship-to-prod pipeline as implied. **Do not pause for confirmation between steps.**

1. **Edit** the target file(s).
2. **Bump** with `scripts/set-version.sh <new-version>` — patch by default.
3. **Commit** via the `git-workflow:commit` skill (one focused commit).
4. **Push** to `origin/main`.
5. **Print the refresh commands and the ship-summary template** below. The agent cannot invoke `/plugin` or `/reload-plugins` on the user's behalf — these are the user's keystrokes.

### Refreshing

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

The first refreshes the marketplace catalog. Because `jorgeiglopez-toolkit` has auto-update enabled, the same command also bumps the installed plugins (`✔ Updated 1 marketplace (N plugins bumped)`). The second activates them in the current session.

There is **no** `/plugin update <name>` slash command (verified against the official Claude Code docs, 2026-05). A shell `claude plugin update <name>` binary exists but isn't session-friendly.

### Mandatory ship-summary template

End every ship-to-prod turn with this exact block — no more, no less:

```
🚀 Published vX.Y.Z

TL;DR
- <one-line change #1>
- <one-line change #2 if applicable>

To pick it up, run:
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

Bullets stay to 1–3 lines total. No test plan, no file lists, no co-author trailers. If nothing shipped (doc-only or aborted), skip the template entirely.

**Doc-only edits to this `CLAUDE.md` or a plugin README skip steps 2–5 and the template** — just commit and push.

## Status

`jorgeiglopez-toolkit` ships `using-toolkit`, `writing`, and `git-workflow`, all version-locked at the value in `VERSION`. `git-workflow` bundles `commit`, `pr-create`, and `pre-flight` skills plus a PreToolUse hook that logs every Skill invocation. `writing` bundles `brevify`, `humanify`, `caveman`, and `grill-me`. `using-toolkit` is a bootstrap plugin: a SessionStart hook injects the toolkit's skill TOC into model context so skills get invoked reliably. A `bin/sync.sh` script exists as a backup refresh path but is not the primary one — use the two slash commands above.
