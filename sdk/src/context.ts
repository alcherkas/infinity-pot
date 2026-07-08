import type {
  Architecture,
  ApiDesign,
  Backlog,
  Bug,
  DataModel,
  LogEntry,
  Release,
  Requirements,
  Review,
  TaskImpl,
  TestPlan,
  TestReport,
  TurnPlan,
  UserDocs,
} from "./schemas.js";

/**
 * The in-memory message bus. Every agent's structured output accumulates here;
 * the orchestrator hands the relevant slices to downstream agents. This replaces
 * the markdown system's `workspace/<slug>/` filesystem bus.
 */
export interface ProjectContext {
  project: string;
  turn: number;
  status: "in-progress" | "released";
  lastAction: string | null;
  next: string;
  maxGateIterations: number;

  idea: string;

  // shelves — populated as agents run
  turnPlan?: TurnPlan;
  requirements?: Requirements;
  assumptions: string[];
  understandReview?: Review;

  architecture?: Architecture;
  api?: ApiDesign;
  dataModel?: DataModel;
  designReview?: Review;

  backlog?: Backlog;

  build: TaskImpl[]; // one per implemented task
  codeReviews: Record<string, Review>; // keyed by taskId
  testPlan?: TestPlan;

  testReport?: TestReport;
  uiReport?: TestReport;
  bugs: Bug[];

  userDocs?: UserDocs;
  securityReview?: Review;
  release?: Release;

  // gate overrides noted this turn (loop never stalls)
  gateOverrides: string[];

  // append-only turn journal, written by the scribe agent
  log: LogEntry[];
}

export function newContext(project: string, idea: string): ProjectContext {
  return {
    project,
    turn: 0,
    status: "in-progress",
    lastAction: null,
    next: "gap-analyst",
    maxGateIterations: 3,
    idea,
    assumptions: [],
    build: [],
    codeReviews: {},
    bugs: [],
    gateOverrides: [],
    log: [],
  };
}
