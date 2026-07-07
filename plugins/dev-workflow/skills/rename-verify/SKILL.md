---
name: rename-verify
description: Rename a symbol, flag, file, or directory everywhere and prove zero leftovers. Use when the user asks to rename something across a repo, change a CLI flag or config key name, or verify that nothing still references an old name.
---

# rename-verify

A rename is a claim; the grep is the proof.

## 1. Apply

- Code symbol with LSP available: use LSP rename (it understands scope and
  shadowing better than grep).
- Everything else (flags, config keys, dirs, strings): enumerate hits first
  (`grep -rn`), edit each, `git mv` for files/dirs.

## 2. Prove

Scoped search for the old name, which must come back empty:

```bash
grep -rn "<old-name>" . \
  --exclude-dir={.git,node_modules,.build,dist,build,.next,target,vendor} \
  --exclude={*.lock,package-lock.json,pnpm-lock.yaml}
```

- Zero hits: proven.
- Remaining hits: each one is either fixed or explicitly justified in the
  report (historical changelog entries and migration docs are the usual
  legitimate survivors). "Probably fine" is not a justification.
- Case variants and word boundaries: check `-i` once, and plural/camel/snake
  variants of the name.

## 3. Gate

Run the project gate (pre-flight script, tests, build). Renames break
imports and serialized names in ways grep does not show.

## 4. Report

| Files changed | Old-name hits remaining | Justified | Gate |
|---|---|---|---|
| 14 | 2 | CHANGELOG.md x2 | green |
