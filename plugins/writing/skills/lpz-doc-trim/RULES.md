---
name: lpz-doc-trim
lastUpdate: 2026-07-04 00:00
---

# Rules
- Targets existing documents (ADRs, READMEs, KB notes, writeups), not prose being drafted; use the brevify skill for that.
- Every cut must match one of six tags: meta, restates-obvious, justification-chain, wrapper-boilerplate, duplicate-section, prelude-padding. No matching tag, no cut.
- Deletions only: no reorders, no rewrites, no new sections. Minimal join words allowed for grammar.
- Never cut runnable code, fact tables, links, dates, version numbers, or copy-paste commands.
- Output an approval-gated diff with per-hunk rationale; never write until the user approves apply/go/hunk selection.
- If a cut would change meaning, flag `RISK:` instead of silently dropping it.
