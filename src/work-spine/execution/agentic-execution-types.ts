/* ====
   FILE: agentic-execution-types.ts
   PURPOSE: Static Stage 16 limited agentic execution contracts.
   DEPENDENCIES: None
   EXPORTS: Agentic execution constants and interfaces
   ==== */

// #region Constants
/** Static Stage 16 action class definitions. */
export const AGENTIC_EXECUTION_CLASS_DEFINITIONS = [
  { actionClass: 0, className: 'observe', executionBlocked: false, activeInStage16: true },
  { actionClass: 1, className: 'classify', executionBlocked: true, activeInStage16: false },
  { actionClass: 2, className: 'create_internal', executionBlocked: true, activeInStage16: false },
  { actionClass: 3, className: 'file_operation', executionBlocked: true, activeInStage16: false },
  { actionClass: 4, className: 'generate_output', executionBlocked: true, activeInStage16: false },
  { actionClass: 5, className: 'external_action', executionBlocked: true, activeInStage16: false },
] as const;

/** Stage 16 action class numbers. */
export const AGENTIC_EXECUTION_CLASS_NUMBERS = [0, 1, 2, 3, 4, 5] as const;

/** Stage 16 action class names. */
export const AGENTIC_EXECUTION_CLASS_NAMES = [
  'observe',
  'classify',
  'create_internal',
  'file_operation',
  'generate_output',
  'external_action',
] as const;

/** Stage 16 audit result values. */
export const AGENTIC_EXECUTION_RESULT_STATUSES = [
  'success',
  'failed',
  'rolled_back',
  'killed',
  'not_executed',
] as const;

/** Stage 16 policy gate result values. */
export const AGENTIC_EXECUTION_POLICY_GATE_RESULTS = [
  'observe_allowed',
  'blocked_by_stage_16',
  'requires_future_gate',
] as const;

/** Stage 16 QC gate result values. */
export const AGENTIC_EXECUTION_QC_GATE_RESULTS = [
  'not_required_for_observe',
  'blocked_by_stage_16',
  'requires_future_qc_gate',
] as const;

/** Stage 16 rollback method values. */
export const AGENTIC_EXECUTION_ROLLBACK_METHODS = [
  'none_required',
  'manual_review',
  'manual_restore',
  'not_reversible',
] as const;
// #endregion

// #region Types
/** Stage 16 action class number. */
export type AgenticExecutionActionClass = (typeof AGENTIC_EXECUTION_CLASS_NUMBERS)[number];

/** Stage 16 action class name. */
export type AgenticExecutionActionClassName = (typeof AGENTIC_EXECUTION_CLASS_NAMES)[number];

/** Stage 16 audit result value. */
export type AgenticExecutionResult = (typeof AGENTIC_EXECUTION_RESULT_STATUSES)[number];

/** Stage 16 policy gate result. */
export type AgenticExecutionPolicyGateResult =
  (typeof AGENTIC_EXECUTION_POLICY_GATE_RESULTS)[number];

/** Stage 16 QC gate result. */
export type AgenticExecutionQcGateResult =
  (typeof AGENTIC_EXECUTION_QC_GATE_RESULTS)[number];

/** Stage 16 rollback method. */
export type AgenticExecutionRollbackMethod =
  (typeof AGENTIC_EXECUTION_ROLLBACK_METHODS)[number];

/** Static action class definition for Stage 16. */
export interface AgenticExecutionClassDefinition {
  /** Numeric risk class. */
  actionClass: AgenticExecutionActionClass;
  /** Human-readable class name. */
  className: AgenticExecutionActionClassName;
  /** Whether Stage 16 blocks this class. */
  executionBlocked: boolean;
  /** Whether Stage 16 allows this class as active observe/read/display. */
  activeInStage16: boolean;
}

/** Approval chain metadata required before any future agentic action could proceed. */
export interface ExecutionApprovalChain {
  /** Stable approval chain id. */
  approvalChainId: string;
  /** Policy gate result metadata. */
  policyGateResult: AgenticExecutionPolicyGateResult;
  /** QC gate result metadata. */
  qcGateResult: AgenticExecutionQcGateResult;
  /** Eldad approval id, or null when no real approval exists. */
  eldadApprovalId: string | null;
  /** Required gate ids as strings only. */
  requiredGateIds: readonly string[];
  /** Whether Eldad approval is required. */
  eldadApprovalRequired: boolean;
  /** Whether all required gate ids are present in the static mock. */
  allRequiredGateIdsPresent: boolean;
  /** Whether irreversible risk acknowledgement is required. */
  irreversibilityAcknowledgmentRequired: boolean;
  /** Whether the static mock includes explicit irreversible risk acknowledgement. */
  explicitEldadIrreversibilityAcknowledgment: boolean;
}

