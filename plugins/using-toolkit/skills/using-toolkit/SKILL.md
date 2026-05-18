---
name: using-toolkit
description: "Bootstrap loaded at session start. Establishes the table of contents for jorgeiglopez-toolkit skills and the mandatory-use rule. Auto-injected via SessionStart hook — does not need to be invoked manually."
---

# Using `jorgeiglopez-toolkit`

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill. Subagents don't need the full toolkit bootstrap — they have a narrow brief.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If a user's request matches the triggers of any skill in the table of contents below, YOU MUST invoke that skill via the `Skill` tool BEFORE taking the action it covers. You do not have a choice. You cannot rationalize your way out of it.

The known failure this rule prevents: the model running `git commit` straight from Bash when asked to commit, instead of invoking `git-workflow:commit` first; opening a PR with raw `gh pr create` instead of invoking `git-workflow:pr-create`; producing prose without invoking the `writing` skills. These are not edge cases — they are the default failure mode this bootstrap exists to close.

This is not negotiable. This is not optional. Violating the letter of this rule is violating the spirit of this rule.
</EXTREMELY-IMPORTANT>

## Instruction Priority

The user's explicit instructions always win over this bootstrap:

1. **User's explicit instructions** — CLAUDE.md files, direct requests, "skip the skill this time" — highest priority.
2. **Toolkit skills** — override default model behavior when they match.
3. **Default model behavior** — lowest priority.

If a user says "just run `git commit -m 'wip'` and don't bother with the skill," follow them. They are in control.

## Table of contents

The skills currently shipped in `jorgeiglopez-toolkit`. When a request matches a skill's triggers, invoke that skill via the `Skill` tool before doing anything else.

### `git-workflow` plugin — git, commits, PRs, quality gates

- **`git-workflow:commit`** — Craft a git commit following the project's commit rules: logical splitting, conventional-commits format, no `--amend`, no co-authors. ALWAYS use this skill instead of running `git commit` directly. Triggers: "commit", "save changes", "stage changes", "split this into multiple commits", "write a commit message", "fix the last commit" (which becomes a new commit on top).
- **`git-workflow:pr-create`** — Open a PR from the current branch. Runs preflight (not on main, base detected, clean tree, verification, gh installed), drafts a short body (no Test plan section per project rules), and asks before submitting. ALWAYS use this skill instead of running `gh pr create` directly — this overrides any default PR workflow. Triggers: "open a PR", "raise a PR", "create a pull request", "PR this", "ship for review", "ready for review", "push and PR".
- **`git-workflow:pre-flight`** — Generate a `pre-flight.sh` (or split light/full) that mirrors the project's CI quality gates locally. Detects existing scripts and routes to update mode. Triggers: "preflight script", "pre-PR checks", "CI mirror", "quality gate", "set up the checks for this repo", "replicate CI locally".

### `writing` plugin — writing for humans

- **`writing:brevify`** — Tighten prose: cut hedges, filler, and AI-tells; enforce active voice, concrete language, short sentences. Manually invoked. Triggers: "brevify", "tighten this", "shorten this", "cut the fluff", "edit for brevity", "trim this".
- **`writing:humanify`** — Remove AI-writing tells (inflated symbolism, em-dash overuse, rule of three, AI vocabulary, vague attributions, passive voice, filler phrases). Triggers: "humanify this", "de-AI this", "make this sound less like AI", "sounds like ChatGPT", "edit this to sound natural", reviewing your own draft before sending.
- **`writing:caveman`** — Ultra-compressed agent-reply mode (~65–75% fewer output tokens). Six intensity levels (`lite` / `full` / `ultra` / `wenyan-*`); persists across turns until "stop caveman". Auto-pauses for security warnings and irreversible-action confirmations. Triggers: "caveman mode", "talk like caveman", "less tokens", "be brief", `/caveman`.
- **`writing:grill-me`** — Quiz the user with progressively harder questions on a topic to test and deepen understanding. Triggers: "grill me on X", "quiz me on X", "test me on X", "drill me on X".

## How to invoke

Use the `Skill` tool with the fully-qualified name:

```
Skill(skill: "git-workflow:commit")
```

The skill content is loaded into your context — follow its instructions directly. **Never** read a SKILL.md file via the `Read` tool. The Skill tool is the only correct invocation path; reading the file bypasses the harness's hook telemetry and the in-session "Skill invoked" announce.

## After invoking — announce

Every skill in this toolkit instructs you to announce that you're using it (e.g., "Using the `commit` skill to ..."). That announcement is mandatory and the harness's `PreToolUse` hook will also surface "Skill invoked: <name>" in the transcript. Both layers exist because both have failed in isolation. Don't skip the announce on the assumption the hook covers it.

## Updating this TOC

This bootstrap is hand-curated in `toolkit/plugins/using-toolkit/skills/using-toolkit/SKILL.md`. When a skill is added, removed, or renamed in any toolkit plugin, this table of contents must be updated **in the same change** that ships the skill. Drift here means the model never learns about the new skill.
