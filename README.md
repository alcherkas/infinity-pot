# ♾️ Infinity Pot

An example of the **orchestrator/worker pattern** in Claude Code, built entirely from markdown — no harness code. You type one vague product idea; a fleet of 21 tiny subagents iterates it into a working, tested, documented product, one turn at a time.

## The pattern

- **Orchestrator = control plane.** The main Claude Code session never produces anything. It launches subagents, reads their one-line results and `VERDICT:` lines, and maintains `state.json`. That's it. (Rules in [CLAUDE.md](CLAUDE.md).)
- **Workers = subagents.** Each agent in [`.claude/agents/`](.claude/agents/) is ≤10 sentences: role, input files, output files, done-signal. Launched via the Agent tool with a thin prompt (`Project: workspace/<slug>. Turn: N.`).
- **Filesystem = message bus.** Agents never talk to each other; they read and write files under `workspace/<slug>/`.
- **Turns = convergence loop.** Every turn: **assess** (what's built vs. what's required) → **refine** (requirements improve from what building revealed) → **act** (the next most valuable work) → **record** (log + one git commit per turn). Requirements are never frozen — reality feeds back into them each turn.
- **Agents improve themselves — with evidence and validation.** At the end of every run, each worker self-reflects: it may rewrite a sentence of its own definition (kept ≤10 sentences) only by citing a concrete event from the run (a gate bounce, a failed command, a reviewer finding). Every edit lands in `evolution/ledger.md` on **probation**; on its next run the agent judges the edit against real outcomes and keeps or reverts it. `scribe` logs a per-agent outcome line each turn to `evolution/metrics.md`, and every 5th turn `harness-miner` mines those outcomes across all projects into `evolution/weaknesses.md` — per-agent measured weaknesses and merged candidate lessons that feed the next reflections. (Mechanisms borrowed from Self-Harness, AlphaEvolve, GEPA, and Chain-of-Evidence.)

## Quickstart

```
/pot a tool that reminds me to water my houseplants
```

That seeds `workspace/houseplant-tracker/` and runs turn 1 (requirements refined, open questions answered autonomously, every assumption logged). Then keep stirring:

```
/pot 1      # one more turn
/pot 5      # five turns back-to-back
/pot        # unlimited turns — run until the project is released
```

Each turn ends with one git commit (`turn NNN: …`), so `git log --oneline` is the project's history and `workspace/<slug>/log.md` is its illustrated journal — including Playwright walkthrough screenshots of the UI and the agent-definition improvements made that turn.

## The roster (21 agents)

| Loop role | Agents |
|-----------|--------|
| Assess | `gap-analyst` |
| Refine | `requirement-refiner`, `product-owner` |
| Design | `architect`, `api-designer`, `data-modeler` |
| Plan | `planner`, `estimator` |
| Build | `developer`, `test-writer` |
| Verify (gates) | `requirements-critic`, `design-critic`, `code-reviewer`, `qa-engineer`, `ui-tester`, `security-reviewer`, `release-manager` |
| Fix | `bug-fixer` |
| Ship | `tech-writer` |
| Record | `scribe` |
| Learn | `harness-miner` (every 5th turn) |

Gate agents write reports whose first line is `VERDICT: APPROVED` or `VERDICT: CHANGES_REQUESTED`; the orchestrator relaunches the producer until approved (max 3 cycles per turn, then it proceeds and logs the override — the loop never stalls).

`ui-tester` uses the **Playwright MCP** browser (configured in [.mcp.json](.mcp.json)) to click through the app like a user and screenshot every step, in addition to running scripted Playwright e2e tests.

## Workspace anatomy

```
workspace/<slug>/
├── state.json      # control state (the only file the orchestrator writes)
├── idea.md         # your prompt, verbatim
├── turn-plan.md    # this turn's assessment: state, learnings, gaps, next
├── reflections.md  # append-only: agents' self-improvement notes
├── log.md          # illustrated turn journal: Done / Walkthrough / Agent improvements
├── 01-understand/  # requirements, open questions, assumptions, review
├── 02-design/      # architecture, api, data model, review
├── 03-plan/        # backlog, tasks
├── 04-build/       # src/ (the product), code reviews
├── 05-qa/          # test reports, walkthrough screenshots, bugs
└── 06-ship/        # user docs, security review, release notes
```

Self-improvement state is repo-level (agent definitions span projects):

```
evolution/
├── ledger.md      # append-only: every definition edit — before/after, evidence, PROBATION → KEPT/REVERTED
├── metrics.md     # append-only: one outcome line per agent-run (scribe, every turn)
└── weaknesses.md  # rewritten by harness-miner every 5th turn: measured weaknesses + candidate lessons
```

## Adding an agent

Copy any definition in `.claude/agents/`, keep it ≤10 sentences (role, inputs, outputs, final-line signal, self-reflection close), and add it to the action palette sentence in `gap-analyst.md` so the assessor can recommend it. Restart the session so the new agent type registers.
