---
name: backlog
description: Capture remaining work as simplified-Jira ticket files, or pick a ticket up cold. Use when the user says register the remaining tasks, file these as tickets, create a backlog, what is left to do (as tickets), or pick up ticket X.
---

# backlog

Simplified Jira, in files. Two modes.

## Capture mode

1. **Audit the session** for everything unfinished: deferred features,
   technical debt created, known bugs left, decisions parked. List them and
   group: related work shares a ticket, unrelated work never does.
2. **Write one file per ticket** at `docs/backlog/<CAT>-NNN-slug.md`.
   Categories: API, AUTH, DASH, DEBT, FEAT, OPS, TEST, UX, BUGS (add
   project-specific ones as needed). NNN increments per category.

   ```markdown
   # FEAT-012: Wire wizard save to POST /brief

   **Why**: the wizard collects data but the final step discards it.
   **What**: connect the save button to the API, show success/error state.
   **Where**: `src/app/wizard/step-7.tsx`, `src/api/brief.ts`
   **Related**: FEAT-008 (dashboard reads briefs), specs/wizard.md
   **Notes**: Zod schema already exists in `lib/schemas.ts`; reuse it.
   ```

3. **The cold-start bar**: someone (you, in a week, with none of today's
   context) must be able to execute from the file alone. If the ticket
   needs the session to make sense, it fails; add the missing context.
4. **Update `docs/backlog/INDEX.md`**: one checkbox line per ticket,
   grouped by category. Create it if missing.

## Pickup mode

Given a ticket ID:

1. Read the ticket, its Related tickets/files, and the relevant code.
2. Do the work (normal skills apply: commit, gate, verify).
3. Tick the INDEX checkbox and note the completing commit in the ticket.

## Placement

Default `docs/backlog/` in the current project. The user's harness-review
uses the same format at `harness-review/backlog/`; follow whatever the
project already established.
