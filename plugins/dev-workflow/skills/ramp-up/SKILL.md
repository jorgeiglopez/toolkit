---
name: ramp-up
description: "Build a complete picture of an unfamiliar repo, fast and methodically. Use when the user says ramp up, onboard me, get context on this repo, tour this codebase, or asks you to pick up work in a project you haven't seen. Read-only — no edits, no commits."
---

# Ramp-up

Goal: in one pass, learn what exists, what's in flight, and what's pending. Miss nothing important. Read-only.

## Announce first

Before any other tool call, send one line:

> Using the `ramp-up` skill to tour this repo.

## Order of work

Top-down (intent) → bottom-up (artifacts) → synthesis. Steps 2 and 6 fan out well to parallel `Explore` agents.

### 1. Read stated intent

- Every `**/CLAUDE.md` (root first, then nested). Subtrees often override conventions.
- Root `README.md` and any `*.md` one level down.
- Note any "current plan" or "active workstream" pointer.

### 2. Detect the stack, then load the matching template

Look at the root for stack signals:

| Signal | Stack | Template |
|---|---|---|
| `package.json` + `next.config.*` | Next.js | `stacks/nextjs.md` |
| `package.json` (no Next) | Node | `stacks/nodejs.md` |
| `Gemfile` + `config/application.rb` | Rails | `stacks/rails.md` |
| `pyproject.toml` / `requirements.txt` | Python | `stacks/python.md` |
| `go.mod` | Go | `stacks/go.md` |
| `Cargo.toml` | Rust | `stacks/rust.md` |

Read the matching template *now* and fold its checks into the rest of this pass. Multiple stacks? Load each.
No match? Skip — note it and continue.

### 3. Map the structure

- `ls -la` at root.
- `find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/.git/*'` (or `tree -L 3` if available).
- Note the top-level domains and any consistent naming prefixes.

### 4. Inventory planning + spec work

- Spec-kit dirs: `specs/*/` — read `spec.md`, `plan.md`, `tasks.md`, `research.md`, `contracts/`, `checklists/`. Count `[ ]` vs `[x]` in `tasks.md`.
- Ad-hoc planning: `find . -iname '*plan*.md' -o -iname '*proposal*.md' -o -iname '*rfc*.md' -o -iname '*decision*.md' -o -iname '*adr*.md'`.

### 5. Inventory backlogs and notes

- `find . -type f \( -iname 'TODO*' -o -iname 'BACKLOG*' -o -iname 'NOTES*' -o -iname 'ROADMAP*' -o -iname 'DEBT*' -o -iname 'KNOWN_ISSUES*' \) -not -path '*/node_modules/*' -not -path '*/.git/*'`
- `grep -rIn --exclude-dir={node_modules,.git,dist,build,.next,vendor,target} -E '\b(TODO|FIXME|XXX|HACK)\b' . | head -100` — skim, don't read every hit.

### 6. Inventory Claude config

- `.claude/agents/*.md` — division of labor; references to pending work.
- `.claude/skills/*/SKILL.md` — codified procedures.
- `.claude/commands/*.md` — custom slash commands.
- `.claude/settings.json` and `settings.local.json` — permissions, hooks, env. Hooks signal expected automated behavior.

### 7. Reconstruct recent activity from git

- `git log --oneline -50` — recent ships.
- `git log --since='30 days ago' --oneline --all` — wider lens.
- `git branch --sort=-committerdate | head -20` — open lines of work.
- `git status` and `git stash list` — uncommitted state.
- Current branch vs main: `git log main..HEAD --oneline` + `git diff main...HEAD --stat`.
- If `gh` is configured: `gh pr list --state all --limit 30` and `gh issue list --state all --limit 30`.

### 8. Run the stack-specific checks

Whatever the loaded template(s) added: dep file, lockfile freshness, test suite location, skipped tests, migrations, env vars, build/run scripts. Don't execute build/test — just locate and read.

### 9. Synthesize

One artifact in chat (no file unless asked), four sections:

1. **What this project is** — one paragraph.
2. **What's shipped** — major capabilities now working.
3. **What's in flight** — the active workstream and where it sits.
4. **Pending backlog** — grouped by area, each item one line with its source path.

## Rules

- Read-only. No edits, commits, or new files. Especially no summary markdown unless asked.
- Don't delegate the whole ramp-up to a subagent — you need the context. *Do* fan out steps 2 and 6 to parallel `Explore` agents when checks are independent.
- When sources conflict (memory file vs. code; doc vs. code), trust the code and flag the drift.
- Convert relative dates ("next week", "Thursday") to absolute ones using today's date.
- Skip irrelevant steps explicitly rather than silently — say "no specs/ dir" so the user knows you looked.
