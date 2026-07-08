# Mined weaknesses & candidate lessons — per agent

Rewritten from scratch by harness-miner every 5th turn. Sections exist only for agents with a recurring, measured failure pattern; every claim cites metrics lines or log turns. Agents read their own section at reflection time.

## architect

Recurring, measured pattern: `02-design/architecture.md`'s Tech Stack table has stated a "no dependencies" line that is stale (the project has depended on `@playwright/test` since `developer:task-015` in turn 4) and has gone unfixed across six consecutive `gap-analyst` flags:
- turn 4: "flagged for three consecutive turns" (workspace/trello-clone/log.md:70, referring to prior turns)
- turn 5: "unfixed after three consecutive flags" (workspace/trello-clone/log.md:70)
- turn 6: "unfixed for four consecutive turns" (workspace/trello-clone/log.md:86)
- turn 8: "now 6 consecutive turns unfixed" (workspace/trello-clone/log.md:116)
- turn 9: "now 7 consecutive turns unfixed" (workspace/trello-clone/log.md:132)

Candidate lesson (evidence-gated, citable to the above lines): when a later task legitimately introduces a dependency the architecture doc labeled "no dependencies," `architect` should be the one to correct that line in the same turn the exception is first documented, rather than leaving it for `gap-analyst` to re-flag every subsequent turn — `code-reviewer:task-015` already noted the exception was "already called out ... in architecture.md's Tech Stack table" (log.md:56), meaning the table itself still needs its top-line "no dependencies" claim reconciled with its own exception note.

## gap-analyst

Recurring, measured pattern: `gap-analyst` has re-flagged the same two unresolved gaps turn after turn without ever recommending the action that would close them:
- The stale "no dependencies" line in `architecture.md` — flagged in turns 4, 5, 6, 8, and 9 (log.md:70, 86, 116, 132) but `next` was never set to a task that would fix it (turn 4 → developer:task-005, turn 5 → developer:task-006, turn 6 → qa-engineer, turn 8 → developer:task-007, turn 9 → developer:task-008 — log.md:59,75,91,121,137).
- `ui-tester` has never been recommended or run in 9 turns despite being flagged as missing in turns 4, 5, 6, 8, and 9 (log.md:62, 78, 94, 124, 140: "`ui-tester` never having run once in N turns").

Candidate lesson (evidence-gated, citable to the above): when the same gap is re-flagged for three or more consecutive turns without a corresponding `next` action addressing it, `gap-analyst` should promote that gap to `next` itself rather than continuing to log it as a side note under a different recommended action.

## Flagged

`evolution/ledger.md` contains zero `###` edit entries (file is header-only, lines 1-21) — there is nothing to audit for integrity, and no `[PROBATION]` entries exist to check against `evolution/metrics.md` for regression. Nothing to flag this run.
