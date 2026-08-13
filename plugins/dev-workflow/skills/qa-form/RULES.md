---
name: qa-form
lastUpdate: 2026-08-02 00:00
---

# Rules
- Drive all shell work through `serve.sh` in this skill folder (`newdir`, `serve`, `ports`, `stop`) — running its steps as separate ad-hoc commands trips the sandbox classifier.
- Create the page dir with `serve.sh newdir <base> [slug]` — a fresh scratchpad subfolder, never the repo. Single self-contained `index.html`: inline CSS + JS, system fonts, no CDN, no external requests.
- Follow the `frontend-design` skill for all visual choices — palette, typography, layout, both themes.
- Serve with `serve.sh serve <dir>` launched via the Bash tool's background mode — never a trailing `&`, never a `/tmp` redirect. It binds `127.0.0.1` (required — `navigator.clipboard` needs a secure context), never any other address.
- The server auto-stops after 30 min (perl `alarm`, no coreutils needed) and opens the browser. Get the URL from the `URL=` line in the background task's output.
- Every question gets an id `Q1, Q2, …`; every choice option gets a short id `a, b, c`.
- Match input to answer shape: radio (one-of), checkbox (many-of), `<select>` (long one-of list), `<input>` (short text), `<textarea>` (long text); add an "Other" free-text option where a fixed list may not cover it.
- Mark required questions; disable Copy until they're filled; show how many remain; allow edit + re-copy.
- Copy stitches id + value into the fenced block, calls `navigator.clipboard.writeText`, shows "Responses copied", and always mirrors the block into a pre-selected `<textarea>` with a `document.execCommand('copy')` fallback.
- Payload is fenced with the skill name and carries ids only: `⟦qa-form⟧ … ⟦/qa-form⟧`. Expand ids from the legend held in the session; never echo full question/option text.
- Deliver the file via `SendUserFile` with `display: render` ONLY if that tool exists in the environment; otherwise the localhost URL is the deliverable — don't call a tool that isn't present.
- Wrap wide content in `overflow-x: auto`; the page body never scrolls horizontally.
- Offer `serve.sh stop [port]` for early cleanup; use `serve.sh ports` to see what's running.
