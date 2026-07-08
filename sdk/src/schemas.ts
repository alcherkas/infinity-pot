import { z } from "zod/v4";

/**
 * Zod schemas for every agent's structured output. These schemas ARE the message
 * bus: an agent returns a validated object of one of these shapes, and the
 * orchestrator feeds it (as JSON) into the next agent. Structured-outputs on the
 * Messages API don't support numeric/length constraints or recursion, so schemas
 * stay flat and constraint-free (descriptions carry the intent instead).
 */

export const moscow = z.enum(["MUST", "SHOULD", "COULD", "WONT"]);
export const verdict = z.enum(["APPROVED", "CHANGES_REQUESTED"]);

export const findingSchema = z.object({
  id: z.number().describe("1-based finding number"),
  location: z.string().describe("file/component/contract this finding is about"),
  issue: z.string().describe("what is wrong or missing"),
  fix: z.string().describe("exactly what to change (required on CHANGES_REQUESTED)"),
});
export type Finding = z.infer<typeof findingSchema>;

/** Shared shape for every reviewer/gate agent. */
export const reviewSchema = z.object({
  verdict,
  summary: z.string().describe("one-line rationale for the verdict"),
  findings: z.array(findingSchema),
});
export type Review = z.infer<typeof reviewSchema>;

// --- Assess -----------------------------------------------------------------

export const turnPlanSchema = z.object({
  state: z.string().describe("what exists and its verdicts"),
  learnings: z.string().describe("where built reality refines/contradicts requirements"),
  gaps: z.array(z.string()).describe("what is missing or broken, most valuable first"),
  next: z
    .string()
    .describe(
      "single recommended next action, one of the action-palette names, e.g. architect | api-designer | data-modeler | design-critic | planner | estimator | developer:task-001 | code-reviewer:task-001 | test-writer | qa-engineer | ui-tester | bug-fixer:bug-001 | tech-writer | security-reviewer | release-manager",
    ),
});
export type TurnPlan = z.infer<typeof turnPlanSchema>;

// --- Refine -----------------------------------------------------------------

export const requirementSchema = z.object({
  id: z.string().describe("stable id, e.g. FR-1"),
  text: z.string(),
  priority: moscow,
});

export const openQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  suggestedDefault: z.string(),
  answered: z.boolean(),
  answer: z.string().describe("the product-owner's decision, empty until answered"),
});

export const requirementsSchema = z.object({
  goal: z.string(),
  users: z.array(z.string()),
  userJourneys: z.array(z.string()),
  functionalRequirements: z.array(requirementSchema),
  nonFunctionalRequirements: z.array(z.string()),
  outOfScope: z.array(z.string()),
  openQuestions: z.array(openQuestionSchema),
  changeNote: z.string().describe("what changed since last turn, or 'no change'"),
});
export type Requirements = z.infer<typeof requirementsSchema>;

export const productOwnerSchema = z.object({
  openQuestions: z.array(openQuestionSchema).describe("every question now answered"),
  assumptions: z.array(z.string()).describe("append-only audit trail of decisions"),
  requirementsChanged: z.boolean(),
});
export type ProductOwnerOutput = z.infer<typeof productOwnerSchema>;

// --- Design -----------------------------------------------------------------

export const architectureSchema = z.object({
  overview: z.string(),
  mermaid: z.string().describe("component diagram in mermaid syntax"),
  stack: z.array(z.object({ tech: z.string(), why: z.string() })),
  dataFlow: z.string(),
  startCommand: z.string().describe("how the app is started locally"),
  requirementMapping: z.array(
    z.object({ requirementId: z.string(), component: z.string() }),
  ),
});
export type Architecture = z.infer<typeof architectureSchema>;

export const apiSchema = z.object({
  contracts: z.array(
    z.object({
      name: z.string(),
      inputs: z.string(),
      outputs: z.string(),
      errors: z.string(),
      example: z.string(),
      servesRequirement: z.string(),
    }),
  ),
});
export type ApiDesign = z.infer<typeof apiSchema>;

