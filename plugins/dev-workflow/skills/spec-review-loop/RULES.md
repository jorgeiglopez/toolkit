---
name: spec-review-loop
lastUpdate: 2026-08-02 00:00
---

# Rules
- Read the source (code, vendor docs, signed document) before writing any finding; label unread claims as inference.
- One file per round, named `YYYY-MM-DD - <Subject> vN - <what this round is about>.md`; never edit a file the user has already replied in.
- Read user replies from the file, not the transcript — it may be compacted.
- Quantify pushback with the user's own numbers and arithmetic, not vague warnings.
- Re-check closed items every round: a later answer can void an earlier close.
- Push back on a disputed point once, with arithmetic; if reaffirmed, record it as an accepted risk and move on.
- Assign finding IDs once per type prefix (`BLOCK-n`, `FLAW-n`, `BUG-n`, `D-n`, `CONF-n`, `SIZE-n`, `REC-n`, `CARRY`); reopen with a suffix (`BUG-1a`), never mint a per-round prefix.
- Freeze all code and formal documents until the user explicitly terminates the loop.
- The final round is a fixed sweep checklist, run once, not a reaction to the last replies.
- Only the user terminates the loop; "we'll revisit later" is an open item, not termination.
- After termination: write requirements from closed items only, banner superseded docs, archive after rewrite (never during), keep review docs as the decision record.
