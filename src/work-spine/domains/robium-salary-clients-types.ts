/* ====
   FILE: robium-salary-clients-types.ts
   PURPOSE: Static Stage 18 Robium, Salary Bureau, and client operation contracts.
   DEPENDENCIES: None
   EXPORTS: Stage 18 domain constants and interfaces
   ==== */

// #region Constants
/** Allowed metadata-only Robium protocol meeting contexts. */
export const ROBIUM_PROTOCOL_MEETING_CONTEXTS = [
  'founders',
  'client_call',
  'internal_review',
  'vendor',
] as const;

/** Suggested routing kinds from Robium protocol previews. */
export const ROBIUM_PROTOCOL_ROUTING_KINDS = [
  'salary_bureau_review',
  'client_operation_review',
  'protocol_metadata_review',
  'professional_output_preview',
] as const;

/** Boundary flags that keep Stage 18 static and non-operational. */
export const ROBIUM_STAGE18_BOUNDARY_FLAGS = [
  'static_contract_only',
  'metadata_preview_only',
  'no_live_robium_link',
  'no_payroll_run',
  'no_client_record_change',
  'no_output_generation',
  'dedicated_stage_gate_required',
] as const;

/** Salary Bureau source categories allowed as static labels only. */
export const SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES = ['scan', 'email', 'manual_upload'] as const;

/** Static payroll cycle stages for Salary Bureau workflow maps. */
export const SALARY_BUREAU_CYCLE_STAGES = [
  'source_intake_preview',
  'missing_data_review',
  'professional_qc_preview',
  'approval_preview',
  'blocked_completion_review',
] as const;

/** Client operation domains modeled first in Stage 18. */
export const CLIENT_OPERATION_TYPES = [
  'client_onboarding_review',
  'client_document_request_review',
  'payroll_client_monthly_cycle_review',
  'protocol_follow_up_review',
  'client_communication_preview',
] as const;

/** Static operation risk classifications. */
export const ROBIUM_OPERATION_RISK_CLASSIFICATIONS = ['medium', 'high', 'critical'] as const;

/** Payroll operations that remain blocked in Stage 18. */
export const PAYROLL_OPERATION_KEYS = [
  'calculate_salary',
  'generate_payslip',
  'submit_to_tax_authority',
  'generate_106_form',
  'process_termination',
] as const;

/** Capability locks shared by Stage 18 Salary Bureau and client operations. */
export const ROBIUM_STAGE18_CAPABILITY_LOCKS = {
  canReadLiveSource: false,
  canWriteState: false,
  canRunCalculation: false,
  canSubmit: false,
  canGenerateOutput: false,
  canCommunicate: false,
  canCreateOperationalRecord: false,
} as const;
// #endregion

// #region Types
/** Robium protocol meeting context. */
export type RobiumProtocolMeetingContext = (typeof ROBIUM_PROTOCOL_MEETING_CONTEXTS)[number];

/** Suggested routing kind from a Robium protocol preview. */
export type RobiumProtocolRoutingKind = (typeof ROBIUM_PROTOCOL_ROUTING_KINDS)[number];

/** Stage 18 boundary flag. */
export type RobiumStage18BoundaryFlag = (typeof ROBIUM_STAGE18_BOUNDARY_FLAGS)[number];

/** Salary Bureau source type label. */
export type SalaryBureauEligibleSourceType = (typeof SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES)[number];

/** Salary Bureau cycle stage label. */
export type SalaryBureauCycleStage = (typeof SALARY_BUREAU_CYCLE_STAGES)[number];

/** Client operation type label. */
export type ClientOperationType = (typeof CLIENT_OPERATION_TYPES)[number];

/** Stage 18 operation risk classification. */
export type RobiumOperationRiskClassification =
  (typeof ROBIUM_OPERATION_RISK_CLASSIFICATIONS)[number];

/** Payroll operation key. */
export type PayrollOperationKey = (typeof PAYROLL_OPERATION_KEYS)[number];

/** Payroll operation lock status. */
export type PayrollOperationStatus = 'blocked';

/** Shared Stage 18 capability lock contract. */
export interface RobiumStage18Capabilities {
  /** Confirms no live source can be read. */
  canReadLiveSource: false;
  /** Confirms no state can be written. */
  canWriteState: false;
  /** Confirms no calculation can run. */
  canRunCalculation: false;
  /** Confirms no submission can happen. */
  canSubmit: false;
  /** Confirms no output can be generated. */
  canGenerateOutput: false;
  /** Confirms no client communication can be sent. */
  canCommunicate: false;
  /** Confirms no operational record can be created. */
  canCreateOperationalRecord: false;
}

