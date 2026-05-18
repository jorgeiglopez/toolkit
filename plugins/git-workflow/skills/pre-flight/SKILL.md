---
name: pre-flight
description: "Generate a `pre-flight.sh` that mirrors the project's local quality gates (tests, lint, format, type-check, security, hooks, CI steps). Use when the user asks for a preflight script, pre-PR checks, pre-commit checks, local CI, CI mirror, quality gate, or 'run all checks before I commit'. If a pre-flight script already exists, treat the invocation as an update."
---

# Pre-flight

<EXTREMELY-IMPORTANT>
If the user asks for a preflight script, a CI mirror, a quality-gate script, or wants to package the repo's checks for local execution, YOU MUST follow this skill end-to-end. The deliverable is a committed shell script, not a one-off bash command.

**Before doing anything else, run the Step 0 mode check below.** Generating a fresh script on top of an existing one destroys the user's customizations and silently replaces tuned commands. The mode check is not optional — it is the first action of this skill.

This is not negotiable. This is not optional. You cannot rationalize your way out of it.

Violating the letter of this rule is violating the spirit of this rule.
</EXTREMELY-IMPORTANT>

## Step 0 — Mode check (run this BEFORE anything, including the announce)

List the repo root and look for any of these files:

- `pre-flight.sh`
- `pre-flight-light.sh`
- `pre-flight-full.sh`

Use one command:

```bash
ls -1 pre-flight.sh pre-flight-light.sh pre-flight-full.sh 2>/dev/null
```

Branch on the result:

