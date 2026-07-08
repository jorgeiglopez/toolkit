# Review patterns (shipped defaults)

The staff-engineer-reviewer's standard. Grow this file: when a review
decision generalizes, it becomes an entry. Personal additions belong in
`~/.claude/review-patterns.md`; project-specific ones in the project's
`.claude/review-patterns.md`.

Entry format: `ID. name: the rule, one or two sentences, testable.`

## General

1. minimal-solution: prefer the laziest working solution; no abstractions for
   edge cases that do not exist yet. Flag speculative generality.
2. runtime-verification: code that changes user-visible behavior needs
   evidence it was exercised (test output, manual verification note), not
   just review approval. "Should work" is a finding.
3. root-cause: a fix without a stated cause is a symptom patch. Ask for the
   mechanism.
4. delete-first: dead code, commented-out blocks, and unused flags are
   removed, not kept "just in case". Git remembers.
5. error-paths: every new I/O or network call states what happens on failure.
   Silent catch blocks are findings.

## TypeScript / React / Next.js

6. no-effect-for-derived-state: values computable from props/state during
   render never live in useEffect + setState. Compute them inline or memoize.
7. server-first: in App Router code, client components need a reason
   ("use client" is a cost, not a default).
8. strict-types: no `any` without an inline justification; narrow at the
   boundary, not at the call site.

## Shell / hooks / automation

9. degrade-gracefully: hooks and scripts exit 0 when their preconditions are
   missing (no jq, no config); they never break the host flow by accident.
10. exit-2-contract: a blocking hook signals via exit code 2 + stderr reason;
    stdout JSON decisions are not trusted.
11. destructive-solo: destructive commands (rm, force-push, reset --hard)
    never share a command line with informational ones.

## Git / process

12. explicit-staging: bulk staging (add -A/-u) is a finding wherever it
    appears, including scripts and docs.
13. zero-orphans: work that creates worktrees, branches, temp resources, or
    background agents also removes them; cleanup is part of the change.
