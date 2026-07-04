---
name: debate-team
lastUpdate: 2026-07-03 00:00
---

# Rules
- Pre-flight check (tmux + agent-teams flag) runs first; on failure, surface the fix and STOP — don't try to repair the environment.
- Spawn exactly 3 teammates: pro, con, neutral. Neutral cross-examines both sides but never issues a verdict.
- 10 turns is a hard cap. If a round needs more, cut a different round instead.
- The coordinator (this session) owns the final synthesis, always.
- Read only the three report files for synthesis — idle-notification previews are 5-10 word summaries, not arguments.
- Always shut down teammates via SendMessage, then TeamDelete. Never leave a team running after summary.
- Read-only on the repo; the only writes are to `/tmp/debate-team/`.
