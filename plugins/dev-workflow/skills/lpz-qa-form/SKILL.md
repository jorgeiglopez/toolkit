---
name: lpz-qa-form
description: "Turn the questions you'd otherwise ask in the CLI into ONE self-contained HTML form, served on localhost, that the user answers with radios/checkboxes/dropdowns/text. Use when the user says qa-form, ask me in a form, or you have several questions to ask at once."
---

# lpz-qa-form

Ask a batch of questions as an HTML form the user fills in a browser, then have them paste one compact block back. localhost only.

## Steps

1. Invoke the `frontend-design` skill for all visual choices.
2. Write `index.html` into a **fresh subfolder** of the session scratchpad — never the repo. Single file, zero external requests: inline CSS + JS, system fonts, no CDN.
3. Build one form. Give each question an id `Q1, Q2, …` and each choice option a short id `a, b, c`. Pick the input per answer shape:
   - one-of → radio · many-of → checkbox · long one-of list → `<select>` · short free text → `<input>` · long free text → `<textarea>`.
   - add an "Other" free-text option wherever a fixed list might not cover the answer.
   - mark required questions; disable Copy until they're filled and show an "N unanswered" hint.
4. Copy button — a self-contained script stitches each answered id + value into the fenced block below, calls `navigator.clipboard.writeText`, and shows **"Responses copied"**. Also mirror the block into a pre-selected `<textarea>` and fall back to `document.execCommand('copy')` so copy never dead-ends. Allow edit + re-copy.
5. Serve on localhost only: `python3 -m http.server <port> --bind 127.0.0.1` in the background (bump port on conflict), then `open http://localhost:<port>`. Also deliver the file via SendUserFile with `display: render`.
6. Wait for the user to paste the block back. Expand each id from the legend you hold to read the answers. Offer to stop the server; kill the background task when done.

## Payload format

Fenced with the skill name, ids only — you hold the id→text legend in the session:

```
⟦lpz-qa-form⟧
Q1=b
Q2=a,c
Q3=free-text answer, may span lines
⟦/lpz-qa-form⟧
```

## Common mistakes

- Binding anything but `127.0.0.1` → `navigator.clipboard` is blocked outside a secure context; localhost is what makes one-click copy work.
- No fallback → if clipboard is still blocked, the pre-selected `<textarea>` + `execCommand('copy')` is the escape hatch.
- Echoing full question/option text into the payload → verbose; send ids and expand from the legend you hold.
- External CSS/JS/fonts, or writing into the repo → breaks the self-contained, throwaway page.
- Body scrolling sideways → wrap wide content in `overflow-x: auto`.
