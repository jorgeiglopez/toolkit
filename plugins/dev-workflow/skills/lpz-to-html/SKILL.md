---
name: lpz-to-html
description: "Render any response, plan, or report as a self-contained mobile-first HTML page and serve it on the local network for phone reading. Use when the user says to-html, make this an html, phone-friendly version, visualize this, or serve this on my network."
---

# to-html

Turn the content at hand (usually your last response) into ONE self-contained HTML file and serve it over the LAN.

## Steps

1. Write `index.html` into a **fresh subfolder** of the session scratchpad — never the repo. Single file, zero external requests: inline CSS, system fonts, no CDN, no JS unless the content demands it.
2. Serve that folder in the background: `python3 -m http.server 8787 --bind 0.0.0.0` (port busy → 8788, 8789, …). Binding to `0.0.0.0` is what makes the phone reachable — never `127.0.0.1`.
3. Get the LAN IP and verify: `IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)`, then curl `http://127.0.0.1:<port>/` and expect HTTP 200.
4. Tell the user the URL `http://<IP>:<port>` (same Wi-Fi required) and also deliver the file via SendUserFile with `display: render`.
5. The server runs until killed. Offer to stop it; kill the background task when the user is done.

## The look

Invoke the `frontend-design` skill and follow its design plan for all visual choices — palette, typography, layout, dual-theme tokens. Keep the page self-contained and mobile-first: `<meta name="viewport" content="width=device-width, initial-scale=1">`, and wrap tables, `pre`, and diagrams in `overflow-x: auto` so the body never scrolls sideways.

## Common mistakes

- Serving a shared folder → directory listing leaks other files. One fresh subfolder per page.
- External fonts/CSS/JS → page breaks on LAN-only devices. Everything inline.
- Reporting `localhost` to the user → useless from a phone. Always the LAN IP.
- Leaving the server running forgotten across tasks → mention it and offer cleanup.
