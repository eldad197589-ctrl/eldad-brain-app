/* ====
   FILE: workflow-map-seed.ts
   PURPOSE: Static Stage 11 professional workflow map mocks.
   DEPENDENCIES: Workflow domain registry and workflow map contracts
   EXPORTS: Static professional workflow maps
   ==== */

// #region Imports
import { WORKFLOW_DOMAIN_REGISTRY } from './workflow-domain-registry';
import type {
  ProfessionalWorkflowMap,
  WorkflowDomain,
  WorkflowDomainRegistryEntry,
  WorkflowEligibleSourceType,
  WorkflowExpectedOutputType,
  WorkflowMapStage,
} from './workflow-map-types';
import {
  WORKFLOW_CAPABILITY_LOCKS,
  WORKFLOW_FUTURE_UNLOCK_STAGE,
  WORKFLOW_MAP_STAGE_STATUS,
  WORKFLOW_REQUIRED_GATES,
} from './workflow-map-types';
// #endregion

// #region Static Shared Data
const blockedWorkflowActions = [
  'workflow_execution',
  'durable_write',
  'operational_object_creation',
  'provider_connection',
  'file_generation',
] as const;

const boundaryFlags = [
  'static_contract_only',
  'no_execution_engine',
  'no_persistence',
  'no_provider_access',
  'no_file_generation',
] as const;

const auditTraceRequirements = [
  'approvedUnifiedIntakeSourceId',
  'stage7DecisionId',
  'stage8PreviewId',
  'stage9PolicyId',
  'stage10OutputPreviewId',
  'stage12QcDecisionId',
] as const;

const defaultRequiredInputs = [
  'approved_unified_intake_source',
  'stage_8_operational_preview',
  'stage_9_policy_check',
] as const;

const defaultStagePlan: readonly WorkflowMapStage[] = [
  {
    stageId: 'source_trace',
    name: 'Source trace review',
    goal: 'Confirm the approved metadata source and approval trace.',
    status: WORKFLOW_MAP_STAGE_STATUS,
  },
  {
    stageId: 'preview_alignment',
    name: 'Preview alignment',
    goal: 'Compare operational and output preview ids without creating records.',
    status: WORKFLOW_MAP_STAGE_STATUS,
  },
  {
    stageId: 'qc_gate',
    name: 'Quality control gate',
    goal: 'Require Stage 12 QC before any future operational review.',
    status: WORKFLOW_MAP_STAGE_STATUS,
  },
] as const;
// #endregion

// #region Helpers
const getDomainEntry = (workflowDomain: WorkflowDomain): WorkflowDomainRegistryEntry => {
  const registryEntry = WORKFLOW_DOMAIN_REGISTRY.find(
    (domainEntry) => domainEntry.domain === workflowDomain,
  );

  if (!registryEntry) {
    throw new Error(`Missing workflow domain registry entry: ${workflowDomain}`);
  }

  return registryEntry;
};

const buildWorkflowMap = (
  workflowDomain: WorkflowDomain,
  eligibleSourceTypes: readonly WorkflowEligibleSourceType[],
  eligibleOutputTypes: readonly WorkflowExpectedOutputType[],
  expectedOutputs: readonly string[],
  description: string,
  notes: string,
): ProfessionalWorkflowMap => {
  const domainEntry = getDomainEntry(workflowDomain);

  return {
    workflowId: `workflow-map-${workflowDomain}`,
    domain: workflowDomain,
    name: domainEntry.englishLabel,
    hebrewLabel: domainEntry.hebrewLabel,
    goal: domainEntry.goal,
    description,
    eligibleSourceTypes,
    eligibleOutputTypes,
    requiredApprovalStage: WORKFLOW_REQUIRED_GATES.approval,
    requiredPolicyStage: WORKFLOW_REQUIRED_GATES.policy,
    requiredOutputPreviewStage: WORKFLOW_REQUIRED_GATES.outputPreview,
    requiredQcStage: WORKFLOW_REQUIRED_GATES.qualityControl,
    stages: defaultStagePlan,
    requiredInputs: defaultRequiredInputs,
    expectedOutputs,
    riskLevel: domainEntry.defaultRiskLevel,
    professionalReviewRequired: domainEntry.professionalReviewRequired,
    reviewerRequirement: domainEntry.reviewerRequirement,
    blockedActions: blockedWorkflowActions,
    boundaryFlags,
    capabilities: WORKFLOW_CAPABILITY_LOCKS,
    auditTraceRequirements,
    futureUnlockStage: WORKFLOW_FUTURE_UNLOCK_STAGE,
    staticMapOnly: true,
    executionBlocked: true,
    notes,
  };
};
// #endregion

// #region Static Maps
/** Static Stage 11 professional workflow maps for the approved domains. */
export const STATIC_WORKFLOW_MAPS: readonly ProfessionalWorkflowMap[] = [
  buildWorkflowMap(
    'protocol_task_management',
    ['protocol_metadata', 'gmail_metadata'],
    ['protocol_action_summary', 'task_summary'],
    ['readonly_protocol_action_summary_preview'],
    'Maps protocol metadata into non-executing follow-up categories.',
    'No task extraction or task creation is available in Stage 11.',
  ),
  buildWorkflowMap(
    'client_case_filing',
    ['drive_metadata', 'scan_metadata', 'gmail_metadata'],
    ['evidence_summary', 'task_summary'],
    ['readonly_case_filing_preview'],
    'Maps source metadata into a hypothetical client filing route.',
    'No matter link, document reference, folder, or client file is created.',
  ),
  buildWorkflowMap(
    'bookkeeping',
    ['drive_metadata', 'scan_metadata', 'manual_metadata'],
    ['task_summary', 'evidence_summary'],
    ['readonly_bookkeeping_review_preview'],
    'Maps bookkeeping metadata into a review-only accounting sequence.',
    'No ledger, store, or bookkeeping operation is available in Stage 11.',
  ),
  buildWorkflowMap(
    'vat',
    ['drive_metadata', 'scan_metadata', 'gmail_metadata'],
    ['vat_review_memo', 'task_summary'],
    ['readonly_vat_review_memo_preview'],
    'Maps VAT metadata into a review memo structure without generation.',
    'No VAT filing, export, or submission is available in Stage 11.',
  ),
  buildWorkflowMap(
    'payroll',
    ['drive_metadata', 'scan_metadata', 'manual_metadata'],
    ['task_summary', 'letter'],
    ['readonly_payroll_review_preview'],
    'Maps payroll metadata into a review-only payroll workflow.',
    'No payroll calculation, report, or employee record is created.',
  ),
  buildWorkflowMap(
    'war_compensation',
    ['drive_metadata', 'scan_metadata', 'gmail_metadata'],
    ['evidence_summary', 'letter'],
    ['readonly_compensation_evidence_preview'],
    'Maps compensation metadata into a static evidence review route.',
    'No claim submission, file generation, or evidence filing is available.',
  ),
  buildWorkflowMap(
    'labor_law',
    ['drive_metadata', 'scan_metadata', 'gmail_metadata'],
    ['letter', 'professional_opinion_draft'],
    ['readonly_labor_law_review_preview'],
    'Maps labor-law metadata into a professional review-only workflow.',
    'Professional review is required; no legal output is generated.',
  ),
  buildWorkflowMap(
    'expert_opinions',
    ['drive_metadata', 'scan_metadata', 'manual_metadata'],
    ['professional_opinion_draft', 'evidence_summary'],
    ['readonly_expert_opinion_review_preview'],
    'Maps expert-opinion metadata into a critical review-only workflow.',
    'Critical professional review is required before any future draft gate.',
  ),
] as const;
// #endregion
