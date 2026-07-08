---
name: lpz-claudemd-deslop
description: "Audit CLAUDE.md files, skills, and context for redundancy, conflicts, and vagueness; propose a cleaned version. Manually invoked only, run when the user explicitly calls it to deslop or review AI context quality."
---

# lpz-claudemd-deslop

Read every CLAUDE.md, every skill's SKILL.md, and every other instruction file in the project and user config before responding.

## For each rule found, check

1. Is this something Claude already does by default, unprompted?
2. Does it contradict a rule somewhere else in the setup?
3. Does it repeat something a different rule or file already covers?
4. Does it read like a patch for one bad output rather than a general improvement?
5. Is it vague enough to interpret differently each time (e.g. "be more natural", "use a good tone")?

## Output

- A cut list: each rule to remove, with a one-line reason tied to the checks above.
- A conflict list: any rules that contradict each other, with both file locations.
- A cleaned version of the CLAUDE.md with the dead weight removed, ready to review as a diff.

Don't apply the cut list. Propose it and wait for approval.
