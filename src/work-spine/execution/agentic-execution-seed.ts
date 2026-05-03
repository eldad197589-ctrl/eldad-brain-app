/* ====
   FILE: agentic-execution-seed.ts
   PURPOSE: Static Stage 16 limited agentic execution fixtures.
   DEPENDENCIES: Stage 16 agentic execution contracts
   EXPORTS: Static execution request and audit fixtures
   ==== */

// #region Imports
import type {
  AgenticExecutionAuditEntry,
  AgenticExecutionRequest,
  ExecutionApprovalChain,
  KillSwitchPolicy,
  RollbackPlan,
} from './agentic-execution-types';
// #endregion

// #region Shared Fixtures
/** Static Stage 16 observe approval chain. */
export const STAGE16_OBSERVE_APPROVAL_CHAIN: ExecutionApprovalChain = {
  approvalChainId: 'stage16-approval-chain-observe-001',
  policyGateResult: 'observe_allowed',
  qcGateResult: 'not_required_for_observe',
  eldadApprovalId: null,
  requiredGateIds: ['stage_16_observe_read_display_only'],
  eldadApprovalRequired: false,
  allRequiredGateIdsPresent: true,
  irreversibilityAcknowledgmentRequired: false,
  explicitEldadIrreversibilityAcknowledgment: false,
};

/** Static Stage 16 blocked approval chain. */
export const STAGE16_BLOCKED_APPROVAL_CHAIN: ExecutionApprovalChain = {
  approvalChainId: 'stage16-approval-chain-blocked-001',
  policyGateResult: 'blocked_by_stage_16',
  qcGateResult: 'blocked_by_stage_16',
  eldadApprovalId: null,
  requiredGateIds: ['agent_a_future_action_gate', 'eldad_future_action_approval'],
  eldadApprovalRequired: true,
  allRequiredGateIdsPresent: false,
  irreversibilityAcknowledgmentRequired: false,
  explicitEldadIrreversibilityAcknowledgment: false,
};

/** Static Stage 16 irreversible approval chain. */
export const STAGE16_IRREVERSIBLE_APPROVAL_CHAIN: ExecutionApprovalChain = {
  approvalChainId: 'stage16-approval-chain-irreversible-001',
  policyGateResult: 'requires_future_gate',
  qcGateResult: 'requires_future_qc_gate',
  eldadApprovalId: 'static-eldad-irreversibility-acknowledgment-preview',
  requiredGateIds: [
    'agent_a_future_external_action_gate',
    'eldad_explicit_irreversibility_acknowledgment',
  ],
  eldadApprovalRequired: true,
  allRequiredGateIdsPresent: true,
  irreversibilityAcknowledgmentRequired: true,
  explicitEldadIrreversibilityAcknowledgment: true,
};

/** Static Stage 16 observe kill switch metadata. */
export const STAGE16_OBSERVE_KILL_SWITCH_POLICY: KillSwitchPolicy = {
  killSwitchPolicyId: 'stage16-kill-switch-observe-001',
  killSwitchAvailable: false,
  coverageLabel: 'Observe/read/display only',
  maxResponseWindowMs: 0,
  eldadNotificationRequired: false,
};

/** Static Stage 16 blocked kill switch metadata. */
export const STAGE16_BLOCKED_KILL_SWITCH_POLICY: KillSwitchPolicy = {
  killSwitchPolicyId: 'stage16-kill-switch-blocked-001',
  killSwitchAvailable: true,
  coverageLabel: 'Future gated request must be stoppable',
  maxResponseWindowMs: 5000,
  eldadNotificationRequired: true,
};

/** Static Stage 16 observe rollback metadata. */
export const STAGE16_OBSERVE_ROLLBACK_PLAN: RollbackPlan = {
  rollbackPlanId: 'stage16-rollback-observe-001',
  rollbackMethod: 'none_required',
  rollbackAvailable: false,
  rollbackRequiresEldad: false,
  explicitEldadIrreversibilityAcknowledgment: false,
  postActionVerificationRequirement: 'No state change to verify',
};

/** Static Stage 16 blocked rollback metadata. */
export const STAGE16_BLOCKED_ROLLBACK_PLAN: RollbackPlan = {
  rollbackPlanId: 'stage16-rollback-blocked-001',
  rollbackMethod: 'manual_review',
  rollbackAvailable: true,
  rollbackRequiresEldad: true,
  explicitEldadIrreversibilityAcknowledgment: false,
  postActionVerificationRequirement: 'Future gate must define verification before activation',
};

/** Static Stage 16 irreversible rollback metadata. */
export const STAGE16_IRREVERSIBLE_ROLLBACK_PLAN: RollbackPlan = {
  rollbackPlanId: 'stage16-rollback-irreversible-001',
  rollbackMethod: 'not_reversible',
  rollbackAvailable: false,
  rollbackRequiresEldad: true,
  explicitEldadIrreversibilityAcknowledgment: true,
  postActionVerificationRequirement: 'Irreversible risk acknowledgement required before any future gate',
};
// #endregion

