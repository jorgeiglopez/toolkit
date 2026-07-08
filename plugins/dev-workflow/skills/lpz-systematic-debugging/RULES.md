---
name: lpz-systematic-debugging
lastUpdate: 2026-07-07 00:00
---

# Rules
- No fix without completing root cause investigation first (Phase 1). Symptom fixes are failure, not progress.
- Do not reason you way out of doing a root cause analysis. "Simple" or "urgent" is never a reason to skip the process, it's faster than thrashing.
- Four phases in order: reproduce, isolate, root cause (single hypothesis, test minimally), then fix. Don't skip ahead.
- One change at a time when testing a hypothesis or applying a fix. Never stack multiple fixes together.
- Write a failing test before implementing the fix. TDD approach.
- 3+ failed fixes on the same issue means stop and question the architecture with the user, not attempt a 4th fix.
