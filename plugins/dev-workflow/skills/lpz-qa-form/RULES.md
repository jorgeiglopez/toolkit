---
name: lpz-qa-form
lastUpdate: 2026-08-02 00:00
---

# Rules
- Write the page into a fresh scratchpad subfolder, never the repo. Single self-contained `index.html`: inline CSS + JS, system fonts, no CDN, no external requests.
- Follow the `frontend-design` skill for all visual choices — palette, typography, layout, both themes.
- Serve on localhost only: `python3 -m http.server <port> --bind 127.0.0.1` (bump port on conflict), then `open http://localhost:<port>`. Never any other bind address.
- Every question gets an id `Q1, Q2, …`; every choice option gets a short id `a, b, c`.
- Match input to answer shape: radio (one-of), checkbox (many-of), `<select>` (long one-of list), `<input>` (short text), `<textarea>` (long text); add an "Other" free-text option where a fixed list may not cover it.
- Mark required questions; disable Copy until they're filled; show how many remain; allow edit + re-copy.
- Copy stitches id + value into the fenced block, calls `navigator.clipboard.writeText`, shows "Responses copied", and always mirrors the block into a pre-selected `<textarea>` with a `document.execCommand('copy')` fallback.
- Payload is fenced with the skill name and carries ids only: `⟦lpz-qa-form⟧ … ⟦/lpz-qa-form⟧`. Expand ids from the legend held in the session; never echo full question/option text.
- Also deliver the file via SendUserFile with `display: render`.
- Wrap wide content in `overflow-x: auto`; the page body never scrolls horizontally.
- The server keeps running until killed — mention it and offer cleanup.
