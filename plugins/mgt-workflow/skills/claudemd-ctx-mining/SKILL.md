---
name: claudemd-ctx-mining
description: "Mine recent git commits for undocumented coding patterns and propose CLAUDE.md or skill additions. Manually invoked only, run when the user explicitly calls it to extract patterns from commits or 'learn from my code'."
---

# claudemd-ctx-mining

Analyze recent commits to surface coding patterns worth codifying, so future sessions follow the same conventions without being told.

## Steps

1. **Read current CLAUDE.md** (project and any nested ones) to know what's already documented.
2. **Examine recent commits.** `git log --oneline -10` for subjects, then `git show <sha>` on each to read the diffs. Filter to the user's own commits (match `git config user.email`), skip bot/CI commits.
3. **Identify patterns**: recurring, intentional choices, not one-offs.
   - Naming conventions
   - Structural choices (early returns, guard clauses, module boundaries)
   - Testing patterns (fixture/mock style, assertion style)
   - Architecture decisions (where logic lives, layering)
   - Formatting or style choices a linter doesn't already enforce
4. **Filter against what's already documented.** Only surface patterns missing from CLAUDE.md. Skip anything that's just the language or framework's default convention, unless the user consistently deviates from it.
5. **Present findings** with a code example from the commits for each candidate. Ask which ones to add.
6. **Apply approved patterns**: add to CLAUDE.md under the right section, or into a relevant existing skill if the pattern is skill-specific rather than global.

## What makes a pattern worth capturing

- Appears in 2+ commits, not a one-off.
- Reflects a deliberate choice, not default tool or language behavior.
- Future sessions would benefit from knowing it.
- Specific enough to be actionable.
