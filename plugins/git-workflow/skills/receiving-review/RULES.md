---
name: receiving-review
lastUpdate: 2026-07-07 00:00
---

# Rules
- Verify every finding against the actual codebase before implementing it. Don't implement on the reviewer's word alone.
- No performative agreement ("You're absolutely right!", "Great point!", any thanks). Restate the requirement, ask, push back, or just fix it.
- Unclear item in a batch -> stop and ask before implementing anything else in that batch.
- Reviewer suggests a fuller/"proper" implementation of something unused -> grep for usage first, raise YAGNI removal instead if unused.
- Read `docs/code_review_decisions.md` before triaging if it exists; a finding matching a settled decision is not re-litigated.
- After triage, append each finding to `docs/code_review_decisions.md` as `ID | decision | rationale`. Create the file if missing.
- Order of implementation: clarify unclear items, then blocking issues, then simple fixes, then complex fixes. Test each before moving on.
- Wrong pushback -> state the correction factually and move on, no apology.
