---
name: backlog
lastUpdate: 2026-07-04 00:00
---

# Rules

- One ticket per work item, one file per ticket: `docs/backlog/<CAT>-NNN-slug.md`. Related work goes in one ticket; unrelated work gets separate tickets.
- Category prefixes: API, AUTH, DASH, DEBT, FEAT, OPS, TEST, UX, BUGS, plus project-specific ones; numbering is per-category and never reused.
- The cold-start bar: a ticket must be executable a week later with zero session context. Fields: Why, What, Where (files/paths), Related, Notes.
- `docs/backlog/INDEX.md` is the checklist; every ticket appears there, capture updates it, pickup ticks it.
- Capture is honest: include technical debt and deferred decisions, not just features.
- Pickup mode reads the ticket plus its Related links before touching code.
- Location and prefixes are per-project configurable; the defaults above match existing use.