// #region Request Fixtures
/** Static Stage 16 request fixtures. */
export const STATIC_AGENTIC_EXECUTION_REQUESTS: readonly AgenticExecutionRequest[] = [
  {
    requestId: 'stage16-request-observe-001',
    agentId: 'codex-observer',
    actionClass: 0,
    actionType: 'observe_metadata_preview',
    sourceIntakeId: 'source-intake-static-preview-001',
    policyGateResult: 'observe_allowed',
    qcGateResult: 'not_required_for_observe',
    eldadApprovalId: null,
    executionBlocked: false,
    executionBlockedReason: 'Observe/read/display only',
    killSwitchAvailable: false,
    rollbackPlan: STAGE16_OBSERVE_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_OBSERVE_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:00:00.000Z',
    killSwitchPolicy: STAGE16_OBSERVE_KILL_SWITCH_POLICY,
  },
  {
    requestId: 'stage16-request-classify-001',
    agentId: 'codex-classifier-preview',
    actionClass: 1,
    actionType: 'classify_candidate_preview',
    sourceIntakeId: 'source-intake-static-preview-002',
    policyGateResult: 'blocked_by_stage_16',
    qcGateResult: 'blocked_by_stage_16',
    eldadApprovalId: null,
    executionBlocked: true,
    executionBlockedReason: 'Class 1 requires a later gate',
    killSwitchAvailable: false,
    rollbackPlan: STAGE16_BLOCKED_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_BLOCKED_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:01:00.000Z',
    killSwitchPolicy: STAGE16_OBSERVE_KILL_SWITCH_POLICY,
  },
  {
    requestId: 'stage16-request-create-internal-001',
    agentId: 'codex-internal-preview',
    actionClass: 2,
    actionType: 'create_internal_preview_bundle',
    sourceIntakeId: 'source-intake-static-preview-003',
    policyGateResult: 'blocked_by_stage_16',
    qcGateResult: 'blocked_by_stage_16',
    eldadApprovalId: null,
    executionBlocked: true,
    executionBlockedReason: 'Class 2 requires a later gate',
    killSwitchAvailable: true,
    rollbackPlan: STAGE16_BLOCKED_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_BLOCKED_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:02:00.000Z',
    killSwitchPolicy: STAGE16_BLOCKED_KILL_SWITCH_POLICY,
  },
  {
    requestId: 'stage16-request-file-operation-001',
    agentId: 'codex-file-preview',
    actionClass: 3,
    actionType: 'file_operation_preview',
    sourceIntakeId: 'source-intake-static-preview-004',
    policyGateResult: 'blocked_by_stage_16',
    qcGateResult: 'blocked_by_stage_16',
    eldadApprovalId: null,
    executionBlocked: true,
    executionBlockedReason: 'Class 3 requires a later gate',
    killSwitchAvailable: true,
    rollbackPlan: STAGE16_BLOCKED_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_BLOCKED_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:03:00.000Z',
    killSwitchPolicy: STAGE16_BLOCKED_KILL_SWITCH_POLICY,
  },
  {
    requestId: 'stage16-request-generate-output-001',
    agentId: 'codex-output-preview',
    actionClass: 4,
    actionType: 'generate_output_preview',
    sourceIntakeId: 'source-intake-static-preview-005',
    policyGateResult: 'blocked_by_stage_16',
    qcGateResult: 'blocked_by_stage_16',
    eldadApprovalId: null,
    executionBlocked: true,
    executionBlockedReason: 'Class 4 requires a later gate',
    killSwitchAvailable: true,
    rollbackPlan: STAGE16_BLOCKED_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_BLOCKED_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:04:00.000Z',
    killSwitchPolicy: STAGE16_BLOCKED_KILL_SWITCH_POLICY,
  },
  {
    requestId: 'stage16-request-external-action-001',
    agentId: 'codex-external-preview',
    actionClass: 5,
    actionType: 'external_action_preview',
    sourceIntakeId: 'source-intake-static-preview-006',
    policyGateResult: 'requires_future_gate',
    qcGateResult: 'requires_future_qc_gate',
    eldadApprovalId: 'static-eldad-irreversibility-acknowledgment-preview',
    executionBlocked: true,
    executionBlockedReason: 'Class 5 requires explicit future gate and Eldad acknowledgement',
    killSwitchAvailable: true,
    rollbackPlan: STAGE16_IRREVERSIBLE_ROLLBACK_PLAN,
    maxExecutionWindowMs: 0,
    approvalChain: STAGE16_IRREVERSIBLE_APPROVAL_CHAIN,
    proposedAt: '2026-05-03T00:05:00.000Z',
    killSwitchPolicy: STAGE16_BLOCKED_KILL_SWITCH_POLICY,
  },
];
// #endregion

// #region Audit Fixtures
/** Static Stage 16 audit entry fixtures. */
export const STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES: readonly AgenticExecutionAuditEntry[] =
  STATIC_AGENTIC_EXECUTION_REQUESTS.map((request) => ({
    auditEntryId: `${request.requestId}-audit`,
    requestId: request.requestId,
    agentId: request.agentId,
    actionClass: request.actionClass,
    actionType: request.actionType,
    sourceIntakeId: request.sourceIntakeId,
    policyGateResult: request.policyGateResult,
    qcGateResult: request.qcGateResult,
    eldadApprovalId: request.eldadApprovalId,
    executionTimestamp: request.proposedAt,
    executionResult: 'not_executed',
    rollbackExecuted: false,
    postExecutionVerification: {
      verificationStatus: request.executionBlocked ? 'blocked' : 'not_required',
      verificationNote: request.executionBlocked
        ? 'Static mock remained blocked in Stage 16'
        : 'Observe/read/display only, no state change',
    },
  }));
// #endregion
