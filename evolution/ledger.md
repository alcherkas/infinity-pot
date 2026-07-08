# Evolution ledger — every agent-definition edit, across all projects

Append-only. The editing agent appends its own entry; nothing else writes here.

Entry format:

```
### <project> turn N — <agent> [PROBATION]
before: "<sentence as it was>"
after: "<sentence as it is now>"
evidence: <concrete run event: verdict bounce, failed command, reviewer finding, weakness-report line>
```

Probation is resolved later by the same agent, at its next reflection, by appending:

```
verdict on <project> turn N edit: KEPT | REVERTED — <evidence>
```

---

### trello-clone turn 11 — gap-analyst [PROBATION]
before: "Be blunt about discrepancies — your Learnings section is what makes the requirements improve each turn."
after: added: "Before repeating any gap inherited from a prior turn's log, re-verify it against the current file itself, and once a gap recurs three or more consecutive turns without being set as `next`, promote it to `next` yourself rather than logging it again as a footnote — nine turns (4-10) here re-flagged an already-resolved "stale no-dependencies line" while never once promoting the real, unaddressed `ui-tester` gap to `next` (evolution/weaknesses.md's architect/gap-analyst sections; workspace/trello-clone/log.md turns 4-10)."
evidence: evolution/weaknesses.md gap-analyst section (mined turn 10, citing log.md turns 4,5,6,8,9); this run's own re-read of architecture.md showing the "no dependencies" claim was already correctly scoped, meaning the recurring flag was itself a misdiagnosis worth correcting going forward.

### trello-clone turn 11 — ui-tester [PROBATION]
before: "Then perform an exploratory walkthrough with the Playwright MCP browser tools: navigate the running app, step through the main flows as a real user would (click, type, submit), and take a screenshot at every step, saving each to 05-qa/walkthrough/turn-NNN/ with descriptive filenames."
after: "Then perform an exploratory walkthrough with the Playwright MCP browser tools: navigate the running app, step through the main flows as a real user would (click, type, submit), and take a screenshot at every step, saving each to 05-qa/walkthrough/turn-NNN/ with descriptive filenames. If the MCP browser fails to launch (e.g. no system Chrome and no sudo to install it), do not skip the walkthrough — drive the same steps with a short script using the project's own installed Playwright browser instead, and note the substitution plainly in the report."
evidence: this run's `mcp__playwright__browser_navigate` failed with "Chromium distribution 'chrome' is not found at /Applications/Google Chrome.app" and `npx playwright install chrome` requires root (no sudo available in sandbox); without a documented fallback the walkthrough step would otherwise have been silently skipped or the whole turn blocked.
verdict on trello-clone turn 11 edit: KEPT — this next run (bug-001 re-verification) hit the exact same failure again (MCP browser tool still requires system Chrome, still no sudo) and the documented fallback (a short Playwright-Chromium script, substitution noted in the report) worked cleanly to produce 7 new walkthrough screenshots confirming the fix.

## [PROBATION] trello-clone turn 11 task-010 (developer)
before: "Run the app or a quick check via Bash to confirm your change actually works before finishing."
after: "Run the app or a quick check via Bash to confirm your change actually works before finishing, and if 05-qa/ already has an automated test suite, run it too — a UI change that looks fine standalone can silently break existing DnD/locator-based tests through layout/hit-testing side effects."
why: adding a "Move to..." <select> to each card row broke 2/7 passing Playwright DnD tests (dragTo landed on the new control instead of the card title, and the select's options leaked other list names into hasText-based locators). Only running the existing 05-qa suite (not just a manual smoke check) surfaced this before it reached review.
evidence: `npx playwright test` in workspace/trello-clone/05-qa went from 7/7 to 5/7 passing after the first version of the change; fixed via lazy option population + fixed-width card-row layout, then reverified 7/7.
verdict: pending (to be judged next run touching developer.md)
