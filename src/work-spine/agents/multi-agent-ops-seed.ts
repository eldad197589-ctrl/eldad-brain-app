/* ====
   FILE: multi-agent-ops-seed.ts
   PURPOSE: Static Stage 19 multi-agent operations fixtures.
   DEPENDENCIES: Stage 19 multi-agent operations contracts
   EXPORTS: Static multi-agent operations snapshot
   ==== */

// #region Imports
import type {
  AgentAuditTrace,
  AgentCapabilityBoundary,
  AgentCollisionPolicy,
  AgentHandoffRule,
  AgentRole,
  AgentWorkAssignment,
  MultiAgentOperationSnapshot,
  StagingIsolationPolicy,
} from './multi-agent-ops-types';
import {
  MULTI_AGENT_OPERATION_ROLES,
  MULTI_AGENT_TASK_MODES,
  STAGE19_STRUCTURALLY_BLOCKED_TASK_MODES,
} from './multi-agent-ops-types';
// #endregion

// #region Capability Fixtures
const roleBoundary = (
  agentId: AgentRole,
  canApproveGates: boolean,
  canReviewDiffs: boolean,
): AgentCapabilityBoundary => ({
  agentId,
  canPrepareStaticContracts: agentId !== 'eldad',
  canPrepareStaticFixtures: agentId !== 'eldad',
  canPrepareTests: agentId !== 'eldad',
  canReviewDiffs,
  canApproveGates,
  liveExecutionBlocked: true,
  structuralSurfacesBlocked: true,
});

/** Static Stage 19 role capability boundaries. */
export const STAGE19_AGENT_CAPABILITY_BOUNDARIES: readonly AgentCapabilityBoundary[] = [
  roleBoundary('agent_a', true, true),
  roleBoundary('codex_main', false, true),
  roleBoundary('codex_2', false, true),
  roleBoundary('codex_3', false, true),
  roleBoundary('gravity', false, false),
  roleBoundary('auditor', false, true),
  {
    ...roleBoundary('eldad', true, true),
    canPrepareStaticContracts: false,
    canPrepareStaticFixtures: false,
    canPrepareTests: false,
  },
];
// #endregion

// #region Policy Fixtures
/** Static Stage 19 collision policy. */
export const STAGE19_AGENT_COLLISION_POLICY: AgentCollisionPolicy = {
  policyId: 'stage19-collision-policy-single-owner',
  singleFileOwnershipRequired: true,
  overlappingWriteScopesBlocked: true,
  declaredOwnershipRequired: true,
  handoffRequiredOnConflict: true,
  conflictResolutionLabel: 'Single owner per file; conflict requires handoff before changes',
};

/** Static Stage 19 staging isolation policy. */
export const STAGE19_STAGING_ISOLATION_POLICY: StagingIsolationPolicy = {
  policyId: 'stage19-staging-isolation-approved-files-only',
  approvedFilesOnly: true,
  mixedUnrelatedStagingBlocked: true,
  stagedPathsMustMatchOwnership: true,
  unrelatedDirtyFilesUntouched: true,
  isolationLabel: 'Stage only approved assignment files; unrelated worktree changes stay untouched',
};
// #endregion

// #region Assignment Fixtures
/** Static Stage 19 work assignments. */
export const STAGE19_AGENT_WORK_ASSIGNMENTS: readonly AgentWorkAssignment[] = [
  {
    assignmentId: 'stage19-assignment-codex-2-static-contracts',
    agentId: 'codex_2',
    stageId: 19,
    taskId: 'stage19-multi-agent-ops-static-contracts',
    mode: 'static_contract',
    ownedFilePaths: [
      'src/work-spine/agents/multi-agent-ops-types.ts',
      'src/work-spine/agents/multi-agent-ops-seed.ts',
      'src/work-spine/agents/multi-agent-ops-types.test.ts',
      'vitest.multi-agent-ops.config.mjs',
    ],
    readOnlyContextPaths: ['src/work-spine/execution/agentic-execution-types.ts'],
    staticOnly: true,
    liveExecutionBlocked: true,
    capabilityBoundaryRef: 'codex_2',
  },
  {
    assignmentId: 'stage19-assignment-auditor-diff-review',
    agentId: 'auditor',
    stageId: 19,
    taskId: 'stage19-multi-agent-ops-diff-review',
    mode: 'read_only',
    ownedFilePaths: [],
    readOnlyContextPaths: ['src/work-spine/agents/multi-agent-ops-types.ts'],
    staticOnly: true,
    liveExecutionBlocked: true,
    capabilityBoundaryRef: 'auditor',
  },
];
// #endregion

