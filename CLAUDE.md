# toolkit/ — plugin conventions

## RULES.md contract

Every skill under `plugins/*/skills/<name>/` ships two files:

- `SKILL.md` — the full skill: frontmatter, procedure, examples.
- `RULES.md` — a short TL;DR. Frontmatter is just `name` + `lastUpdate`, then a
  terse `# Rules` bullet list of the constraints and decisions that matter. No
  procedure, no examples — readable in a few seconds, enough to know exactly
  what the skill does and won't do.

`RULES.md` is the source of truth for intent. To change a skill's behavior,
edit `RULES.md` first, then align `SKILL.md` to it — not the other way round.

**Hard rule:** any agent that reads, edits, or creates a skill's `SKILL.md`
MUST check it against that skill's `RULES.md` for drift in the same turn.

- **Drift** = a rule in `RULES.md` that `SKILL.md` no longer implements or
  contradicts, or a behavior in `SKILL.md` with no matching rule.
- Found drift, `RULES.md` is unchanged intent → fix `SKILL.md` to match it.
- Found drift, the user is explicitly changing behavior → update `RULES.md`
  too, in the same turn. The two files never fall out of sync.
- A skill with only one of the two files is incomplete — create the missing
  one from the existing content before moving on.

## Other conventions

Not yet written up (versioning, ship workflow, plugin layout). Add sections
here as they get settled, rather than leaving them tribal.


## Adding skills
When a new skill is added, don't forget to add it to dogfooding/mapping/skills.map, and run /dogfooding/mapping/sync.sh

## Adding hooks
When a new hook is added, three steps, all required:
1. Register the hook in `claude-home/settings.json` (the `hooks` block). `sync.sh`
   never reads or writes `settings.json`, this step is manual.
2. Add it to `dogfooding/mapping/hooks.map` (one line per event it's registered for).
3. Run `dogfooding/mapping/sync.sh`.

Skipping step 2 doesn't fail loudly: the hook works fine until the next unrelated
`sync.sh` run (e.g. adding a skill), which deletes any `~/.claude/hooks` symlink
not listed in `hooks.map` and silently breaks the hook everywhere.

If a hook needs shared helper logic, inline it in the hook script itself.
`sync.sh` only tracks single script files, not helper directories, so a
separate `lib/` file will get swept away the same way.