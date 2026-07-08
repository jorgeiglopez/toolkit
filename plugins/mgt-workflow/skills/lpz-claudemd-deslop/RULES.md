---
name: lpz-claudemd-deslop
lastUpdate: 2026-07-08 00:00
---

# Rules
- Manually invoked only: runs when the user explicitly calls it, never auto-triggered.
- Read-only audit: propose cuts and a cleaned CLAUDE.md, never apply them without approval.
- Read every CLAUDE.md (project and user), every skill's SKILL.md, and any other instruction/context file before judging.
- Every flagged rule gets one reason: already-default, conflicts-with-X, duplicates-Y, vague, or single-incident-patch.
- Flag contradictions between files explicitly, don't silently pick one side.
- If a rule doesn't clearly fail one of the checks, leave it in. Don't cut for style alone.
