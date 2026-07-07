---
name: web-quality-audit
lastUpdate: 2026-07-04 00:00
---

# Rules
- Orchestrator only: fans out to `performance`, `core-web-vitals`, `accessibility`, `seo`, one subagent per dimension, in parallel.
- Each dimension agent loads its own skill before starting; don't inline dimension-specific procedure here.
- Consolidate findings, don't re-score them. Pass through each dimension agent's severity call as-is.
- Severity levels are fixed: Critical, High, Medium, Low. Don't invent new tiers.
- If no live URL/build exists, dimension agents review source and markup statically instead of running Lighthouse.
- Report format is the four-section markdown template (Critical/High/Summary/Recommended priority). Don't freelance a different shape.
