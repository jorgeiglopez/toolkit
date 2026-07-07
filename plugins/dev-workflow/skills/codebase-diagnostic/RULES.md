---
name: codebase-diagnostic
lastUpdate: 2026-07-04 00:00
---

# Rules
- Pure git-log plumbing, no code reading, no framework assumptions. Complements ramp-up, which reads code and current state rather than history.
- Always cross-reference churn hotspots against bug-fix clusters; files on both lists are the highest-risk signal.
- Compare all-time contributor share against the last 6 months to catch bus-factor risk and knowledge loss.
- Note data-quality caveats explicitly: squash-merge workflows compress authorship, short histories need adjusted windows, vague commit messages make bug-cluster data unreliable.
- Zero crisis patterns (reverts/hotfixes) is itself a signal, flag it rather than skip it.
- Output ends with a ranked "recommended reading order," not just raw metrics.
