/* ====
   FILE: workflow-map-types.ts
   PURPOSE: Static Stage 11 professional workflow map contracts.
   DEPENDENCIES: None
   EXPORTS: Workflow map constants and interfaces
   ==== */

// #region Constants
/** Required Stage 11 professional workflow domains. */
export const WORKFLOW_DOMAINS = [
  'protocol_task_management',
  'client_case_filing',
  'bookkeeping',
  'vat',
  'payroll',
  'war_compensation',
  'labor_law',
  'expert_opinions',
] as const;

/** Stage 11 risk labels for static workflow maps. */
export const WORKFLOW_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

/** Stage 10 output ids referenced as strings only, with no Stage 10 import. */
export const WORKFLOW_EXPECTED_OUTPUT_TYPES = [
  'letter',
  'task_summary',
  'scan_intake_report',
  'protocol_action_summary',
  'vat_review_memo',
  'evidence_summary',
  'professional_opinion_draft',
] as const;

/** Static source ids used by Stage 11 maps without provider connections. */
export const WORKFLOW_ELIGIBLE_SOURCE_TYPES = [
  'gmail_metadata',
  'drive_metadata',
  'scan_metadata',
  'protocol_metadata',
  'manual_metadata',
] as const;

/** Required gate references for every Stage 11 workflow map. */
export const WORKFLOW_REQUIRED_GATES = {
  approval: 'stage_7_approval_gate',
  policy: 'stage_9_real_actions_policy_gate',
  outputPreview: 'stage_10_output_preview_contract',
  qualityControl: 'stage_12_quality_control_gate',
} as const;

/** Locked Stage 11 capability set. Every value must stay false. */
export const WORKFLOW_CAPABILITY_LOCKS = {
  canExecute: false,
  canPersist: false,
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canGenerateFiles: false,
  canUseProviders: false,
  canUseFileSystem: false,
} as const;

/** Static status for workflow map stages that cannot execute. */
export const WORKFLOW_MAP_STAGE_STATUS = 'static_preview_only';

/** Static unlock marker for future Agent A structural review. */
export const WORKFLOW_FUTURE_UNLOCK_STAGE = 'agent_a_structural_gate_required';
// #endregion

// #region Types
/** Required Stage 11 professional workflow domain id. */
export type WorkflowDomain = (typeof WORKFLOW_DOMAINS)[number];

/** Stage 11 workflow risk label. */
export type WorkflowRiskLevel = (typeof WORKFLOW_RISK_LEVELS)[number];

/** Stage 10 output id referenced by Stage 11 without importing Stage 10 files. */
export type WorkflowExpectedOutputType = (typeof WORKFLOW_EXPECTED_OUTPUT_TYPES)[number];

/** Metadata source type ids accepted by Stage 11 workflow maps. */
export type WorkflowEligibleSourceType = (typeof WORKFLOW_ELIGIBLE_SOURCE_TYPES)[number];

/** Static Stage 11 capability contract with all execution paths locked false. */
export interface WorkflowCapabilities {
  /** Confirms the workflow cannot execute. */
  canExecute: false;
  /** Confirms the workflow cannot persist data. */
  canPersist: false;
  /** Confirms the workflow cannot create a future work object. */
  canCreateWorkItem: false;
  /** Confirms the workflow cannot create or link a matter. */
  canCreateMatter: false;
  /** Confirms the workflow cannot create a document reference. */
  canCreateDocumentRef: false;
  /** Confirms the workflow cannot generate files. */
  canGenerateFiles: false;
  /** Confirms the workflow cannot use live providers. */
  canUseProviders: false;
  /** Confirms the workflow cannot use the file system. */
  canUseFileSystem: false;
}

/** Domain registry entry for a static Stage 11 workflow family. */
export interface WorkflowDomainRegistryEntry {
  /** Stable domain id. */
  domain: WorkflowDomain;
  /** Hebrew label for internal RTL display. */
  hebrewLabel: string;
  /** English label for internal developer review. */
  englishLabel: string;
  /** Static domain goal. */
  goal: string;
  /** Default risk level for this domain. */
  defaultRiskLevel: WorkflowRiskLevel;
  /** Confirms whether professional review is required. */
  professionalReviewRequired: boolean;
  /** Required reviewer label before any later gate. */
  reviewerRequirement: string;
  /** Output ids this domain may preview later. */
  expectedOutputTypes: readonly WorkflowExpectedOutputType[];
}

/** Descriptive stage inside a static workflow map. */
export interface WorkflowMapStage {
  /** Stable stage id. */
  stageId: string;
  /** Human-readable stage name. */
  name: string;
  /** Static stage goal. */
  goal: string;
  /** Locked status proving the stage cannot run. */
  status: typeof WORKFLOW_MAP_STAGE_STATUS;
}

/** Static, non-executing Stage 11 professional workflow map. */
export interface ProfessionalWorkflowMap {
  /** Stable workflow map id. */
  workflowId: string;
  /** Required workflow domain. */
  domain: WorkflowDomain;
  /** English workflow name. */
  name: string;
  /** Hebrew label for internal RTL display. */
  hebrewLabel: string;
  /** Static workflow goal. */
  goal: string;
  /** Static workflow description. */
  description: string;
  /** Metadata source types eligible for this map. */
  eligibleSourceTypes: readonly WorkflowEligibleSourceType[];
  /** Output type ids eligible for later previews. */
  eligibleOutputTypes: readonly WorkflowExpectedOutputType[];
  /** Required Stage 7 approval gate reference. */
  requiredApprovalStage: typeof WORKFLOW_REQUIRED_GATES.approval;
  /** Required Stage 9 policy gate reference. */
  requiredPolicyStage: typeof WORKFLOW_REQUIRED_GATES.policy;
  /** Required Stage 10 output preview gate reference. */
  requiredOutputPreviewStage: typeof WORKFLOW_REQUIRED_GATES.outputPreview;
  /** Required Stage 12 QC gate reference. */
  requiredQcStage: typeof WORKFLOW_REQUIRED_GATES.qualityControl;
  /** Descriptive stages only. */
  stages: readonly WorkflowMapStage[];
  /** Inputs needed before this workflow could ever be reviewed. */
  requiredInputs: readonly string[];
  /** Preview outputs expected from this workflow map. */
  expectedOutputs: readonly string[];
  /** Risk level for this workflow. */
  riskLevel: WorkflowRiskLevel;
  /** Confirms whether professional review is required. */
  professionalReviewRequired: boolean;
  /** Required reviewer label before any future operational step. */
  reviewerRequirement: string;
  /** Actions explicitly blocked at Stage 11. */
  blockedActions: readonly string[];
  /** Boundary flags shown to future reviewers. */
  boundaryFlags: readonly string[];
  /** Locked false capabilities. */
  capabilities: WorkflowCapabilities;
  /** Audit trace fields required before any later gate. */
  auditTraceRequirements: readonly string[];
  /** Future unlock marker. */
  futureUnlockStage: typeof WORKFLOW_FUTURE_UNLOCK_STAGE;
  /** Confirms the map is static metadata only. */
  staticMapOnly: true;
  /** Confirms no execution exists. */
  executionBlocked: true;
  /** Human-readable planning notes. */
  notes: string;
}
// #endregion
