/* ====
   FILE: multi-agent-ops-types.ts
   PURPOSE: Static Stage 19 multi-agent operations contracts.
   DEPENDENCIES: None
   EXPORTS: Multi-agent operations constants and interfaces
   ==== */

// #region Constants
/** Required Stage 19 agent roles. */
export const MULTI_AGENT_OPERATION_ROLES = [
  'agent_a',
  'codex_main',
  'codex_2',
  'codex_3',
  'gravity',
  'auditor',
  'eldad',
] as const;

/** Required Stage 19 task modes. */
export const MULTI_AGENT_TASK_MODES = [
  'read_only',
  'static_contract',
  'preview_ui',
  'simulation',
  'structural_gate_pending',
  'live_execution',
] as const;

/** Stage 19 task modes that remain structurally blocked. */
export const STAGE19_STRUCTURALLY_BLOCKED_TASK_MODES = ['live_execution'] as const;

/** Stage 19 audit outcomes. */
export const MULTI_AGENT_AUDIT_OUTCOMES = [
  'completed',
  'blocked',
  'handed_off',
  'cancelled',
] as const;
// #endregion

// #region Types
/** Required Stage 19 agent role. */
export type AgentRole = (typeof MULTI_AGENT_OPERATION_ROLES)[number];

/** Required Stage 19 task mode. */
export type AgentTaskMode = (typeof MULTI_AGENT_TASK_MODES)[number];

/** Stage 19 audit outcome. */
export type AgentAuditOutcome = (typeof MULTI_AGENT_AUDIT_OUTCOMES)[number];

/** Explicit capability boundary for a Stage 19 agent role. */
export interface AgentCapabilityBoundary {
  /** Agent role covered by this boundary. */
  agentId: AgentRole;
  /** Whether this role may prepare static contracts. */
  canPrepareStaticContracts: boolean;
  /** Whether this role may prepare static fixtures. */
  canPrepareStaticFixtures: boolean;
  /** Whether this role may prepare tests. */
  canPrepareTests: boolean;
  /** Whether this role may review staged diffs. */
  canReviewDiffs: boolean;
  /** Whether this role may approve gates. */
  canApproveGates: boolean;
  /** Whether live work remains blocked for this role. */
  liveExecutionBlocked: true;
  /** Whether this role must avoid provider, store, and file-system surfaces. */
  structuralSurfacesBlocked: true;
}

/** Static Stage 19 assignment metadata for one agent. */
export interface AgentWorkAssignment {
  /** Stable assignment id. */
  assignmentId: string;
  /** Assigned agent role. */
  agentId: AgentRole;
  /** Stage id, fixed to 19 for this static contract set. */
  stageId: 19;
  /** Task id assigned to the role. */
  taskId: string;
  /** Allowed task mode for the role. */
  mode: AgentTaskMode;
  /** File paths owned by this role for the assignment. */
  ownedFilePaths: readonly string[];
  /** File paths the role may read for context. */
  readOnlyContextPaths: readonly string[];
  /** Whether the assignment is static only. */
  staticOnly: true;
  /** Whether the assignment is blocked from live work. */
  liveExecutionBlocked: true;
  /** Boundary reference id for this role. */
  capabilityBoundaryRef: string;
}

/** Static collision policy for Stage 19 multi-agent work. */
export interface AgentCollisionPolicy {
  /** Stable collision policy id. */
  policyId: string;
  /** Whether each file may have only one active owner. */
  singleFileOwnershipRequired: true;
  /** Whether overlapping write scopes are blocked. */
  overlappingWriteScopesBlocked: true;
  /** Whether ownership must be declared before editing. */
  declaredOwnershipRequired: true;
  /** Whether conflicting agents must hand off instead of editing. */
  handoffRequiredOnConflict: true;
  /** Static conflict resolution label. */
  conflictResolutionLabel: string;
}

/** Static Stage 19 audit trace. */
export interface AgentAuditTrace {
  /** Stable trace id. */
  traceId: string;
  /** Agent role id. */
  agentId: AgentRole;
  /** Task id. */
  taskId: string;
  /** Stage id. */
  stageId: 19;
  /** Task mode. */
  mode: AgentTaskMode;
  /** Modified file paths recorded by the static trace. */
  filesModified: readonly string[];
  /** Gate approval reference for this trace. */
  gateApprovalRef: string;
  /** Static trace timestamp. */
  timestamp: string;
  /** Static audit outcome. */
  outcome: AgentAuditOutcome;
}

/** Static handoff rule between Stage 19 agents. */
export interface AgentHandoffRule {
  /** Stable handoff rule id. */
  handoffRuleId: string;
  /** Source agent role. */
  fromAgentId: AgentRole;
  /** Target agent role. */
  toAgentId: AgentRole;
  /** Trigger label for the handoff. */
  trigger: string;
  /** Required handoff artifact ids. */
  requiredArtifacts: readonly string[];
  /** Whether handoff remains static only. */
  staticOnly: true;
  /** Whether handoff may activate live work. */
  liveActivationAllowed: false;
}

/** Static Stage 19 staging isolation policy. */
export interface StagingIsolationPolicy {
  /** Stable staging policy id. */
  policyId: string;
  /** Whether only approved assignment files may be staged. */
  approvedFilesOnly: true;
  /** Whether mixed unrelated staging is blocked. */
  mixedUnrelatedStagingBlocked: true;
  /** Whether staged file paths must match assignment ownership. */
  stagedPathsMustMatchOwnership: true;
  /** Whether dirty unrelated files must stay untouched. */
  unrelatedDirtyFilesUntouched: true;
  /** Static isolation label. */
  isolationLabel: string;
}

/** Static Stage 19 multi-agent operations snapshot. */
export interface MultiAgentOperationSnapshot {
  /** Stable snapshot id. */
  snapshotId: string;
  /** Stage id. */
  stageId: 19;
  /** Gate approval reference. */
  gateApprovalRef: string;
  /** Required roles included in the snapshot. */
  agentRoles: readonly AgentRole[];
  /** Required task modes included in the snapshot. */
  taskModes: readonly AgentTaskMode[];
  /** Structurally blocked task modes. */
  structurallyBlockedModes: readonly AgentTaskMode[];
  /** Explicit capability boundaries for every role. */
  capabilityBoundaries: readonly AgentCapabilityBoundary[];
  /** Static assignments. */
  assignments: readonly AgentWorkAssignment[];
  /** Static collision policy. */
  collisionPolicy: AgentCollisionPolicy;
  /** Static staging isolation policy. */
  stagingIsolationPolicy: StagingIsolationPolicy;
  /** Static audit traces. */
  auditTraces: readonly AgentAuditTrace[];
  /** Static handoff rules. */
  handoffRules: readonly AgentHandoffRule[];
  /** Whether this snapshot is static only. */
  staticOnly: true;
  /** Whether any live operation is allowed. */
  liveOperationAllowed: false;
}
// #endregion
