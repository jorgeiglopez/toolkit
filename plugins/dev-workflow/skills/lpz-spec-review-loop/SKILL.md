---
name: lpz-spec-review-loop
description: "Adversarial, source-verified review of a spec or plan, run as a versioned loop with inline reply blocks until the user calls it. Use before writing requirements, after a design drifts from its documents, or when a stakeholder's answers must be checked against reality rather than accepted."
---

# Spec Review Loop

## Announce first

> Using the `lpz-spec-review-loop` skill: round N review of <subject>.

## Iron law

READ THE SOURCE BEFORE YOU WRITE THE FINDING.

Every claim is quoted from code, vendor docs, or a signed document, or is labelled inference. A question the repo could have answered is a round trip you wasted and credibility you spent.

## The loop

```
v1  review           -> findings, one fenced reply block each
    user replies inline in that file
v2  assess replies   -> closed | verified | blocking | confirmations | open
v3  assess replies   -> fewer blockers, plus whatever the answers broke
vN  sweep            -> systematic checklist, not a reaction to answers
    user calls it    -> write the requirements
```

One file per round. Never edit a file the user has replied in. Read the file for the replies; the transcript may be compacted.

## Prompts

**Kickoff**
> Review the flow end to end. Find the flaws, the contradictions, and the decisions we still owe. Check the repo and the code before you write anything down. Write it up as a logbook entry with a reply block per topic so I can answer inline. Don't change any code or formal documents yet.

**Each round** (reuse verbatim)
> I replied in the `<reply></reply>` blocks. Carefully assess what I'm proposing. Make sure every open question is addressed. Assess whether we can proceed with the requirements. Are there outstanding decisions? Confusing or conflicting information? Explore the repo and the code paths for your answers first. If you cannot find the bubbles, then up to me.

**Final round**
> Highlight only if there's a blocker. Search thoroughly and methodically. Early detection of misalignments saves time now.

## Rules

1. **Quantify the pushback.** Use the user's own numbers and show the arithmetic. "2.5 TB through the boot volume this season" ends an argument. "This may fill up" starts one.
2. **Check the answers against each other.** The expensive defects are two individually reasonable answers colliding on one object.
3. **Closed is not immune.** A new answer can void an item you closed two rounds ago. Re-read section 01 against every reply. In the reference run this produced the three worst findings.
4. **Re-verify every round.** The answers change what a code fact costs. Run the checks again, and say which check the answer forced.
5. **Correct yourself in the open**, under its own heading. It buys credibility for the hard findings.
6. **Push back once.** With numbers. If the user reaffirms, record it as an accepted risk and move on.
7. **Verify library claims against vendor docs**, not memory (Context7). The repo is not the only source.
8. **Answer the questions in the replies.** Users answer with questions. Open the next round by answering them.
9. **Freeze the artifacts.** No code, no formal documents, until the user terminates. Exception: one non-formal file the user names explicitly.
10. **Short message, heavy document.** Lead with the verdict. Name the one finding to read first.

## IDs

Type prefix, assigned once, never reused, never renamed. Sections carry the round. IDs do not.

| Prefix | Means | Wants |
|---|---|---|
| `BLOCK-n` | Cannot write the requirement without it | A decision |
| `FLAW-n` | Design contradicts itself or the code | A ruling |
| `BUG-n` | Shipped code does the wrong thing | Confirm the fix |
| `D-n` | Named decision with a recommendation attached | Yes or no |
| `CONF-n` | You are challenging or correcting the user | Confirm |
| `SIZE-n` | A number that gates a requirement, not an estimate | A figure |
| `REC-n` | Non-blocking recommendation | Accept or reject |
| `CARRY` | Deferred, with the cost of deferring named | Acknowledge |

Reopened, suffix it: `BUG-1a`, `D2a`, `BUG-1b`. Never mint a per-round prefix (`R1`, `X1`); it hides which items are new versus reopened.

## File

Name: `YYYY-MM-DD - <Subject> vN - <what this round is about>.md`

Title sections 03 onward by **consequence**, not category: *The one that will bite you*, *Will corrupt data*, *Will fail acceptance*, *Cheap, do them now*.

````markdown
# 00 - How to use this doc

Round N. <What the last round closed. What it opened.>
Everything below was checked against the source first.
Reply inside the `<reply>` blocks. Leave the tags in place.

## Verdict

**<Can we proceed. Bold. First line.>**

| Can write today | Still blocked |
|---|---|

<N> answers finish it: **<ID>**, **<ID>**.

## Index

| ID | Topic | Type | Status |
|---|---|---|---|
| [[#D2a]] | <the defect, not the area> | Blocking | Read this first |

---

# 01 - Closed by your replies
One sentence each, restated in the user's favour. No reply block.

# 02 - Verified against the source
| Claim | Reality |
|---|---|
| <what everyone assumed> | <what the symbol actually says> |

# 03 - The one that will bite you
Two rules, quoted. Where they collide. A concrete trace: this input, that wrong
output, nothing said. Then the fix, and why it costs nothing.

# 04 - <Consequence heading>
Evidence. Then a recommendation stated as one, with the alternative named and priced.

# 05 - Scope delta            (when a decision adds or removes code)
**Removed** / **Added**, by symbol name. Say whether the system ends smaller.

# 06 - Answering your question (when a reply contained one)

# 07 - Carried forward
- **<Item>.** Cheap now: <cost>. Expensive later: <cost>. This is the one I'd pull forward.
````

Reply blocks are fenced because Obsidian eats a bare tag:

````
```
<reply to="D2a">

</reply>
```
````

## The final round is a sweep

Not a reaction to the answers. A checklist, run once, before you declare it done:

- Every module in the source-of-truth doc has an owner and a screen.
- Every entity has an ID, an owner, and exactly one writer.
- Every seeded role has a screen. Every screen has a role.
- Every acceptance criterion in the signed document still holds.
- Every NFR still describes the system that now exists.
- Every external contract still matches: on-disk layout, API, auth middleware.

After a round that claimed two answers remained, this found eleven, two of which lost data.

## Termination

**The user calls it.** An empty blocking section is not termination. A reply of *"we'll revisit later, we're unblocked"* is **open**, not closed: carry it as an accepted risk with its cost named.

Then, and only then:

1. Write the requirements from the closed items. They will be read by agents with no context, so state what is, not how it was decided.
2. Banner what the review invalidated: `> [!warning] SUPERSEDED`.
3. Archive after the rewrite, never during.
4. The review docs stay in the logbook. They are the decision record.

## Anti-patterns

- **Wholesale archiving mid-loop.** A superseded document is the only written record of why. Banner it.
- **A per-round ID prefix.** Suffix instead.
- **Findings the source could have answered.**
- **A chat message longer than a screen.** The user tracks decisions in the file.
- **Closing every topic on the first pass.** You did not read the code.
