---
name: accessibility
lastUpdate: 2026-07-04 00:00
---

# Rules
- Structure follows POUR (Perceivable, Operable, Understandable, Robust); don't reorganize around WCAG numbering in SKILL.md, the criteria table already does that in `references/WCAG.md`.
- Every code pattern lives in `references/A11Y-PATTERNS.md`, keyed by anchor. SKILL.md only carries the rule plus a one-line before/after summary, never the full snippet.
- New-in-2.2 criteria (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8) must stay explicitly flagged as "new in 2.2" so an auditor knows they're easy to miss on older checklists.
- Native HTML elements beat ARIA roles; only reach for ARIA when no native element covers the interaction pattern.
- The Testing checklist section stays short (bullets, no code beyond the two audit commands); anything longer belongs in a reference file.