/** Kill switch metadata for static Stage 16 requests. */
export interface KillSwitchPolicy {
  /** Stable kill switch policy id. */
  killSwitchPolicyId: string;
  /** Whether a kill switch must be available for this request. */
  killSwitchAvailable: boolean;
  /** Static label for kill switch coverage. */
  coverageLabel: string;
  /** Maximum response window metadata. */
  maxResponseWindowMs: number;
  /** Whether Eldad notification would be required in a future gate. */
  eldadNotificationRequired: boolean;
}

/** Rollback metadata for static Stage 16 requests. */
export interface RollbackPlan {
  /** Stable rollback plan id. */
  rollbackPlanId: string;
  /** Rollback method metadata. */
  rollbackMethod: AgenticExecutionRollbackMethod;
  /** Whether rollback would be available in a later gate. */
  rollbackAvailable: boolean;
  /** Whether rollback would require Eldad. */
  rollbackRequiresEldad: boolean;
  /** Whether irreversible risk has explicit Eldad acknowledgement. */
  explicitEldadIrreversibilityAcknowledgment: boolean;
  /** Static verification requirement label. */
  postActionVerificationRequirement: string;
}

/** Static Stage 16 agentic execution request. */
export interface AgenticExecutionRequest {
  /** Stable request id. */
  requestId: string;
  /** Agent role id. */
  agentId: string;
  /** Numeric action class. */
  actionClass: AgenticExecutionActionClass;
  /** Proposed action type label. */
  actionType: string;
  /** Source intake id. */
  sourceIntakeId: string;
  /** Policy gate result metadata. */
  policyGateResult: AgenticExecutionPolicyGateResult;
  /** QC gate result metadata. */
  qcGateResult: AgenticExecutionQcGateResult;
  /** Eldad approval id, or null when no real approval exists. */
  eldadApprovalId: string | null;
  /** Whether the request remains blocked. */
  executionBlocked: boolean;
  /** Static blocked reason metadata. */
  executionBlockedReason: string;
  /** Whether the static request requires kill switch availability. */
  killSwitchAvailable: boolean;
  /** Rollback metadata. */
  rollbackPlan: RollbackPlan;
  /** Maximum execution window metadata. */
  maxExecutionWindowMs: number;
  /** Approval chain metadata. */
  approvalChain: ExecutionApprovalChain;
  /** Static proposal timestamp. */
  proposedAt: string;
  /** Kill switch metadata. */
  killSwitchPolicy: KillSwitchPolicy;
}

/** Verification metadata attached to static Stage 16 audit entries. */
export interface PostExecutionVerification {
  /** Verification status label. */
  verificationStatus: 'not_required' | 'blocked' | 'pending_future_gate';
  /** Verification note. */
  verificationNote: string;
}

/** Static Stage 16 audit entry. */
export interface AgenticExecutionAuditEntry {
  /** Stable audit entry id. */
  auditEntryId: string;
  /** Request id. */
  requestId: string;
  /** Agent role id. */
  agentId: string;
  /** Numeric action class. */
  actionClass: AgenticExecutionActionClass;
  /** Proposed action type label. */
  actionType: string;
  /** Source intake id. */
  sourceIntakeId: string;
  /** Policy gate result metadata. */
  policyGateResult: AgenticExecutionPolicyGateResult;
  /** QC gate result metadata. */
  qcGateResult: AgenticExecutionQcGateResult;
  /** Eldad approval id, or null when no real approval exists. */
  eldadApprovalId: string | null;
  /** Static audit timestamp. */
  executionTimestamp: string;
  /** Static result metadata. */
  executionResult: AgenticExecutionResult;
  /** Whether rollback happened in this static mock. */
  rollbackExecuted: boolean;
  /** Static post execution verification metadata. */
  postExecutionVerification: PostExecutionVerification;
}
// #endregion
