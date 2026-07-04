---
name: pre-flight
lastUpdate: 2026-07-03 00:00
---

# Rules
- Always run the Step 0 mode check first, before the announce, no exceptions — it decides Update vs Fresh mode.
- If any `pre-flight*.sh` exists, never regenerate from scratch: compute a diff (new / stale / renamed) and ask the user how to apply it.
- Output is only `pre-flight.sh` / `pre-flight-light.sh` / `pre-flight-full.sh` at the repo root — no other names.
- Preserve the `# --- BEGIN custom --- / --- END custom ---` block byte-for-byte across every update.
- Never embed credentials or token values — reference env vars by name only.
- Each script exits non-zero on first failure (`set -euo pipefail`).
- No network-dependent commands unless CI already runs them.
