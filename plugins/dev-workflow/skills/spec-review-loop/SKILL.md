---
name: spec-review-loop
description: "Adversarial, source-verified review of a spec or plan, run as a versioned loop with inline reply blocks until the user calls it. Use before writing requirements, after a design drifts from its documents, or when a stakeholder's answers must be checked against reality rather than accepted."
---

# Spec Review Loop

## Announce first

> Using the `spec-review-loop` skill: round N review of <subject>.

## Iron law

READ THE SOURCE BEFORE YOU WRITE THE FINDING.

Quote code, vendor docs (Context7), or the signed document. Label everything else inference. A finding the repo could have answered is a wasted round trip and spent credibility.

## The loop

```
v1       review    one finding per fenced reply block
         ↓         user replies inline, in the file
v2…vN-1  assess    what closed · what the answers broke · what they voided
vN       sweep     a checklist, not a reaction to the last reply
         ↓         user calls it
         write     requirements, from the closed items only
```

One file per round. **Never edit a file the user has replied in.** Read the replies from the file, not the transcript: it may be compacted.

**Prompts the user reuses.** Kick off: *review end to end, check the source first, one reply block per topic, change nothing.* Each round: *I replied inline. Assess it. Outstanding decisions? Conflicting information? Check the code before you answer.* Final: *highlight only blockers. Be thorough and methodic.*

## Rules

1. **Quantify the pushback.** Use the user's own numbers, show the arithmetic. "2.5 TB through the boot volume this season" ends an argument. "This may fill up" starts one.
2. **Collide the answers.** The expensive defects are two individually reasonable answers meeting on one object.
3. **Closed is not immune.** A later answer voids an earlier close. Re-read section 01 against every reply. This is where the worst findings live.
4. **Re-verify every round.** Answers change what a code fact costs. Name the check the answer forced.
5. **Correct yourself in the open**, under its own heading. It buys credibility for the hard findings.
6. **Push back once**, with arithmetic. Reaffirmed? Record an accepted risk and move on.
7. **Answer their questions.** Users reply with questions. Open the next round by answering them.
8. **Freeze the artifacts.** No code, no formal documents, until the user terminates. One exception: a non-formal file they name.
9. **Short message, heavy document.** Lead with the verdict. Name the one finding to read first.

## IDs

Type prefix. Assigned once, never reused, never renamed. Sections carry the round; IDs do not.

| Prefix | Means | Wants |
|---|---|---|
| `BLOCK-n` | Cannot write the requirement without it | A decision |
| `FLAW-n` | Design contradicts itself or the code | A ruling |
| `BUG-n` | Shipped code does the wrong thing | Confirm the fix |
| `D-n` | Named decision, recommendation attached | Yes or no |
| `CONF-n` | You are challenging or correcting the user | Confirm |
| `SIZE-n` | A number that gates a requirement | A figure |
| `REC-n` | Non-blocking recommendation | Accept or reject |
| `CARRY` | Deferred, with the cost of deferring named | Acknowledge |

Reopened, suffix it: `BUG-1a`, `D2a`, `BUG-1b`. **Never mint a per-round prefix** (`R1`, `X1`): it hides new from reopened.

## The file

`YYYY-MM-DD - <Subject> vN - <what this round is about>.md`

Title sections 03 onward by **consequence**: *The one that will bite you* · *Will corrupt data* · *Will fail acceptance* · *Cheap, do them now*.

````markdown
# 00 - How to use this doc
Round N. What the last round closed. What it opened.
Everything below was checked against the source first.
Reply inside the `<reply>` blocks. Leave the tags in place.

## Verdict
**Can we proceed. Bold. First line.**

| Can write today | Still blocked |
|---|---|

<N> answers finish it: **<ID>**, **<ID>**.

## Index
| ID | Topic | Type | Status |
|---|---|---|---|
| [[#D2a]] | the defect, not the area | Blocking | Read this first |

# 01 - Closed by your replies     one sentence each, restated in the user's favour, no reply block
# 02 - Verified against the source   | Claim (what everyone assumed) | Reality (what the symbol says) |
# 03 - The one that will bite you    two rules quoted, where they collide, a concrete trace, then the fix
# 04 - <Consequence>                 evidence, then one recommendation, the alternative named and priced
# 05 - Scope delta                   **Removed** / **Added**, by symbol. Does the system end smaller?
# 06 - Answering your question       when a reply contained one
# 07 - Carried forward               cheap now: <cost>. Expensive later: <cost>.
````

Fence every reply block. Obsidian eats a bare tag.

````
```
<reply to="D2a">

</reply>
```
````

## The final round is a sweep

A checklist, run once, before you declare it done. Not a reaction to the replies.

- Every module in the source-of-truth doc has an owner and a screen.
- Every entity has an ID, an owner, and exactly one writer.
- **Every guarantee a deleted subsystem provided has a new home.** Deleting a thing deletes its invariants silently.
- Every seeded role has a screen. Every screen has a role.
- Every acceptance criterion in the signed document still holds.
- Every NFR still describes the system that now exists.
- Every external contract still matches: on-disk layout, API, auth middleware.

After a round that claimed two answers remained, this found eleven. Two lost data.

## Termination

**The user calls it.** An empty blocking section is not termination. *"We'll revisit later, we're unblocked"* is **open**: carry it as an accepted risk with its cost named.

Then, and only then:

1. **Write** the requirements from the closed items. Agents read them cold: state what is, never how it was decided.
2. **Banner** what the review invalidated: `> [!warning] SUPERSEDED`.
3. **Archive** after the rewrite, never during. A superseded document is the only written record of why.
4. **Keep** the review docs in the logbook. They are the decision record.

## Failure modes

- **Closing every topic on the first pass.** You did not read the code.
- **Findings the source could have answered.**
- **A chat message longer than a screen.** The user tracks decisions in the file.
- **Archiving mid-loop.**
- **A per-round ID prefix.**
