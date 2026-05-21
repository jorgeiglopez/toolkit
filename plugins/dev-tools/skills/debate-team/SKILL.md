---
name: debate-team
description: "Spin up a 3-agent adversarial debate team (pro / con / neutral) on a topic, then produce a calibrated, executive-style briefing. Use when the user wants an evidence-based answer to a contested question, wants to stress-test a hypothesis from competing positions, or needs a structured second-opinion debate. The coordinator (this session) owns the final synthesis."
---

# Debate-team

Announce first:

> Using the `debate-team` skill to debate <topic>.

## Step 1 — Pre-flight (single script, halt on first failure)

Run this one block. If any check fails, surface the printed fix verbatim to the user and STOP. Do not try to repair the environment yourself.

```bash
set -e
tmux -V >/dev/null 2>&1 || { echo "NOT READY: tmux not installed → brew install tmux"; exit 1; }
[ -n "$TMUX" ]              || { echo "NOT READY: not in a tmux session → in iTerm2, run: tmux -CC"; exit 1; }
S=~/.claude/settings.json
[ -f "$S" ]                 || { echo "NOT READY: $S missing → create it with {}"; exit 1; }
jq -e '.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS == "1"' "$S" >/dev/null \
  || { echo 'NOT READY: agent teams flag missing → add to ~/.claude/settings.json: "env": {"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"}'; exit 1; }
jq -e '.teammateMode == "tmux"' "$S" >/dev/null \
  || { echo 'NOT READY: teammateMode missing → add to ~/.claude/settings.json: "teammateMode": "tmux"'; exit 1; }
echo "READY: $(tmux -V), teams flag on, split-pane mode active."
```

## Step 2 — Input

The user gives a TOPIC. If it isn't a clear yes/no question (so "pro" and "con" are ambiguous), ask once via `AskUserQuestion` what counts as the affirmative position, then proceed.

## Step 3 — Set up

- Pick a kebab-case `TEAM` name from the topic (e.g. `yerba-mate-research`).
- Compute the reports directory and create it:
  ```bash
  REPORT_DIR="/tmp/debate-team/$TEAM/reports"
  mkdir -p "$REPORT_DIR"
  ```
- Call **`TeamCreate`** with `team_name=$TEAM`.

## Step 4 — Spawn 3 teammates in parallel

Read the prompt template from `teammate-brief.md` (same folder as this SKILL.md). Substitute placeholders:

| Placeholder | Value |
|---|---|
| `{name}` | `pro` / `con` / `neutral` |
| `{other_two_names}` | the two siblings |
| `{team_name}` | `$TEAM` |
| `{topic}` | restated as a precise question (split sub-questions if needed) |
| `{role_instruction}` | see below |
| `{report_dir}` | the absolute `$REPORT_DIR` |

Role instructions:
- **pro** — "Defend YES on the topic. Steelman the strongest evidence-based case for the affirmative."
- **con** — "Defend NO on the topic. Steelman the strongest evidence-based case for the negative."
- **neutral** — "Be the IMPARTIAL EXAMINER. Weigh evidence, flag fallacies (cherry-picking, ecological inference, missing confounders), cross-examine BOTH sides. Do NOT issue a verdict — the coordinator does that."

Spawn each via `Agent` with: `run_in_background: true`, `subagent_type: "general-purpose"`, `model: "sonnet"`, `team_name: $TEAM`, `name: <pro|con|neutral>`, `prompt: <filled brief>`. All three calls in one message.

## Step 5 — Orchestrate the debate (10-turn hard cap)

| Turn | Action |
|---|---|
| 1–3 | Openings — covered by spawn prompt. Wait for all three idle-notifications. |
| 4–6 | Rebuttals — send each teammate a tight prompt referencing the others' opening summaries you saw in their idle notifications. |
| 7–8 | Closings for `pro` and `con` (final counter + closing position). |
| 9   | FINAL REPORT — send each teammate a `SendMessage` whose body starts with the literal string `FINAL REPORT`. Their brief tells them what to do: write to `{report_dir}/{name}.md`, then signal completion. |

Hold for each round to settle before triggering the next.

## Step 6 — Aggregate and synthesize

You ONLY read the three report files. You do NOT scrape session transcripts. You do NOT ask `neutral` to write the verdict.

```bash
ls "$REPORT_DIR"/*.md   # expect pro.md, con.md, neutral.md
```

If any file is missing after a reasonable wait, re-prompt that teammate ONCE with the missing path. If still missing, fall back to `recall-agent` for that teammate only.

Read the three files. Read `output-template.md` from this skill folder. Fill the template using the three reports — preserve calibration ("probably yes" / "probably no" / "unknown"), don't false-balance.

Deliver the filled markdown briefing as your final message to the user. This is the deliverable.

## Step 7 — Shutdown

`SendMessage` `{"type":"shutdown_request","reason":"Debate complete."}` to each teammate in parallel. Wait for the three `teammate_terminated` notifications. Then **`TeamDelete`**.

The reports under `/tmp/debate-team/$TEAM/` survive `TeamDelete` — tell the user the path in case they want the raw inputs.

## Rules

- 10 turns is a hard cap. If a round needs more, cut a different round.
- The coordinator owns the verdict. `neutral` provides methodological critique, not a synthesis.
- Each teammate's report file is the input. Don't paraphrase from idle-notification previews — they're 5–10 word summaries, not arguments.
- Always shutdown via the lead, then `TeamDelete`. Don't leave teams running.
- No commits, no edits to user code. This skill is read-only on the repo, write-only to `/tmp/debate-team/`.
