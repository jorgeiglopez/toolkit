---
name: debate-team
description: "Spin up a 3-agent adversarial debate team (pro / con / neutral) on a topic, then synthesize the verdict as coordinator. Use when the user wants to debate a question, stress-test a hypothesis, or get a calibrated answer from competing evidence-based positions. Requires agent teams enabled."
---

# Debate-team

Announce first:

> Using the `debate-team` skill to run an adversarial debate on <topic>.

## Pre-flight (once per machine)

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `~/.claude/settings.json` env block.
- `brew install tmux` and set `"teammateMode": "tmux"` in settings.
- Run Claude inside `tmux -CC` in iTerm2 for native split panes.

If any of those are missing, stop and tell the user — don't try to compensate.

## Input

The user gives a TOPIC and (optionally) which side is "pro" and which is "con". If unclear, ask once with `AskUserQuestion`, then proceed.

## Workflow

1. **`TeamCreate`** with a short kebab-case `team_name` derived from the topic.

2. **Spawn 3 teammates in parallel** via the `Agent` tool with `run_in_background: true`, `subagent_type: "general-purpose"`, `model: "sonnet"`, `team_name: <team>`, and `name: "pro" | "con" | "neutral"`. Each prompt MUST include the [Teammate brief](#teammate-brief) below with the role-specific block filled in.

3. **Orchestrate the debate via `SendMessage`** (max 10 turns total):
   - Turns 1–3: openings (one per teammate, no prompt from you — the spawn prompt covers turn 1).
   - Turns 4–6: rebuttals. Send each teammate a tight prompt referencing the other two's openings.
   - Turns 7–8: closings for `pro` and `con` (final counter + 2-sentence closing position).
   - Turn 9: reserved slack.

   Wait for each round to finish before triggering the next. You only see idle-notification summaries from teammates — that's fine; you'll read the bodies in step 4.

4. **Coordinator synthesis (this is the key change).** Do **not** ask `neutral` to synthesize — you only see idle-summary lines from teammates during the debate. Instead, invoke the `recall-agent` skill to pull each teammate's full transcript (case: team teammate). Extract every `SendMessage` body per role, then write the verdict yourself as markdown:
   - **Verdict** — one calibrated sentence per sub-question (probably yes / probably no / unknown).
   - **What survived from each side** — strongest pro point, strongest con point, where each conceded.
   - **Confounders & open questions** — what would actually settle this.
   - **Sources** — pooled from all three teammates' citations.

   Do this BEFORE shutdown, or after — transcripts survive `TeamDelete`.

5. **Shutdown** all teammates in parallel: `SendMessage` with `{"type":"shutdown_request","reason":"Debate complete."}` to each.

6. **`TeamDelete`** after all three `teammate_terminated` notifications land. (Transcripts survive deletion — synthesis step 4 reads them even if run after delete.)

## Teammate brief

Paste this in every spawn prompt. Replace `{{ROLE_INSTRUCTION}}` per teammate:

```
You are "{name}", a teammate in the "{team_name}" team. Your teammates are
{other_two_names}. The team lead is "lead".

# Topic
{topic — restated as a precise scientific or technical question; split into
sub-questions if needed}

# Your role
{{ROLE_INSTRUCTION}}

# Debate rules (all teammates)
- Evidence-based ONLY. Research first, opinions second. Use WebSearch and
  WebFetch. Cite reputable sources: peer-reviewed papers, official agencies,
  major reviews. Quote study design, n, and effect size where reported.
- Concede points the other side gets right. Attack arguments, not people.
- Tight messages: 3–6 paragraphs per turn.

# Protocol
- Communicate ONLY via SendMessage. Plain text output is invisible to teammates.
- Each turn: send your argument to BOTH other teammates (two SendMessage calls),
  plus a 5–10 word summary to "lead".
- Wait for the lead to prompt subsequent rounds. Don't speak out of turn.

# Turn 1 (NOW)
Research the topic, then post your OPENING STATEMENT. Then go idle.

You have ~3 turns total in a 10-turn cap.
```

### `{{ROLE_INSTRUCTION}}` per teammate

- **pro**: "Defend the YES position on {topic}. Steelman the strongest evidence-based case for the affirmative."
- **con**: "Defend the NO position on {topic}. Steelman the strongest evidence-based case for the negative."
- **neutral**: "Be the IMPARTIAL SCIENTIST. Weigh evidence, call out fallacies (cherry-picking, ecological inference, missing confounders), and cross-examine BOTH sides on their weakest points. Do NOT synthesize a verdict — the coordinator does that. Bring independent citations; don't take pro's or con's on faith."

## Rules

- Always patch the spawn prompt with role-specific blocks; never reuse a generic prompt.
- Do not bypass the 10-turn cap. If a round needs more, cut a different round.
- The coordinator writes the final synthesis from transcripts. `neutral` is an examiner, not a judge.
- Always shutdown via the lead, then `TeamDelete`. Do not leave teams running.
- If the user is not inside tmux when this starts, warn them — split panes won't appear.
