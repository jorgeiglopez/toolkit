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

## Versioning & shipping

All plugins version in lockstep. `VERSION` at the repo root is the single
source of truth; `scripts/set-version.sh` propagates it into every
`plugin.json` and `marketplace.json` entry.

Ship flow, in order:

1. `scripts/validate.sh` must pass (structural invariants; `--strict` also
   fails on warnings).
2. Bump once per shipped batch, not per commit: `scripts/set-version.sh X.Y.Z`.
3. Commit the bump, push `main`. Installed marketplaces pull it via
   `autoUpdate`.

## Skill authoring doctrine

- **Description = trigger, never a workflow summary.** The description decides
  when the skill fires; summarizing the procedure invites the model to follow
  the summary and skip the body.
- **Knowledge delta.** A skill earns its context cost with expert-only content:
  what Claude does not already do reliably. Cut anything a good model does by
  default.
- **Scope check before creating.** Confirm placement first: project-local
  (`.claude/skills/` in the target repo) vs toolkit. When the user says
  "local", it never goes here.
- **Size.** Target under ~150 lines per SKILL.md; push the long tail into a
  `references/` (or similar) subfolder loaded on demand.
- **Gated skills carry enforcement.** Skills that must not be talked past
  (commit, pre-flight) include a rationalization table (Excuse vs Reality) and
  a red-flag phrase list.