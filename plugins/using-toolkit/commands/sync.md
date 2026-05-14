---
description: Refresh the jorgeiglopez-toolkit marketplace and install/update every plugin in it.
---

Run the toolkit sync script via the Bash tool:

```
"${CLAUDE_PLUGIN_ROOT}/bin/sync.sh"
```

Surface the script's full output to the user verbatim — do not summarise, do not interpret. The output reports which plugins were installed, updated, or already current.

After the script completes, if anything was installed or updated, remind the user to restart Claude Code so the changes take effect (both `install` and `update` say "restart required to apply").

If the script exits non-zero, surface the error and stop.