- **Any file matched → UPDATE MODE.** Do not proceed to the fresh-mode workflow under any circumstance. Follow [Update mode](#update-mode) below.
- **No files matched → FRESH MODE.** Follow [Fresh mode](#fresh-mode) below.

If you find yourself about to write `pre-flight.sh` from scratch without having run this check, stop. You're skipping the rule that exists specifically to protect the user's existing work.

## Step 1 — Announce (use the mode you just detected)

Send exactly one line to the user, picked from the mode:

- Update mode:
  > Using the `pre-flight` skill to update the existing pre-flight script(s).
- Fresh mode:
  > Using the `pre-flight` skill to generate a fresh pre-flight script for this repo.

The user must always see which path is being taken.

## Goal

Produce a deterministic, fast-failing shell script (or two — light + full) that runs every quality gate the project already has, plus any obvious gap worth flagging, so the user can verify a change locally before paying for CI. The script must be re-runnable, portable bash, and a checked-in artifact — not a transient one-off.

## Update mode

Triggered when Step 0 found one or more `pre-flight*.sh` files. **Do not regenerate the script from scratch.** Update it in place.

1. **Read the existing script(s).** Parse out the steps already covered into a set of commands. If a `# --- BEGIN custom ---` / `# --- END custom ---` block is present, note its exact contents and line range — that block is sacred user content and must survive the update verbatim.

2. **Re-inventory the repo.** Run the [Stack detection](#1-determine-the-tech-stack), [Safeguard inventory](#2-inventory-existing-safeguards), and [Gap analysis](#3-think-about-gaps) sub-steps from the Fresh mode section below. You're rebuilding the "what should be in the script today" picture.

3. **Compute the diff** between what's in the script now and what the fresh inventory turns up:
   - **New**: checks the inventory finds that aren't in the current script (e.g., a TypeScript config was added since last run).
   - **Stale**: steps in the current script whose backing config/dependency is gone (e.g., the project dropped Jest for Vitest).
   - **Renamed**: same intent, different command (e.g., `tslint` → `eslint`, a `bin/` wrapper appeared).

4. **Present the diff** and ask via `AskUserQuestion`:
   > How should I apply the diff?
   > - Apply all changes.
   > - Pick which to apply.
   > - Skip — leave the script as-is.

5. **Patch the script(s)** according to the user's choice. **Preserve everything between `# --- BEGIN custom ---` and `# --- END custom ---` verbatim** — line-for-line, including blank lines and comments. If you have to move the marker block, keep its contents byte-identical.

6. **Verify**: `chmod +x` and `bash -n <path>` for every script touched.

7. **Report** what changed in one short list (added / removed / renamed steps).

## Fresh mode

Triggered when Step 0 found no `pre-flight*.sh` files. Generate from zero.

### 1. Determine the tech stack

Read the repo to identify primary languages and frameworks. Useful signals:

- `package.json` — Node. Detect package manager from lockfile: `package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm, `bun.lockb` → bun.
- `Gemfile` / `Gemfile.lock` — Ruby. `bin/rails` → Rails.
- `pyproject.toml`, `setup.py`, `requirements*.txt`, `Pipfile`, `poetry.lock`, `uv.lock` — Python.
- `go.mod`, `Cargo.toml`, `mix.exs`, `pubspec.yaml`, `composer.json`, `pom.xml`, `build.gradle*` — other ecosystems.
- `Dockerfile`, `docker-compose.yml`, `Makefile`, `Justfile`, `Taskfile.yml` — orchestration hints.

Polyglot is common (e.g., Rails + React frontend). Record every stack you find — the script needs to cover all of them.

### 2. Inventory existing safeguards

Be methodic. Walk every category. For each finding, record the exact command to run it and where you discovered it (so you can justify the inventory to the user).

**Linters / static analysis**
- ESLint (`.eslintrc*`, `eslint.config.*`), Biome (`biome.json`)
- Rubocop (`.rubocop.yml`), Standard (`Gemfile`)
- Ruff / Flake8 / Pylint (config in `pyproject.toml`, `.flake8`, `setup.cfg`)
- golangci-lint (`.golangci.yml`), staticcheck
- clippy (Cargo), credo (Elixir), dart analyze, phpstan, psalm

**Formatters** (treat as a check: `--check` mode, not write)
- Prettier (`.prettierrc*`), dprint
- Black / Ruff format
- gofmt / goimports
- StandardRB / Syntax_tree

**Type checkers**
- TypeScript (`tsconfig.json`) → `tsc --noEmit`
- mypy / pyright / pyre
- Sorbet (Ruby), Flow, Hack

**Test runners** — find via package scripts, lockfiles, config files:
- Jest, Vitest, Mocha, Playwright, Cypress
- RSpec, Minitest, Cucumber
- pytest, unittest, nose
- `go test`, `cargo test`, `mix test`

**Security / dependency audits**
- `npm audit`, `yarn audit`, `pnpm audit`
- `bundle audit` (bundler-audit)
- `pip-audit`, `safety`
- `cargo audit`
- Secret scanners if configured: `gitleaks`, `trufflehog`

**Git hooks / hook managers** — check `.git/hooks/`, `.husky/`, `lefthook.yml`, `.pre-commit-config.yaml` (pre-commit framework), `overcommit`. These often reveal checks the project already enforces.

**CI workflows** — read `.github/workflows/*.yml`, `.gitlab-ci.yml`, `.circleci/config.yml`, `.buildkite/`. Extract `run:` (GitHub) / `script:` (GitLab) lines from jobs gated on merge. **Skip** anything that needs secrets, depends on a hosted-runner-only feature, or is a deploy step. The goal is to mirror what CI checks, not what CI ships.

**Project-specific entry points** — these usually wrap everything cleanly:
- `bin/ci`, `bin/test`, `bin/lint`, `bin/check`, `bin/setup`
- `make ci`, `make check`, `make test`
- `just ci`, `just check`
- npm scripts named `ci`, `check`, `verify`, `validate`

If a project-specific entry point exists, **prefer it over re-discovering individual commands**. Wrappers capture conventions you'd miss when assembling pieces.

### 3. Think about gaps

After inventorying what exists, consider what's missing that's commonly worth adding. Don't pad the list — only flag what would genuinely catch real defects in this stack:

- Type checker is present in the repo but not in CI → add it.
- Lockfile staleness: `bundle check`, `npm ci --dry-run`, `cargo --locked`, `poetry check`.
- Migration check (Rails: `bin/rails db:migrate:status`).
- Dead-code / unused-dependency scanner (knip, ts-prune, depcheck, debride).
- Markdown / docs linter (markdownlint) if the repo has substantial docs.
- License-compatibility check (`license-checker`) for projects that publish.

Mark every gap-suggestion as `[optional]` so the user can decline without friction.

### 4. Present findings and ask the user

Show the inventory grouped by category. Each item: command, source of detection, and a `[required]` / `[optional]` tag (`[required]` = already enforced by CI or hook; `[optional]` = your suggestion from step 3).

Then ask via `AskUserQuestion`:

> How should I package this?
> - **A. One script** — bundle everything into `pre-flight.sh`.
> - **B. Light + full split** — `pre-flight-light.sh` (static analysis + fast unit tests) and `pre-flight-full.sh` (everything, including long suites and integration/e2e). Recommend B if the full test suite typically takes more than ~60 seconds.
> - **C. Customize** — let me tell you what to include or exclude.

If the user picks C, ask one follow-up to pin down the customization, then proceed.

### 5. Generate the script(s)

Each script:

- Shebang `#!/usr/bin/env bash`
- `set -euo pipefail`
- 3–4 line header comment: what it runs, the skill that generated it, today's date, and the git commit it was generated against (run `git rev-parse --short HEAD` to capture). No decoration.
- Each step on its own line, preceded by `echo "==> <step name>"`. Exit on first failure (default with `set -e`).
- A trailing `echo "All checks passed."`
- No emoji, no unicode box drawing, no color codes — keep output portable across terminals and CI logs.
- An empty `# --- BEGIN custom ---` / `# --- END custom ---` block near the end so the user has a stable place to add ad-hoc steps that survive future updates.

Prefer repo-relative wrappers when available (`bin/rspec`, `bin/rails test`) over package-manager–scoped commands (`bundle exec rspec`) — wrappers pick up the project's tooling configuration consistently. Fall back to `npm run`, `bundle exec`, `poetry run`, etc. when no wrapper exists.

After writing each file:

1. `chmod +x <path>`
2. `bash -n <path>` to syntax-check.

### 6. Report back

Tell the user:

- Path(s) of the generated script(s) and how to run them.
- Whether they're meant to be checked in (default: yes — these are part of the repo's quality contract).
- One bullet per `[optional]` item: included or skipped, and why.
- That re-invoking this skill later will refresh the script (Step 0 will detect it and route to Update mode).

## Red Flags — STOP

| Rationalization | Reality |
|---|---|
| "I'll skip the mode check this once — I know the repo doesn't have a script" | You don't know until you `ls`. Run it. |
| "The existing script looks fine, I'll skip Update mode" | Run the diff. Catching drift is the entire point of re-invocation. |
| "I'll just overwrite the existing script — simpler" | Never. Always diff first. The custom block must be preserved. |
| "I'll run the checks myself this once" | The deliverable is the **script**. A one-off run doesn't help next time. |
| "Test suite is slow — I'll silently drop it" | Don't drop. Offer split mode (option B) so fast feedback survives. |
| "Lint isn't configured, so skip it entirely" | Don't add what isn't there, but flag it under gaps so the user can decide. |
| "CI has 14 steps — I'll pick the 3 important ones" | Inventory all of them, mark required vs optional, let the user prune. |
| "I'll write it in Python — more powerful than bash" | Bash. Portable, no runtime to install, no virtualenv to source. |

## Rules

- **Always run Step 0 first.** No exceptions. Skipping mode detection is the single failure mode this skill was designed to prevent.
- Output is always one or two bash scripts at the repo root, named `pre-flight.sh` / `pre-flight-light.sh` / `pre-flight-full.sh` — no other names.
- Never overwrite an existing `pre-flight*.sh` without computing a diff and asking the user.
- Never embed credentials, tokens, or env-var values in the script — reference env vars by name only (`"$DATABASE_URL"`, not the literal value).
- Each script must exit non-zero on the first failure (`set -euo pipefail`).
- Preserve user customizations inside `# --- BEGIN custom ---` / `# --- END custom ---` across all updates, byte-for-byte.
- Don't shell out to network-dependent commands unless CI also does (e.g., `npm audit` is fine if CI runs it; arbitrary curls are not).
