---
name: lpz-ramp-up
lastUpdate: 2026-07-03 00:00
---

# Rules
- Read-only. No edits, no commits, no new files — especially no summary markdown unless asked.
- Order: stated intent → structure/artifacts → git history → synthesis. Don't skip to synthesis.
- Don't delegate the whole pass to a subagent — you need the context yourself. Do fan out independent checks (stack detection, Claude config) to parallel `Explore` agents.
- When memory/docs conflict with code, trust the code and flag the drift.
- Convert relative dates ("next week") to absolute ones using today's date.
- Skip irrelevant steps explicitly ("no specs/ dir") rather than silently.
