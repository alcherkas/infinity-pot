# Turn Plan — trello-clone (Turn 1)

## State
- `idea.md` contains only: "analog of trello boards" — a one-line, unelaborated prompt.
- No requirements, design, plan, code, tests, or docs exist yet. `01-understand/` through `06-ship/` directories have not been created.
- `state.json` shows turn 0, no last_action, next = gap-analyst (i.e., this run).
- `log.md` and `reflections.md` are empty (no prior turns).
- Verdict: nothing built yet — project is at the very start.

## Learnings
- No built reality exists yet, so there is nothing to contradict or refine. The one learning at this stage is about the idea itself: "analog of trello boards" is extremely underspecified — it doesn't say single-user vs multi-user, real-time collaboration, auth, persistence, drag-and-drop expectations, or platform (web/mobile/CLI). This ambiguity should be resolved explicitly in `01-understand/` rather than assumed silently, since a Trello clone can range from a static single-board list app to a full multi-tenant real-time collaboration tool.

## Gaps
1. (Highest priority) No requirements captured — need `01-understand/requirements.md`, `open-questions.md`, `assumptions.md` to pin down scope: boards/lists/cards CRUD, drag-and-drop reordering, single vs multi-user, auth, persistence layer, real-time sync, and target platform (web app assumed unless stated otherwise).
2. No architecture, API, or data model — depends on requirements above.
3. No plan/backlog/tasks.
4. No code, tests, QA, docs, or release artifacts.

## Next
**Recommended action: architect** — wait, requirements must come first. Since this is turn 1 and no requirements exist at all, the most valuable action is to establish requirements before any design work. Per the turn loop, gap-analyst's job is assessment; the orchestrator's step 2 (Refine) will launch `requirement-refiner` then `product-owner` next regardless. However, since there is no existing requirements draft to "refine," the actual first producing step needed is drafting initial requirements.

Given the palette provided does not include a dedicated "requirements-writer" role, and the turn loop specifies requirement-refiner/product-owner run every turn as step 2, the single most valuable action for the orchestrator to launch this turn (after this assessment) is:

**requirement-refiner** (to produce the first draft of `01-understand/requirements.md`, `open-questions.md`, and `assumptions.md` from the bare idea, since none exist), followed by `product-owner` to answer open questions and log assumptions per the standard turn loop.

Rationale: With zero artifacts in place, nothing else (architecture, planning, coding) can proceed meaningfully. The idea is too vague to design against without first capturing scope decisions (feature set, user model, platform) as explicit requirements/assumptions.
