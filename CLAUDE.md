# toolkit/ — `jorgeiglopez-toolkit`

Personal Claude Code plugin marketplace. Several domain plugins, shipped in lockstep at one version.

## Layout

```
VERSION                          # single source of truth for the version
scripts/{set-version,validate}.sh
.claude-plugin/marketplace.json  # the catalog
plugins/<plugin>/
  .claude-plugin/plugin.json
  skills/<skill>/{SKILL.md,RULES.md}   hooks/*.sh   agents/*.md
```

## RULES.md contract

Every skill ships `SKILL.md` (full) + `RULES.md` (terse `# Rules` bullets; frontmatter just `name` + `lastUpdate`; the constraints that matter — no procedure, no examples). **`RULES.md` is intent and always wins.** Change behavior by editing `RULES.md` first, then align `SKILL.md`. Any turn that touches a `SKILL.md` checks it against `RULES.md` for drift and fixes it. A skill with only one of the two files is incomplete.

## Versioning — one version, default to patch

All plugins ship at `VERSION`. The version string is Claude Code's **cache key** — pushing without a bump serves stale code, so always bump. `scripts/set-version.sh X.Y.Z` writes `VERSION` and syncs every `plugin.json` + `marketplace.json`; no args re-syncs.

| Bump | When |
|---|---|
| **Patch** | ~95% of changes: new skills, rewrites, tweaks |
| **Minor** | a stable milestone worth announcing |
| **Major** | breaking changes downstream users must adapt to |

## Ship flow

"change X in skill Z" implies the whole pipeline — don't pause between steps:

1. Edit the file(s).
2. `scripts/validate.sh` passes (`--strict` also fails on warnings).
3. `scripts/set-version.sh X.Y.Z` — patch by default.
4. Commit (via the `commit` skill) + push `main`.
5. Print the refresh commands — you can't run `/plugin` for the user:

```
/plugin marketplace update jorgeiglopez-toolkit
/reload-plugins
```

Doc-only edits (this file, a plugin README) skip the bump — just commit and push.

## Skill authoring doctrine

- **Description = trigger, not a summary.** It decides when the skill fires; summarizing the procedure invites skipping the body.
- **Knowledge delta.** Earn the context cost with expert-only content; cut what a good model already does by default.
- **Scope check.** Toolkit vs project-local (`.claude/skills/`); when the user says "local", it never goes here.
- **Size.** ~150 lines/`SKILL.md`; push the long tail into `references/`.
- **Gated skills carry enforcement** — rationalization table (Excuse vs Reality) + red-flag phrases.
