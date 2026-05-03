/* ====
   FILE: qc-preview-types.ts
   PURPOSE: Static Stage 12 QC preview contracts.
   DEPENDENCIES: None
   EXPORTS: QC preview constants and interfaces
   ==== */

// #region Constants
/** Preview subjects covered by Stage 12 QC contracts. */
export const QC_PREVIEW_SUBJECT_TYPES = [
  'intake_preview',
  'operational_preview',
  'professional_output_preview',
  'workflow_map',
  'real_action_policy_decision',
] as const;

/** Allowed preview-only QC statuses. */
export const QC_PREVIEW_STATUSES = [
  'not_started',
  'ready_for_qc',
  'in_review',
  'passed',
  'passed_with_warnings',
  'needs_changes',
  'blocked',
  'rejected',
  'approved_for_next_stage_preview_only',
] as const;

/** Required acknowledgement for every Stage 12 approval decision preview. */
export const QC_SCOPE_ACKNOWLEDGEMENT = 'approved_for_next_stage_preview_only';

/** Required static fixture marker for Stage 12 QC previews. */
export const QC_STATIC_FIXTURE_SOURCE = 'stage12_static_qc_preview';

/** Boundary keys that Stage 12 QC can describe but cannot cross. */
export const QC_BLOCKED_BOUNDARY_KEYS = [
  'state_write_boundary',
  'operational_object_boundary',
  'connector_boundary',
  'file_boundary',
  'routing_surface_boundary',
  'client_folder_boundary',
  'finalization_boundary',
] as const;
// #endregion

// #region Types
/** Stage 12 QC preview subject type. */
export type QCPreviewSubjectType = (typeof QC_PREVIEW_SUBJECT_TYPES)[number];

/** Stage 12 QC status, limited to preview-only progress. */
export type QCPreviewStatus = (typeof QC_PREVIEW_STATUSES)[number];

/** Static source marker for Stage 12 QC fixtures. */
export type QCStaticFixtureSource = typeof QC_STATIC_FIXTURE_SOURCE;

/** Required scope acknowledgement for approval previews. */
export type QCScopeAcknowledgement = typeof QC_SCOPE_ACKNOWLEDGEMENT;

/** Boundary keys that remain blocked in Stage 12. */
export type QCBlockedBoundaryKey = (typeof QC_BLOCKED_BOUNDARY_KEYS)[number];

/** Severity levels for QC findings. */
export type QCFindingSeverity = 'info' | 'warning' | 'blocking';

/** Preview-only approval decision names. */
export type QCApprovalDecisionName =
  | 'approve_next_stage_preview'
  | 'request_preview_changes'
  | 'block_preview'
  | 'reject_preview';

/** Subject reviewed by the static Stage 12 QC layer. */
export interface QCPreviewSubject {
  subjectId: string;
  subjectType: QCPreviewSubjectType;
  title: string;
  summary: string;
  sourceTraceIds: readonly string[];
  fixtureSource: QCStaticFixtureSource;
  previewOnly: true;
}

/** Single item in a static Stage 12 QC checklist. */
export interface QCChecklistItem {
  checklistItemId: string;
  appliesTo: readonly QCPreviewSubjectType[];
  label: string;
  description: string;
  required: boolean;
  status: QCPreviewStatus;
  findingIds: readonly string[];
  blockingIssueIds: readonly string[];
  fixtureSource: QCStaticFixtureSource;
}

/** Static checklist grouping QC items for one subject type. */
export interface QCChecklist {
  checklistId: string;
  subjectType: QCPreviewSubjectType;
  title: string;
  checklistItemIds: readonly string[];
  approvalRequirementIds: readonly string[];
  status: QCPreviewStatus;
  previewOnly: true;
}

/** Non-operational QC finding attached to a preview object. */
export interface QCFinding {
  findingId: string;
  subjectId: string;
  checklistItemId: string;
  severity: QCFindingSeverity;
  message: string;
  recommendation: string;
  status: QCPreviewStatus;
  previewOnly: true;
}

/** Blocking issue that prevents next preview-stage approval. */
export interface QCBlockingIssue {
  blockingIssueId: string;
  subjectId: string;
  checklistItemId: string;
  reason: string;
  requiredBeforeNextStage: string;
  blocksApproval: true;
  previewOnly: true;
}

/** Static requirement that describes who must review a preview subject. */
export interface QCApprovalRequirement {
  approvalRequirementId: string;
  subjectType: QCPreviewSubjectType;
  requiredReviewerRole: string;
  requiredChecklistIds: readonly string[];
  requiredAcknowledgements: readonly QCScopeAcknowledgement[];
  requiresEldad: true;
  previewOnly: true;
}

/** Preview-only approval decision produced by Stage 12 QC fixtures. */
export interface QCApprovalDecisionPreview {
  approvalId: string;
  subjectId: string;
  subjectType: QCPreviewSubjectType;
  reviewerId: string;
  reviewerLabel: string;
  decision: QCApprovalDecisionName;
  decisionStatus: QCPreviewStatus;
  timestamp: string;
  rationale: string;
  requiredChecklistIds: readonly string[];
  passedChecklistIds: readonly string[];
  blockingIssueIds: readonly string[];
  warnings: readonly string[];
  scopeAcknowledgement: QCScopeAcknowledgement;
  forbiddenActionsAcknowledged: true;
  previewOnly: true;
  canFinalizeOutput: false;
  canExecuteAction: false;
  canPersistDecision: false;
  validUntil?: string;
  expiresAt?: string;
}

/** Context used to review static QC previews without creating state. */
export interface QCReviewContext {
  reviewContextId: string;
  subjectId: string;
  subjectType: QCPreviewSubjectType;
  checklistId: string;
  policyCoverageId: string;
  reviewerLabel: string;
  reviewedAt: string;
  createsRealApprovalState: false;
  fixtureSource: QCStaticFixtureSource;
  previewOnly: true;
}

/** Static coverage map for the Stage 12 QC policy surface. */
export interface QCPolicyCoverageMap {
  policyCoverageId: string;
  coversIntakePreviews: true;
  coversOperationalPreviews: true;
  coversProfessionalOutputPreviews: true;
  coversWorkflowMaps: true;
  coversFutureRealActionPolicyDecisions: true;
  blockedBoundaryKeys: readonly QCBlockedBoundaryKey[];
  fixtureSource: QCStaticFixtureSource;
  previewOnly: true;
}

/** Static QC result for one preview subject. */
export interface QCPreviewResult {
  resultId: string;
  subjectId: string;
  status: QCPreviewStatus;
  checklistId: string;
  findingIds: readonly string[];
  blockingIssueIds: readonly string[];
  approvalRequirementIds: readonly string[];
  approvalDecisionPreviewIds: readonly string[];
  readyForNextPreviewStage: boolean;
  fixtureSource: QCStaticFixtureSource;
  previewOnly: true;
  canFinalizeOutput: false;
  canExecuteAction: false;
  canPersistDecision: false;
}
// #endregion
