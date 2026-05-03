/* ====
   FILE: qc-preview-approval-seed.ts
   PURPOSE: Static Stage 12 QC approval requirement and decision fixtures.
   DEPENDENCIES: QC preview contracts
   EXPORTS: QC approval preview fixtures
   ==== */

// #region Imports
import {
  QC_SCOPE_ACKNOWLEDGEMENT,
} from './qc-preview-types';
import type {
  QCApprovalDecisionPreview,
  QCApprovalRequirement,
} from './qc-preview-types';
// #endregion

// #region Shared Fixtures
const decisionLocks = {
  scopeAcknowledgement: QC_SCOPE_ACKNOWLEDGEMENT,
  forbiddenActionsAcknowledged: true,
  previewOnly: true,
  canFinalizeOutput: false,
  canExecuteAction: false,
  canPersistDecision: false,
} as const;
// #endregion

// #region Approval Requirements
/** Static Stage 12 approval requirements for preview-only QC. */
export const QC_APPROVAL_REQUIREMENTS: readonly QCApprovalRequirement[] = [
  {
    approvalRequirementId: 'qc-approval-intake-preview',
    subjectType: 'intake_preview',
    requiredReviewerRole: 'Eldad reviewer',
    requiredChecklistIds: ['qc-checklist-intake-preview'],
    requiredAcknowledgements: [QC_SCOPE_ACKNOWLEDGEMENT],
    requiresEldad: true,
    previewOnly: true,
  },
  {
    approvalRequirementId: 'qc-approval-operational-preview',
    subjectType: 'operational_preview',
    requiredReviewerRole: 'Eldad reviewer',
    requiredChecklistIds: ['qc-checklist-operational-preview'],
    requiredAcknowledgements: [QC_SCOPE_ACKNOWLEDGEMENT],
    requiresEldad: true,
    previewOnly: true,
  },
  {
    approvalRequirementId: 'qc-approval-output-preview',
    subjectType: 'professional_output_preview',
    requiredReviewerRole: 'Eldad reviewer',
    requiredChecklistIds: ['qc-checklist-output-preview'],
    requiredAcknowledgements: [QC_SCOPE_ACKNOWLEDGEMENT],
    requiresEldad: true,
    previewOnly: true,
  },
  {
    approvalRequirementId: 'qc-approval-workflow-map',
    subjectType: 'workflow_map',
    requiredReviewerRole: 'Eldad reviewer',
    requiredChecklistIds: ['qc-checklist-workflow-map'],
    requiredAcknowledgements: [QC_SCOPE_ACKNOWLEDGEMENT],
    requiresEldad: true,
    previewOnly: true,
  },
  {
    approvalRequirementId: 'qc-approval-policy-decision',
    subjectType: 'real_action_policy_decision',
    requiredReviewerRole: 'Eldad reviewer',
    requiredChecklistIds: ['qc-checklist-policy-decision'],
    requiredAcknowledgements: [QC_SCOPE_ACKNOWLEDGEMENT],
    requiresEldad: true,
    previewOnly: true,
  },
];
// #endregion

// #region Approval Decision Previews
/** Static Stage 12 approval decision previews with every real effect blocked. */
export const QC_APPROVAL_DECISION_PREVIEWS: readonly QCApprovalDecisionPreview[] = [
  {
    approvalId: 'qc-decision-intake-approved-preview',
    subjectId: 'qc-subject-intake-preview',
    subjectType: 'intake_preview',
    reviewerId: 'eldad-static-reviewer',
    reviewerLabel: 'Eldad',
    decision: 'approve_next_stage_preview',
    decisionStatus: 'approved_for_next_stage_preview_only',
    timestamp: '2026-05-03T09:00:00.000Z',
    rationale: 'Metadata-only intake preview passed the static QC checklist.',
    requiredChecklistIds: ['qc-checklist-intake-preview'],
    passedChecklistIds: ['qc-checklist-intake-preview'],
    blockingIssueIds: [],
    warnings: [],
    validUntil: '2026-06-03T09:00:00.000Z',
    ...decisionLocks,
  },
  {
    approvalId: 'qc-decision-operational-needs-changes',
    subjectId: 'qc-subject-operational-preview',
    subjectType: 'operational_preview',
    reviewerId: 'eldad-static-reviewer',
    reviewerLabel: 'Eldad',
    decision: 'request_preview_changes',
    decisionStatus: 'needs_changes',
    timestamp: '2026-05-03T09:05:00.000Z',
    rationale: 'Candidate preview needs clearer handoff wording before approval.',
    requiredChecklistIds: ['qc-checklist-operational-preview'],
    passedChecklistIds: [],
    blockingIssueIds: [],
    warnings: ['Candidate preview remains detached from real records.'],
    expiresAt: '2026-06-03T09:05:00.000Z',
    ...decisionLocks,
  },
  {
    approvalId: 'qc-decision-output-warning-preview',
    subjectId: 'qc-subject-output-preview',
    subjectType: 'professional_output_preview',
    reviewerId: 'eldad-static-reviewer',
    reviewerLabel: 'Eldad',
    decision: 'approve_next_stage_preview',
    decisionStatus: 'passed_with_warnings',
    timestamp: '2026-05-03T09:10:00.000Z',
    rationale: 'Output preview can be reviewed as an outline only.',
    requiredChecklistIds: ['qc-checklist-output-preview'],
    passedChecklistIds: ['qc-checklist-output-preview'],
    blockingIssueIds: [],
    warnings: ['Generation remains blocked.'],
    validUntil: '2026-06-03T09:10:00.000Z',
    ...decisionLocks,
  },
  {
    approvalId: 'qc-decision-workflow-ready-preview',
    subjectId: 'qc-subject-workflow-map',
    subjectType: 'workflow_map',
    reviewerId: 'eldad-static-reviewer',
    reviewerLabel: 'Eldad',
    decision: 'approve_next_stage_preview',
    decisionStatus: 'ready_for_qc',
    timestamp: '2026-05-03T09:15:00.000Z',
    rationale: 'Workflow map is ready for QC pass review.',
    requiredChecklistIds: ['qc-checklist-workflow-map'],
    passedChecklistIds: [],
    blockingIssueIds: [],
    warnings: ['Workflow execution remains unavailable.'],
    expiresAt: '2026-06-03T09:15:00.000Z',
    ...decisionLocks,
  },
  {
    approvalId: 'qc-decision-policy-blocked-preview',
    subjectId: 'qc-subject-policy-decision',
    subjectType: 'real_action_policy_decision',
    reviewerId: 'eldad-static-reviewer',
    reviewerLabel: 'Eldad',
    decision: 'block_preview',
    decisionStatus: 'blocked',
    timestamp: '2026-05-03T09:20:00.000Z',
    rationale: 'Future action policy requires a later Agent A gate.',
    requiredChecklistIds: ['qc-checklist-policy-decision'],
    passedChecklistIds: [],
    blockingIssueIds: ['qc-block-policy-needs-gate'],
    warnings: ['No real action can proceed from this preview.'],
    validUntil: '2026-06-03T09:20:00.000Z',
    ...decisionLocks,
  },
];
// #endregion
