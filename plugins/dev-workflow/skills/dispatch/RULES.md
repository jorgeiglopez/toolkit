---
name: dispatch
lastUpdate: 2026-07-04 00:00
---

# Rules

- Standing project constraints live in `<project>/.claude/dispatch-constraints.md`, referenced by path in every dispatch; never retyped inline. Retyping the same constraint twice means the file is missing an entry: add it.
- File handoffs only: plans, diffs, and history are written to files and passed as paths. Pasting them into a dispatch prompt is banned.
- Every dispatch states a budget: max files touched, max tool calls or minutes.
- Every dispatch states the completion contract: final message IS the report; leave the project gate green; UI-facing work needs runtime verification, not just review.
- Orchestrations longer than one sitting keep a progress ledger file (task, status, commit range) and re-read it after compaction; conversation memory is not durable state.
- When a dispatched agent finishes, reap it (see agents-ctl); idle teammates never linger.
