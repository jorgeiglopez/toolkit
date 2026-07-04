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
