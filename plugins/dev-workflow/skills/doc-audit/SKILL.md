---
name: doc-audit
description: Audit a docs or spec folder with four parallel reviewer lenses and produce one ranked report. Use when the user asks to audit docs or specs, check a spec set for contradictions, assess build readiness of documentation, or review docs before implementation starts.
---

# doc-audit

Four auditors, one report. Replaces retyping the same review prompts.

## 1. Scope

Default target: the project's specs/docs folder (`specs/`, `docs/`, or the
folder the user names). List the files in scope first; confirm only if the
selection is ambiguous or huge (> ~40 files).

## 2. Fan out: four fixed lenses

Spawn four agents in parallel, one per lens, all read-only, each told:
"You have push-back license: challenge decisions in the docs themselves,
not just their wording. Every finding cites file and line or section."

1. **Contradictions & incomplete items**: statements that conflict across
   files, TODO/TBD stubs presented as decided, references to things that do
   not exist.
2. **Build readiness**: could a fresh engineer (or agent) implement from
   these docs alone? Missing acceptance criteria, undefined terms, absent
   error paths, unstated environment assumptions.
3. **Redundancy & cleanup**: duplicated content, superseded sections, dead
   links, files that should merge or die.
4. **Clarity & vision**: does the whole read as one coherent intent? Buried
   decisions, missing rationale, scope creep relative to the stated goal.

Each agent returns: findings list (severity: blocker / major / minor,
anchor, one-sentence issue, suggested action).

## 3. Consolidate

Merge the four lists yourself:

- Deduplicate findings that multiple lenses hit (keep the highest severity,
  note the lens agreement; multi-lens findings rank up).
- Order: blockers, majors, minors.
- Output one table: `# | severity | file:anchor | finding | suggested action`,
  followed by a short narrative of the 3 most important problems.

## 4. Stop

The audit is the deliverable. Do not start fixing findings; offer to, and
let the user pick which ones.
