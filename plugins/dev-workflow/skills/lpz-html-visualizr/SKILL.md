---
name: lpz-html-visualizr
description: "Render any response, plan, or report as a self-contained mobile-first HTML page and serve it on the local network for phone reading. Use when the user says html-visualizr, make this an html, phone-friendly version, visualize this, or serve this on my network."
---

# html-visualizr

Turn the content at hand (usually your last response) into ONE self-contained HTML file and serve it over the LAN.

## Steps

1. Write `index.html` into a **fresh subfolder** of the session scratchpad — never the repo. Single file, zero external requests: inline CSS, system fonts, no CDN, no JS unless the content demands it.
2. Serve that folder in the background: `python3 -m http.server 8787 --bind 0.0.0.0` (port busy → 8788, 8789, …). Binding to `0.0.0.0` is what makes the phone reachable — never `127.0.0.1`.
3. Get the LAN IP and verify: `IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)`, then curl `http://127.0.0.1:<port>/` and expect HTTP 200.
4. Tell the user the URL `http://<IP>:<port>` (same Wi-Fi required) and also deliver the file via SendUserFile with `display: render`.
5. The server runs until killed. Offer to stop it; kill the background task when the user is done.

## Page rules (the look)

- `<meta name="viewport" content="width=device-width, initial-scale=1">`; body `max-width: 720px; margin: 0 auto; padding: 1rem`.
- Both themes via CSS variables + `@media (prefers-color-scheme: dark)`.
- Type: `-apple-system, "SF Pro Text", system-ui, sans-serif`; code in `ui-monospace, "SF Mono", Menlo` with a chip background.
- Structure: TL;DR/decision card **first**; content in bordered rounded `.card` sections; `h2` as small uppercase accent-colored section labels.
- Tables wrapped in `overflow-x: auto` divs (`min-width` on the table) — the body itself never scrolls horizontally.
- Callout boxes (tinted background + border) for warnings and decisions needed; numbered circles for phases/steps.

Baseline tokens (paste and adapt):

```css
:root { --bg:#f7f6f3; --card:#fff; --ink:#1c1b18; --muted:#6b6a64;
        --accent:#b3261e; --line:#e4e2dc; --chip:#efede8; }
@media (prefers-color-scheme: dark) {
  :root { --bg:#171614; --card:#211f1c; --ink:#ece9e2; --muted:#a09d94;
          --accent:#ff6b5e; --line:#35322c; --chip:#2c2a25; } }
```

## Common mistakes

- Serving a shared folder → directory listing leaks other files. One fresh subfolder per page.
- External fonts/CSS/JS → page breaks on LAN-only devices. Everything inline.
- Reporting `localhost` to the user → useless from a phone. Always the LAN IP.
- Leaving the server running forgotten across tasks → mention it and offer cleanup.
