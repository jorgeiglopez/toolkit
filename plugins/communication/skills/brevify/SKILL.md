---
name: brevify
description: "Tighten prose for human readers: cut hedges, filler, AI-tells; enforce active voice and short sentences. Use when the user asks to brevify, tighten, shorten, cut fluff, edit for brevity, or trim this. Manually invoked only."
---

# brevify

Apply these rules to any prose you produce or edit. Cut first, add back only if meaning suffers.

## Rules

1. **Lead with the verb or the conclusion.** Front-load the action or outcome; bury context after.
2. **Use the active voice and name the actor.** "The server rejects the request" beats "The request was rejected."
3. **State positively.** "He forgot" beats "He did not remember."
4. **Use concrete, specific language.** "The server crashed at 03:14" beats "An issue occurred."
5. **One idea per sentence.** If a sentence has two `and`s or more than two commas, split it.
6. **Cap sentences at ~25 words; paragraphs at ~4 sentences.** Beyond that, break or convert to a list.
7. **Use lists for parallel items.** Three or more comparable things → bulleted list, parallel grammar across items.
8. **Cut 10% on the second pass.** Every pass. Stop when cutting hurts meaning.

## Words and phrases to delete or replace

**Delete outright** — filler and hedges:
`very`, `really`, `quite`, `just`, `actually`, `basically`, `essentially`, `simply`, `clearly`, `obviously`, `of course`, `please note`, `it is important to note`, `it should be noted`, `there is`, `there are`, `it is` (as an opener).

**Replace with one word:**

| Wordy | Tight |
|---|---|
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| for the purpose of | to |
| a number of | several |
| prior to | before |
| with regard to | about |

**Pick the precise verb:**
- `leverage`, `utilize` → `use`
- `facilitate` → `help`
- `allows you to` → `lets you`

**AI-tells** — puffery, promo, vocabulary:
`pivotal`, `crucial`, `vital`, `testament`, `enduring legacy`, `groundbreaking`, `seamless`, `robust`, `cutting-edge`, `delve`, `multifaceted`, `foster`, `realm`, `tapestry`, `ensuring reliability`, `showcasing features`, `highlighting capabilities`.

**Time-bound** — usually delete:
`currently`, `as of this writing`, `at this time`, `in the future`, `soon`.

## Before / after

**Tightening a commit message**

> This commit implements the functionality for ensuring that user authentication is properly handled, showcasing robust error handling capabilities.

→

> Add user authentication with error handling

**Rewriting documentation**

> This groundbreaking feature leverages cutting-edge technology to deliver a seamless experience, fostering better engagement and driving impactful results.

→

> This feature uses WebSocket connections to update the dashboard in real time.

**Fixing passive voice**

> The configuration file is read by the application at startup.

→

> The application reads the configuration file at startup.

**Removing hedging**

> It is important to note that the API might potentially return an error in certain situations.

→

> The API returns an error when the token expires.

## Common mistakes

- Saying "be concise" without a cap. Use quantified limits (`≤25 words/sentence`, `≤4 sentences/paragraph`).
- Keeping the first draft because it scans fine. The point is the second pass.
- Trading one filler for another (`utilize` → `make use of`). Replace with `use`.
- Listing rules instead of applying them. Always run the cut pass on your own draft, and keep going until the meaning suffers.
