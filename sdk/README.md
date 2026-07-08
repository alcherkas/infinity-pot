# Infinity Pot — Anthropic SDK edition

The same 20-agent orchestrator/worker loop as the root markdown system
([`../CLAUDE.md`](../CLAUDE.md)), rebuilt as runnable TypeScript on the **Anthropic SDK**, where
agents exchange data through **structured output** instead of the filesystem.

## The mapping

| Markdown system | This SDK version |
|---|---|
| `.claude/agents/*.md` (20 workers) | `src/agents.ts` — 20 `AgentDef`s (name, model, system, Zod schema) |
| Orchestrator = main Claude Code session | `src/orchestrator.ts` — `runTurn()` |
| `/pot` command | `src/cli.ts` (`npm run pot`) |
| **Filesystem = message bus** | **Structured output = message bus** — each agent returns a validated object; the orchestrator wires it into the next agent |
| `workspace/<slug>/*.md` artifacts | in-memory `ProjectContext` (`src/context.ts`), snapshotted to `runs/<slug>/turn-NNN.json` |
| `state.json` | `runs/<slug>/state.json` |
| verdict gates (max 3 cycles) | `src/gate.ts` — `runGate()` |
| `api-designer ∥ data-modeler`, `tech-writer ∥ security-reviewer` | `Promise.all` in the orchestrator |

Every agent runs through `src/runner.ts` (`@anthropic-ai/sdk`, model `claude-opus-4-8`, adaptive
thinking). It uses the SDK's structured-outputs path: `client.messages.parse()` with
`output_config.format = zodOutputFormat(schema)`, which constrains the reply to the agent's Zod
schema and returns a validated `parsed_output`. That validated object **is** the hand-off — the
whole point of "structured output to exchange data between agents".

## The turn loop (`assess → refine → act → record`)

1. **assess** — `gap-analyst` reads the whole `ProjectContext` and returns a `TurnPlan` with a
   `next` action.
2. **refine** — `requirement-refiner` → `product-owner`; gated by `requirements-critic` when
   requirements materially changed.
3. **act** — dispatch on `turnPlan.next`: the design shelf (`architect`, then `api-designer ∥
   data-modeler`) gated by `design-critic`; `planner`/`estimator`; per-task `developer` gated by
   `code-reviewer`; `test-writer`; `qa-engineer`/`ui-tester` (report gates that file bugs);
   `bug-fixer`; `tech-writer ∥ security-reviewer`; `release-manager`.
4. **record** — `scribe` writes the turn's structured log entry (`Done` / `Walkthrough` /
   commit summary) into `ctx.log`; then persist developer/test file outputs to `runs/<slug>/build/`
   and write the turn snapshot. `release-manager` GO sets `status: "released"`.

All 20 agents from the markdown roster are present: the 19 producers/gates above plus `scribe`.

## Run it

```bash
cd sdk
npm install

# Store your key once in the macOS Keychain (this never touches shell history;
# `-w` with no value prompts you to paste it). The app loads it automatically.
security add-generic-password -a "$USER" -s anthropic-api-key -w
#   update later:  security add-generic-password -U -a "$USER" -s anthropic-api-key -w
#   remove:        security delete-generic-password -a "$USER" -s anthropic-api-key
# CI / one-off override: set ANTHROPIC_API_KEY and it wins over the Keychain.

npm run pot -- "a tool that reminds me to water my houseplants"     # seed + 1 turn
npm run pot -- "a tool that reminds me to water my houseplants" 5   # seed + 5 turns
npm run pot          # one more turn on the active project (runs until released)
npm run pot -- 3     # three turns back-to-back on the active project
npm run typecheck    # tsc --noEmit
```

Inspect `runs/<slug>/turn-001.json` for every agent's typed output that turn, `runs/<slug>/state.json`
for control state, and `runs/<slug>/build/` for the code the `developer` agent emitted.

## Intentional deviations from the markdown system

- **No filesystem message bus.** Data flows as validated typed objects; the confirmed design.
- **Self-reflection is dropped.** In the markdown system each worker also rewrites its own `.md` at
  the end of a run. Agent definitions here are code constants, so decentralized self-improvement
  doesn't map cleanly; that half is omitted (a future `reflections` log could reintroduce it). The
  `scribe` agent and per-turn journaling are kept.
- **Structured output, not raw text.** The markdown workers write free-form Markdown files. Here the
  same contracts are expressed as Zod schemas and enforced via the SDK's structured-outputs path
  (`messages.parse()` + `zodOutputFormat`), so every hand-off is a validated typed object.
- **Test/UI execution is reasoned, not executed.** This is a pure Messages-API design with no tools:
  `developer` emits file contents as structured output (persisted to `build/` for inspection), and
  `qa-engineer` / `ui-tester` reason about the built code to produce structured reports and file
  bugs, rather than running a real suite or Playwright. Real execution would be a natural extension —
  shell out to build/test the persisted `build/` files and feed the results back into the report.
- **One commit per turn / scribe / reflections.md** are orchestration-log concerns from the
  markdown constitution; here the per-turn JSON snapshot plays the journal role.
