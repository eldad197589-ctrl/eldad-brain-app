/* ====
   FILE: qc-preview-result-seed.ts
   PURPOSE: Static Stage 12 QC context, coverage, and result fixtures.
   DEPENDENCIES: QC preview contracts
   EXPORTS: QC context, policy coverage, and result fixtures
   ==== */

// #region Imports
import {
  QC_BLOCKED_BOUNDARY_KEYS,
  QC_STATIC_FIXTURE_SOURCE,
} from './qc-preview-types';
import type {
  QCPolicyCoverageMap,
  QCPreviewResult,
  QCReviewContext,
} from './qc-preview-types';
// #endregion

// #region Shared Fixtures
const contextLocks = {
  policyCoverageId: 'qc-policy-coverage-stage12',
  reviewerLabel: 'Eldad',
  createsRealApprovalState: false,
  fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  previewOnly: true,
} as const;

const resultLocks = {
  fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  previewOnly: true,
  canFinalizeOutput: false,
  canExecuteAction: false,
  canPersistDecision: false,
} as const;
// #endregion

// #region Contexts
/** Static Stage 12 QC review contexts. */
export const QC_REVIEW_CONTEXTS: readonly QCReviewContext[] = [
  {
    reviewContextId: 'qc-context-intake-preview',
    subjectId: 'qc-subject-intake-preview',
    subjectType: 'intake_preview',
    checklistId: 'qc-checklist-intake-preview',
    reviewedAt: '2026-05-03T09:00:00.000Z',
    ...contextLocks,
  },
  {
    reviewContextId: 'qc-context-operational-preview',
    subjectId: 'qc-subject-operational-preview',
    subjectType: 'operational_preview',
    checklistId: 'qc-checklist-operational-preview',
    reviewedAt: '2026-05-03T09:05:00.000Z',
    ...contextLocks,
  },
  {
    reviewContextId: 'qc-context-output-preview',
    subjectId: 'qc-subject-output-preview',
    subjectType: 'professional_output_preview',
    checklistId: 'qc-checklist-output-preview',
    reviewedAt: '2026-05-03T09:10:00.000Z',
    ...contextLocks,
  },
  {
    reviewContextId: 'qc-context-workflow-map',
    subjectId: 'qc-subject-workflow-map',
    subjectType: 'workflow_map',
    checklistId: 'qc-checklist-workflow-map',
    reviewedAt: '2026-05-03T09:15:00.000Z',
    ...contextLocks,
  },
  {
    reviewContextId: 'qc-context-policy-decision',
    subjectId: 'qc-subject-policy-decision',
    subjectType: 'real_action_policy_decision',
    checklistId: 'qc-checklist-policy-decision',
    reviewedAt: '2026-05-03T09:20:00.000Z',
    ...contextLocks,
  },
];
// #endregion

// #region Coverage
/** Static Stage 12 QC policy coverage maps. */
export const QC_POLICY_COVERAGE_MAPS: readonly QCPolicyCoverageMap[] = [
  {
    policyCoverageId: 'qc-policy-coverage-stage12',
    coversIntakePreviews: true,
    coversOperationalPreviews: true,
    coversProfessionalOutputPreviews: true,
    coversWorkflowMaps: true,
    coversFutureRealActionPolicyDecisions: true,
    blockedBoundaryKeys: QC_BLOCKED_BOUNDARY_KEYS,
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
];
// #endregion

// #region Results
/** Static Stage 12 QC preview results. */
export const QC_PREVIEW_RESULTS: readonly QCPreviewResult[] = [
  {
    resultId: 'qc-result-intake-preview',
    subjectId: 'qc-subject-intake-preview',
    status: 'approved_for_next_stage_preview_only',
    checklistId: 'qc-checklist-intake-preview',
    findingIds: [],
    blockingIssueIds: [],
    approvalRequirementIds: ['qc-approval-intake-preview'],
    approvalDecisionPreviewIds: ['qc-decision-intake-approved-preview'],
    readyForNextPreviewStage: true,
    ...resultLocks,
  },
  {
    resultId: 'qc-result-operational-preview',
    subjectId: 'qc-subject-operational-preview',
    status: 'needs_changes',
    checklistId: 'qc-checklist-operational-preview',
    findingIds: ['qc-finding-candidate-review-needed'],
    blockingIssueIds: [],
    approvalRequirementIds: ['qc-approval-operational-preview'],
    approvalDecisionPreviewIds: ['qc-decision-operational-needs-changes'],
    readyForNextPreviewStage: false,
    ...resultLocks,
  },
  {
    resultId: 'qc-result-output-preview',
    subjectId: 'qc-subject-output-preview',
    status: 'passed_with_warnings',
    checklistId: 'qc-checklist-output-preview',
    findingIds: ['qc-finding-output-reviewer-needed'],
    blockingIssueIds: [],
    approvalRequirementIds: ['qc-approval-output-preview'],
    approvalDecisionPreviewIds: ['qc-decision-output-warning-preview'],
    readyForNextPreviewStage: true,
    ...resultLocks,
  },
  {
    resultId: 'qc-result-workflow-map',
    subjectId: 'qc-subject-workflow-map',
    status: 'ready_for_qc',
    checklistId: 'qc-checklist-workflow-map',
    findingIds: ['qc-finding-workflow-review-needed'],
    blockingIssueIds: [],
    approvalRequirementIds: ['qc-approval-workflow-map'],
    approvalDecisionPreviewIds: ['qc-decision-workflow-ready-preview'],
    readyForNextPreviewStage: false,
    ...resultLocks,
  },
  {
    resultId: 'qc-result-policy-decision',
    subjectId: 'qc-subject-policy-decision',
    status: 'blocked',
    checklistId: 'qc-checklist-policy-decision',
    findingIds: ['qc-finding-policy-blocked'],
    blockingIssueIds: ['qc-block-policy-needs-gate'],
    approvalRequirementIds: ['qc-approval-policy-decision'],
    approvalDecisionPreviewIds: ['qc-decision-policy-blocked-preview'],
    readyForNextPreviewStage: false,
    ...resultLocks,
  },
];
// #endregion
