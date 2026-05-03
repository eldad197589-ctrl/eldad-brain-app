/* ====
   FILE: robium-salary-clients-seed.ts
   PURPOSE: Static Stage 18 Robium, Salary Bureau, and client operation fixtures.
   DEPENDENCIES: Stage 18 Robium salary client contracts
   EXPORTS: Stage 18 static fixtures
   ==== */

// #region Imports
import {
  ROBIUM_STAGE18_BOUNDARY_FLAGS,
  ROBIUM_STAGE18_CAPABILITY_LOCKS,
  SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES,
} from './robium-salary-clients-types';
import type {
  ClientOperationDomainMap,
  PayrollOperationPreviewLock,
  RobiumProtocolSourcePreview,
  RobiumSafetyPolicyBundle,
  SalaryBureauWorkflowMap,
} from './robium-salary-clients-types';
// #endregion

// #region Robium Protocol Fixtures
/** Static Robium protocol source previews. */
export const ROBIUM_PROTOCOL_SOURCE_PREVIEWS: readonly RobiumProtocolSourcePreview[] = [
  {
    previewId: 'robium-protocol-preview-founders-001',
    protocolId: 'robium-protocol-founders-2026-05-04',
    meetingContext: 'founders',
    extractedItemCountPreview: 4,
    suggestedRoutingKinds: ['protocol_metadata_review', 'professional_output_preview'],
    taskExtractionBlocked: true,
    calendarCreationBlocked: true,
    autoActionBlocked: true,
    boundaryFlags: ROBIUM_STAGE18_BOUNDARY_FLAGS,
  },
  {
    previewId: 'robium-protocol-preview-client-call-001',
    protocolId: 'robium-protocol-client-call-001',
    meetingContext: 'client_call',
    extractedItemCountPreview: 3,
    suggestedRoutingKinds: ['client_operation_review', 'salary_bureau_review'],
    taskExtractionBlocked: true,
    calendarCreationBlocked: true,
    autoActionBlocked: true,
    boundaryFlags: ROBIUM_STAGE18_BOUNDARY_FLAGS,
  },
  {
    previewId: 'robium-protocol-preview-internal-review-001',
    protocolId: 'robium-protocol-internal-review-001',
    meetingContext: 'internal_review',
    extractedItemCountPreview: 2,
    suggestedRoutingKinds: ['salary_bureau_review', 'protocol_metadata_review'],
    taskExtractionBlocked: true,
    calendarCreationBlocked: true,
    autoActionBlocked: true,
    boundaryFlags: ROBIUM_STAGE18_BOUNDARY_FLAGS,
  },
  {
    previewId: 'robium-protocol-preview-vendor-001',
    protocolId: 'robium-protocol-vendor-001',
    meetingContext: 'vendor',
    extractedItemCountPreview: 1,
    suggestedRoutingKinds: ['protocol_metadata_review'],
    taskExtractionBlocked: true,
    calendarCreationBlocked: true,
    autoActionBlocked: true,
    boundaryFlags: ROBIUM_STAGE18_BOUNDARY_FLAGS,
  },
];
// #endregion

// #region Salary Bureau Fixtures
/** Static Salary Bureau workflow maps. */
export const SALARY_BUREAU_WORKFLOW_MAPS: readonly SalaryBureauWorkflowMap[] = [
  {
    workflowId: 'salary-bureau-monthly-cycle-preview',
    domain: 'payroll',
    hebrewLabel: 'לשכת שכר - מחזור חודשי',
    cycleStages: [
      'source_intake_preview',
      'missing_data_review',
      'professional_qc_preview',
      'approval_preview',
      'blocked_completion_review',
    ],
    eligibleSourceTypes: SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES,
    requiredApprovalStage: 'stage_7_approval_gate',
    requiredQcStage: 'stage_12_qc_preview_contract',
    riskLevel: 'high',
    professionalReviewRequired: true,
    calculationExecutionBlocked: true,
    submissionBlocked: true,
    capabilities: ROBIUM_STAGE18_CAPABILITY_LOCKS,
  },
  {
    workflowId: 'salary-bureau-termination-preview',
    domain: 'payroll',
    hebrewLabel: 'לשכת שכר - סיום העסקה',
    cycleStages: [
      'source_intake_preview',
      'missing_data_review',
      'professional_qc_preview',
      'approval_preview',
      'blocked_completion_review',
    ],
    eligibleSourceTypes: SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES,
    requiredApprovalStage: 'stage_7_approval_gate',
    requiredQcStage: 'stage_12_qc_preview_contract',
    riskLevel: 'high',
    professionalReviewRequired: true,
    calculationExecutionBlocked: true,
    submissionBlocked: true,
    capabilities: ROBIUM_STAGE18_CAPABILITY_LOCKS,
  },
];

/** Static payroll operation lock fixture. */
export const PAYROLL_OPERATION_PREVIEW_LOCK: PayrollOperationPreviewLock = {
  lockId: 'payroll-operation-preview-lock-stage18',
  domain: 'payroll',
  operations: {
    calculate_salary: 'blocked',
    generate_payslip: 'blocked',
    submit_to_tax_authority: 'blocked',
    generate_106_form: 'blocked',
    process_termination: 'blocked',
  },
  allOperationsBlocked: true,
  unlockRequires: 'dedicated_stage_gate',
  professionalLiabilityAcknowledged: false,
};
// #endregion

// #region Client Operation Fixtures
/** Static client operation domain maps. */
export const CLIENT_OPERATION_DOMAIN_MAPS: readonly ClientOperationDomainMap[] = [
  {
    domainId: 'client-operations-onboarding-preview',
    hebrewLabel: 'לקוחות - קליטה ובדיקת שלמות',
    operationTypes: ['client_onboarding_review', 'client_document_request_review'],
    clientDataAccessBlocked: true,
    communicationBlocked: true,
    operationRiskClassification: 'high',
    evidenceTraceRequired: true,
    capabilities: ROBIUM_STAGE18_CAPABILITY_LOCKS,
  },
  {
    domainId: 'client-operations-salary-cycle-preview',
    hebrewLabel: 'לקוחות - מחזור שכר חודשי',
    operationTypes: [
      'payroll_client_monthly_cycle_review',
      'protocol_follow_up_review',
      'client_communication_preview',
    ],
    clientDataAccessBlocked: true,
    communicationBlocked: true,
    operationRiskClassification: 'critical',
    evidenceTraceRequired: true,
    capabilities: ROBIUM_STAGE18_CAPABILITY_LOCKS,
  },
];
// #endregion

// #region Safety Policy Fixtures
/** Static Stage 18 safety policy bundle. */
export const ROBIUM_SAFETY_POLICY_BUNDLE: RobiumSafetyPolicyBundle = {
  bundleId: 'robium-salary-clients-safety-policy-stage18',
  hebrewLabel: 'רוביום / לשכת שכר / לקוחות - מדיניות חסימה סטטית',
  boundaryFlags: ROBIUM_STAGE18_BOUNDARY_FLAGS,
  liveRobiumLinkBlocked: true,
  protocolConnectionBlocked: true,
  payrollExecutionBlocked: true,
  salaryCalculationBlocked: true,
  clientRecordMutationBlocked: true,
  clientCommunicationBlocked: true,
  stateWriteBlocked: true,
  fileBoundaryBlocked: true,
  outputGenerationBlocked: true,
};
// #endregion
