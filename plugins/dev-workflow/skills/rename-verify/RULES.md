---
name: rename-verify
lastUpdate: 2026-07-04 00:00
---

# Rules

- Prefer LSP rename for code symbols; fall back to structured find-and-edit.
- Verification is mandatory and mechanical: a scoped grep for the old name must return zero hits, or every remaining hit is individually justified (changelog, migration notes).
- Grep scope excludes `.git`, build output, lockfiles, and vendored dirs by default; respects .gitignore.
- Run the project gate after the rename; a rename is not done with a red gate.
- Report is a table: files changed, hits remaining (must be 0 or justified), gate status.
