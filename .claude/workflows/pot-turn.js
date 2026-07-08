export const meta = {
  name: 'pot-turn',
  description: 'Run Infinity Pot turns end-to-end (assess → refine → act → record), dispatching all 21 worker agents dynamically with verdict gates',
  whenToUse: 'Advance an Infinity Pot project by one or more turns. args: { project: "<slug>", turn: <next turn number>, turns: <N | "until-released">, maxGateIterations: 3, status: "<current status>" }. Returns the new state.json contents in `state` — the orchestrator writes that file itself.',
}

// ---- args & control state -------------------------------------------------
if (!args || !args.project) throw new Error('args.project (workspace slug) is required')

const slug = args.project
const MAX_GATES = args.maxGateIterations ?? 3
const HARD_CAP = 25 // runaway backstop per invocation
const requested = args.turns === 'until-released' ? Infinity : (args.turns ?? 1)

let turn = args.turn ?? 1
let status = args.status ?? 'in-progress'
let lastAction = args.lastAction ?? null

if (status === 'released') {
  return {
    project: slug,
    turnsRun: 0,
    note: 'project already released — nothing to do (edit idea.md to reopen)',
    state: { project: slug, turn: turn - 1, status, last_action: lastAction, next: null, mode: 'autonomous', max_gate_iterations: MAX_GATES },
  }
}

// ---- helpers ---------------------------------------------------------------
// Iron rule 2: launch prompts stay thin — the filesystem is the message bus.
const bounced = r => /CHANGES_REQUESTED/i.test(String(r ?? ''))

function run(name, opts = {}) {
  const extra = opts.extra ? `${opts.extra} ` : ''
  return agent(
    `Project: workspace/${slug}. Turn: ${turn}. ${extra}Do your job per your agent definition.`,
    { agentType: name, label: opts.target ? `${name}:${opts.target}` : name, phase: opts.phase }
  )
}

// Iron rule 3: verdict gate — relaunch the producer on CHANGES_REQUESTED,
// at most MAX_GATES review cycles, then proceed anyway (override noted).
async function gate(reviewer, relaunchProducer, opts = {}) {
  let cycles = 0
  while (true) {
    const verdict = String((await run(reviewer, opts)) ?? '').trim()
    cycles++
    if (!bounced(verdict)) return { reviewer, approved: true, cycles, verdict }
    if (cycles >= MAX_GATES) {
      log(`⚠ gate override: ${reviewer} still CHANGES_REQUESTED after ${cycles} cycles — proceeding per constitution`)
      return { reviewer, approved: false, override: true, cycles, verdict }
    }
    log(`${reviewer}: CHANGES_REQUESTED — relaunching producer (cycle ${cycles}/${MAX_GATES})`)
    await relaunchProducer()
  }
}

// architect → (api-designer ∥ data-modeler) → design-critic gate
async function designPipeline(phase, rebuildFirst) {
  const rebuild = async () => {
    await run('architect', { phase })
    await parallel([
      () => run('api-designer', { phase }),
      () => run('data-modeler', { phase }),
    ])
  }
  if (rebuildFirst) await rebuild()
  return gate('design-critic', rebuild, { phase })
}

