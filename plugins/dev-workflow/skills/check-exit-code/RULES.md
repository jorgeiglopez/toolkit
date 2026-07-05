---
name: check-exit-code
lastUpdate: 2026-07-05 00:00
---

# Rules
- Never pipe a command whose exit code matters: `$?` reflects the last command in the pipe (the filter), not the gate.
- Preferred pattern: redirect to a log, echo `$?`, then inspect the log (`cmd > out.log 2>&1; echo "EXIT=$?"`).
- Alternatives: `set -o pipefail`, or read `${PIPESTATUS[0]}` (bash) / `$pipestatus[1]` (zsh).
- "Exit code 0" from a wrapper running a piped command is the filter's status. Re-run capturing the real status before trusting GREEN.
- If the log shows an error but the code says 0, believe the error.
