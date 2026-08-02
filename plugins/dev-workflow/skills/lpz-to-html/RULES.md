---
name: to-html
lastUpdate: 2026-08-02 00:00
---

# Rules
- Drive all shell work through `serve.sh` in this skill folder (`newdir`, `serve`, `ip`, `ports`, `stop`) — running its steps as separate ad-hoc commands trips the sandbox classifier.
- Create the page dir with `serve.sh newdir <base> [slug]` — a fresh scratchpad subfolder, never the repo, never a shared folder (a shared folder's directory listing leaks other files).
- Single self-contained `index.html`: inline CSS, system fonts, no CDN, no external requests, no JS unless the content requires it.
- Serve with `serve.sh serve <dir>` launched via the Bash tool's background mode — never a trailing `&`, never a `/tmp` redirect, never bind `127.0.0.1`.
- The server auto-stops after 30 min (perl `alarm`, no coreutils needed). Get the URL from the `URL=` line in the background task's output — the script already picked a free port and the LAN IP.
- Always report the LAN IP URL to the user, never `localhost`.
- Deliver the file via `SendUserFile` with `display: render` ONLY if that tool exists in the environment; otherwise the LAN URL is the deliverable — don't call a tool that isn't present.
- Follow the `frontend-design` skill for all visual choices — palette, typography, layout, and both themes.
- Wrap tables in `overflow-x: auto`; the page body itself must never scroll horizontally.
- Offer `serve.sh stop [port]` for early cleanup; use `serve.sh ports` to see what's running.