/** Static Robium protocol source preview with blocked task/calendar actions. */
export interface RobiumProtocolSourcePreview {
  /** Stable preview id. */
  previewId: string;
  /** Stable protocol id string. */
  protocolId: string;
  /** Metadata-only meeting context. */
  meetingContext: RobiumProtocolMeetingContext;
  /** Count preview only, not extracted task data. */
  extractedItemCountPreview: number;
  /** Suggested routing labels only. */
  suggestedRoutingKinds: readonly RobiumProtocolRoutingKind[];
  /** Confirms task extraction is blocked. */
  taskExtractionBlocked: true;
  /** Confirms calendar creation is blocked. */
  calendarCreationBlocked: true;
  /** Confirms automatic action is blocked. */
  autoActionBlocked: true;
  /** Boundary flags proving this is static and non-operational. */
  boundaryFlags: readonly RobiumStage18BoundaryFlag[];
}

/** Static Salary Bureau workflow map for payroll preview planning. */
export interface SalaryBureauWorkflowMap {
  /** Stable workflow id. */
  workflowId: string;
  /** Salary Bureau domain id. */
  domain: 'payroll';
  /** Hebrew display label. */
  hebrewLabel: string;
  /** Static cycle stages. */
  cycleStages: readonly SalaryBureauCycleStage[];
  /** Eligible source labels, fixed to the required tuple. */
  eligibleSourceTypes: readonly ['scan', 'email', 'manual_upload'];
  /** Required approval stage id. */
  requiredApprovalStage: string;
  /** Required QC stage id. */
  requiredQcStage: string;
  /** Payroll workflows are high risk. */
  riskLevel: 'high';
  /** Professional review is required. */
  professionalReviewRequired: true;
  /** Confirms calculation execution is blocked. */
  calculationExecutionBlocked: true;
  /** Confirms submission is blocked. */
  submissionBlocked: true;
  /** Locked false capabilities. */
  capabilities: RobiumStage18Capabilities;
}

/** Static client operation domain map for preview planning. */
export interface ClientOperationDomainMap {
  /** Stable client operation domain id. */
  domainId: string;
  /** Hebrew display label. */
  hebrewLabel: string;
  /** Static client operation type labels. */
  operationTypes: readonly ClientOperationType[];
  /** Confirms client data access is blocked. */
  clientDataAccessBlocked: true;
  /** Confirms communication is blocked. */
  communicationBlocked: true;
  /** Risk classification for this domain. */
  operationRiskClassification: RobiumOperationRiskClassification;
  /** Evidence trace is required before any later gate. */
  evidenceTraceRequired: true;
  /** Locked false capabilities. */
  capabilities: RobiumStage18Capabilities;
}

/** Static payroll operation preview lock with every operation blocked. */
export interface PayrollOperationPreviewLock {
  /** Stable lock id. */
  lockId: string;
  /** Payroll domain id. */
  domain: 'payroll';
  /** Required payroll operation lock map. */
  operations: Record<PayrollOperationKey, PayrollOperationStatus>;
  /** Confirms every payroll operation is blocked. */
  allOperationsBlocked: true;
  /** Future unlock requires a dedicated stage gate. */
  unlockRequires: 'dedicated_stage_gate';
  /** Professional liability is not acknowledged in Stage 18. */
  professionalLiabilityAcknowledged: false;
}

/** Static safety policy bundle for Robium, Salary Bureau, and client operations. */
export interface RobiumSafetyPolicyBundle {
  /** Stable policy bundle id. */
  bundleId: string;
  /** Hebrew display label. */
  hebrewLabel: string;
  /** Boundary flags shared by Stage 18 fixtures. */
  boundaryFlags: readonly RobiumStage18BoundaryFlag[];
  /** Robium live link remains blocked. */
  liveRobiumLinkBlocked: true;
  /** Protocol connection remains blocked. */
  protocolConnectionBlocked: true;
  /** Payroll execution remains blocked. */
  payrollExecutionBlocked: true;
  /** Salary calculation remains blocked. */
  salaryCalculationBlocked: true;
  /** Client record mutation remains blocked. */
  clientRecordMutationBlocked: true;
  /** Client communication remains blocked. */
  clientCommunicationBlocked: true;
  /** State writes remain blocked. */
  stateWriteBlocked: true;
  /** File boundary remains blocked. */
  fileBoundaryBlocked: true;
  /** Output generation remains blocked. */
  outputGenerationBlocked: true;
}
// #endregion