// ---- act: dispatch gap-analyst's recommendation ----------------------------
async function act(action, phase) {
  const [name, target] = action.split(':')
  const extra = target ? (target.startsWith('task') ? `Task: ${target}.` : `Bug: ${target}.`) : ''

  switch (name) {
    case 'architect':
      return designPipeline(phase, true)

    case 'api-designer':
    case 'data-modeler': {
      await run(name, { phase })
      return gate('design-critic', () => run(name, { phase }), { phase })
    }

    case 'design-critic':
      return designPipeline(phase, false)

    case 'planner': {
      const p = String((await run('planner', { phase })) ?? '').trim()
      const e = String((await run('estimator', { phase })) ?? '').trim()
      return { info: `${p} | ${e}` }
    }

    case 'estimator':
      return { info: String((await run('estimator', { phase })) ?? '').trim() }

    case 'developer': {
      await run('developer', { extra, target, phase })
      return gate('code-reviewer', () => run('developer', { extra, target, phase }), { extra, target, phase })
    }

    case 'code-reviewer':
      return gate('code-reviewer', () => run('developer', { extra, target, phase }), { extra, target, phase })

    case 'test-writer': {
      await run('test-writer', { phase })
      const v = String((await run('qa-engineer', { phase })) ?? '').trim()
      return { info: v, bugsFiled: bounced(v) }
    }

    case 'qa-engineer':
    case 'ui-tester': {
      // These file bugs rather than bounce a producer; gap-analyst routes
      // bug-fixer:bug-NNN next turn, so the verdict is informational here.
      const v = String((await run(name, { phase })) ?? '').trim()
      return { info: v, bugsFiled: bounced(v) }
    }

    case 'bug-fixer': {
      const f = String((await run('bug-fixer', { extra, target, phase })) ?? '').trim()
      const v = String((await run('qa-engineer', { phase })) ?? '').trim()
      return { info: `${f} | qa: ${v}`, bugsFiled: bounced(v) }
    }

    case 'tech-writer':
    case 'security-reviewer': {
      // Ship docs and security review are independent — run in parallel.
      const [tw, sec] = await parallel([
        () => run('tech-writer', { phase }),
        () => run('security-reviewer', { phase }),
      ])
      return { info: `${String(tw ?? '').trim()} | ${String(sec ?? '').trim()}`, securityBounced: bounced(sec) }
    }

    case 'release-manager': {
      const v = String((await run('release-manager', { phase })) ?? '').trim()
      const go = /\bGO\b/i.test(v) && !/\bNO-?GO\b/i.test(v)
      if (go) status = 'released'
      return { info: v, go }
    }

    default: {
      // Unknown recommendation — trust the registry and run it thin.
      const v = String((await run(name, { extra, target, phase })) ?? '').trim()
      return { info: v }
    }
  }
}

// ---- the turn loop: assess → refine → act → record --------------------------
const summaries = []
let ran = 0

while (ran < requested && ran < HARD_CAP && status !== 'released') {
  if (budget.total && budget.remaining() < 50_000) {
    log(`token budget nearly spent (${Math.round(budget.remaining() / 1000)}k left) — stopping before turn ${turn}`)
    break
  }
  const P = s => `Turn ${turn} — ${s}`
  log(`— Turn ${turn} —`)

  // 1. Assess
  const assess = String((await run('gap-analyst', { phase: P('Assess') })) ?? '')
  const m = assess.match(/NEXT:\s*([a-z-]+(?::(?:task|bug)-[\w-]+)?)/i)
  if (!m) {
    if (/nothing to do|already released/i.test(assess)) { log('gap-analyst: nothing to do'); break }
    log(`could not parse a NEXT action from gap-analyst ("${assess}") — stopping`)
    break
  }
  const action = m[1].toLowerCase()
  log(`Turn ${turn}: recommended action = ${action}`)

  // 2. Refine (refiner → product-owner; critic gate only on material change)
  const refinerLine = String((await run('requirement-refiner', { phase: P('Refine') })) ?? '')
  await run('product-owner', { phase: P('Refine') })
  const material = ((refinerLine.match(/\d+/g) || []).map(Number)).some(n => n > 0)
  let refineGate = null
  if (material) {
    refineGate = await gate('requirements-critic',
      () => run('requirement-refiner', { phase: P('Refine') }),
      { phase: P('Refine') })
  }

  // 3. Act
  const result = await act(action, P('Act'))

  // 4. Record (harness-miner every 5th turn, then scribe commits the turn)
  if (turn % 5 === 0) {
    await agent('Do your job per your agent definition.',
      { agentType: 'harness-miner', label: 'harness-miner', phase: P('Record') })
  }
  const scribeLine = String((await run('scribe', { phase: P('Record') })) ?? '').trim()

  lastAction = action
  summaries.push({ turn, action, refineGated: !!refineGate, refineGate, result, scribe: scribeLine })
  log(`Turn ${turn} done: ${action} → ${result.info ?? (result.approved ? 'APPROVED' : result.override ? 'OVERRIDE' : '')} | ${scribeLine}`)
  ran++
  turn++
}

// The orchestrator (main session) writes `state` to workspace/<slug>/state.json —
// the workflow itself never touches the filesystem (iron rule 1).
return {
  project: slug,
  turnsRun: ran,
  turns: summaries,
  state: {
    project: slug,
    turn: turn - 1,
    status,
    last_action: lastAction,
    next: status === 'released' ? null : 'gap-analyst',
    mode: 'autonomous',
    max_gate_iterations: MAX_GATES,
  },
}