// #region Trace Fixtures
/** Static Stage 19 audit traces. */
export const STAGE19_AGENT_AUDIT_TRACES: readonly AgentAuditTrace[] = [
  {
    traceId: 'stage19-trace-codex-2-static-contracts',
    agentId: 'codex_2',
    taskId: 'stage19-multi-agent-ops-static-contracts',
    stageId: 19,
    mode: 'static_contract',
    filesModified: [
      'src/work-spine/agents/multi-agent-ops-types.ts',
      'src/work-spine/agents/multi-agent-ops-seed.ts',
      'src/work-spine/agents/multi-agent-ops-types.test.ts',
      'vitest.multi-agent-ops.config.mjs',
    ],
    gateApprovalRef: 'AGENT_A_STAGE19_MULTI_AGENT_OPS_APPROVED',
    timestamp: '2026-05-04T09:00:00.000+03:00',
    outcome: 'completed',
  },
  {
    traceId: 'stage19-trace-live-mode-blocked',
    agentId: 'agent_a',
    taskId: 'stage19-live-mode-structural-block',
    stageId: 19,
    mode: 'live_execution',
    filesModified: [],
    gateApprovalRef: 'AGENT_A_STAGE19_MULTI_AGENT_OPS_APPROVED',
    timestamp: '2026-05-04T09:05:00.000+03:00',
    outcome: 'blocked',
  },
];
// #endregion

// #region Handoff Fixtures
/** Static Stage 19 handoff rules. */
export const STAGE19_AGENT_HANDOFF_RULES: readonly AgentHandoffRule[] = [
  {
    handoffRuleId: 'stage19-handoff-codex-2-to-auditor',
    fromAgentId: 'codex_2',
    toAgentId: 'auditor',
    trigger: 'Static contracts ready for read-only diff review',
    requiredArtifacts: ['git-diff-summary', 'focused-vitest-result', 'forbidden-surface-scan'],
    staticOnly: true,
    liveActivationAllowed: false,
  },
  {
    handoffRuleId: 'stage19-handoff-auditor-to-agent-a',
    fromAgentId: 'auditor',
    toAgentId: 'agent_a',
    trigger: 'Diff review needs gate decision before staging',
    requiredArtifacts: ['diff-review-report', 'stage19-safety-confirmations'],
    staticOnly: true,
    liveActivationAllowed: false,
  },
];
// #endregion

// #region Snapshot Fixture
/** Static Stage 19 multi-agent operations snapshot. */
export const STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT: MultiAgentOperationSnapshot = {
  snapshotId: 'stage19-multi-agent-ops-snapshot-static-001',
  stageId: 19,
  gateApprovalRef: 'AGENT_A_STAGE19_MULTI_AGENT_OPS_APPROVED',
  agentRoles: MULTI_AGENT_OPERATION_ROLES,
  taskModes: MULTI_AGENT_TASK_MODES,
  structurallyBlockedModes: STAGE19_STRUCTURALLY_BLOCKED_TASK_MODES,
  capabilityBoundaries: STAGE19_AGENT_CAPABILITY_BOUNDARIES,
  assignments: STAGE19_AGENT_WORK_ASSIGNMENTS,
  collisionPolicy: STAGE19_AGENT_COLLISION_POLICY,
  stagingIsolationPolicy: STAGE19_STAGING_ISOLATION_POLICY,
  auditTraces: STAGE19_AGENT_AUDIT_TRACES,
  handoffRules: STAGE19_AGENT_HANDOFF_RULES,
  staticOnly: true,
  liveOperationAllowed: false,
};
// #endregion
