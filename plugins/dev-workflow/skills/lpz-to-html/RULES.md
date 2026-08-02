---
name: to-html
lastUpdate: 2026-08-02 00:00
---

# Rules
- Write the page into a fresh scratchpad subfolder, never the repo, and never a shared folder — a shared folder's directory listing leaks other files.
- Single self-contained `index.html`: inline CSS, system fonts, no CDN, no external requests, no JS unless the content requires it.
- Serve with `python3 -m http.server <port> --bind 0.0.0.0` (bump port on conflict) — never bind `127.0.0.1`, it's unreachable from the phone.
- Verify the server responds (curl 127.0.0.1 for a 200) before reporting the URL.
- Always report the LAN IP URL to the user, never `localhost`.
- Also deliver the file via SendUserFile with `display: render`.
- Follow the `frontend-design` skill for all visual choices — palette, typography, layout, and both themes.
- Wrap tables in `overflow-x: auto`; the page body itself must never scroll horizontally.
- The server keeps running until killed — mention it and offer cleanup rather than leaving it forgotten.