export const dataModelSchema = z.object({
  storage: z.string().describe("JSON file | localStorage | SQLite | ..."),
  entities: z.array(
    z.object({
      name: z.string(),
      fields: z.array(
        z.object({ name: z.string(), type: z.string(), default: z.string() }),
      ),
      relations: z.array(z.string()),
      example: z.string().describe("one realistic example record as JSON"),
    }),
  ),
});
export type DataModel = z.infer<typeof dataModelSchema>;

// --- Plan -------------------------------------------------------------------

export const taskStatus = z.enum(["TODO", "IN_REVIEW", "DONE"]);
export const size = z.enum(["S", "M", "L"]);

export const taskSchema = z.object({
  id: z.string().describe("task-NNN"),
  goal: z.string(),
  files: z.array(z.string()).describe("files to create or change"),
  acceptanceCriteria: z.array(z.string()),
  status: taskStatus,
  size,
});
export type Task = z.infer<typeof taskSchema>;

export const backlogSchema = z.object({
  tasks: z.array(taskSchema),
  risks: z.array(z.string()),
});
export type Backlog = z.infer<typeof backlogSchema>;

// --- Build ------------------------------------------------------------------

export const fileSchema = z.object({
  path: z.string().describe("path relative to build/src, e.g. src/index.html"),
  contents: z.string(),
});

export const taskImplSchema = z.object({
  taskId: z.string(),
  files: z.array(fileSchema),
  status: taskStatus.describe("IN_REVIEW when the task is implemented"),
  startCommand: z.string(),
  notes: z.array(z.string()).describe("out-of-scope problems spotted, if any"),
});
export type TaskImpl = z.infer<typeof taskImplSchema>;

export const testPlanSchema = z.object({
  files: z.array(fileSchema).describe("test files added to the build"),
  coverage: z.array(
    z.object({ requirementOrTask: z.string(), tests: z.string() }),
  ),
  notCovered: z.array(z.string()),
  testCommand: z.string(),
  testCount: z.number(),
});
export type TestPlan = z.infer<typeof testPlanSchema>;

// --- QA ---------------------------------------------------------------------

export const bugSchema = z.object({
  id: z.string().describe("bug-NNN"),
  steps: z.string(),
  expected: z.string(),
  actual: z.string(),
  status: z.enum(["OPEN", "FIXED", "BLOCKED"]),
  note: z.string().describe("root-cause / resolution note, empty until fixed"),
});
export type Bug = z.infer<typeof bugSchema>;

export const testReportSchema = z.object({
  verdict,
  summary: z.string(),
  passed: z.number(),
  failed: z.number(),
  failingOutput: z.string(),
  bugs: z.array(bugSchema),
});
export type TestReport = z.infer<typeof testReportSchema>;

export const bugFixSchema = z.object({
  bug: bugSchema,
  files: z.array(fileSchema).describe("changed files (root-cause fix)"),
});
export type BugFix = z.infer<typeof bugFixSchema>;

// --- Ship -------------------------------------------------------------------

export const userDocsSchema = z.object({
  userDocs: z.string().describe("06-ship/user-docs.md contents"),
  readme: z.string().describe("polished build/src/README.md contents"),
});
export type UserDocs = z.infer<typeof userDocsSchema>;

// --- Record -----------------------------------------------------------------

export const logEntrySchema = z.object({
  turn: z.number(),
  done: z.array(z.string()).describe("agents run, artifacts changed, verdicts, gate overrides"),
  walkthrough: z.string().describe("UI walkthrough notes, or 'No UI exercised this turn.'"),
  commitSummary: z.string().describe("one-line summary of the turn, as a git commit subject would read"),
});
export type LogEntry = z.infer<typeof logEntrySchema>;

// --- Release -----------------------------------------------------------------

export const releaseSchema = z.object({
  decision: z.enum(["GO", "NO-GO"]),
  productSummary: z.string(),
  shippedThisCycle: z.array(z.string()),
  knownLimitations: z.array(z.string()),
  doubleCheck: z.array(z.string()).describe("assumptions the user should verify"),
  blockers: z.array(z.string()).describe("what blocks release on NO-GO"),
});
export type Release = z.infer<typeof releaseSchema>;
