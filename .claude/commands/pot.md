---
description: Run the Infinity Pot loop — start a project from a vague idea, or advance the active one by a turn
argument-hint: [vague idea | N | empty = one turn]
---
You are the ORCHESTRATOR. Follow the constitution in CLAUDE.md strictly: you launch subagents (Agent tool, subagent_type = agent name) and write state.json — subagents produce every artifact.

Input: "$ARGUMENTS"

## Dispatch

- **Empty input** → run one turn on the active project.
- **A number N** → run N turns back-to-back on the active project.
- **Anything else is a new product idea** → derive a short kebab-case slug, create `workspace/<slug>/` with the numbered subdirectories from CLAUDE.md, write `idea.md` containing the idea verbatim, write `state.json` as `{"project": "<slug>", "turn": 0, "status": "in-progress", "last_action": null, "next": "gap-analyst", "mode": "autonomous", "max_gate_iterations": 3}`, then run turn 1.

The **active project** is the one whose `workspace/*/state.json` has `"status": "in-progress"`; if several qualify, pick the most recently modified and say which you picked. If none exists, tell the user to start one with `/pot <idea>` and stop. If the active project is `"released"`, report that and do nothing — unless `idea.md` changed after the release, in which case flip status back to `"in-progress"` and run a turn.

## Running one turn (assess → refine → act → record)

Launch prompts are always thin: `Project: workspace/<slug>. Turn: N. Do your job per your agent definition.` (+ `Task: task-NNN` / `Bug: bug-NNN` when relevant.)

1. **Assess** — launch `gap-analyst`; take its `NEXT:` line as this turn's recommended action.
2. **Refine** — launch `requirement-refiner`, then `product-owner`. If requirements changed materially, gate with `requirements-critic` (relaunch refiner on CHANGES_REQUESTED, max `max_gate_iterations` cycles, then proceed with the override noted).
3. **Act** — launch the recommended agent(s). Apply verdict gates the same way (`design-critic` over design work, `code-reviewer` per task, QA verdicts). Launch independent agents in parallel in one message; developers sequentially.
4. **Record** — update `state.json` (turn+1, last_action, next = gap-analyst's likely follow-up). On every 5th turn (`turn % 5 == 0`), first launch `harness-miner` with the thin prompt `Do your job per your agent definition.` — it works cross-project, so no project path. Then launch `scribe` (it writes the log entry, appends the turn's per-agent outcome lines to `evolution/metrics.md`, and makes the turn's single commit). Reflection is not an orchestrator step — every worker self-reflects on its own definition at the end of its run, per the Worker protocol in CLAUDE.md.

To read outcomes, only look at agents' one-line final messages, `VERDICT:` first lines, and `turn-plan.md` — do not re-read whole artifacts into context.

End with a one-paragraph status for the user: what was learned, what was done, what's next. When running N turns, do this after each turn briefly and in full at the end.
