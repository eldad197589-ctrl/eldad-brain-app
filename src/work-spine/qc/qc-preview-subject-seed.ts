/* ====
   FILE: qc-preview-subject-seed.ts
   PURPOSE: Static Stage 12 QC subject and checklist fixtures.
   DEPENDENCIES: QC preview contracts
   EXPORTS: QC subject, checklist, finding, and blocking fixtures
   ==== */

// #region Imports
import {
  QC_PREVIEW_SUBJECT_TYPES,
  QC_STATIC_FIXTURE_SOURCE,
} from './qc-preview-types';
import type {
  QCBlockingIssue,
  QCChecklist,
  QCChecklistItem,
  QCFinding,
  QCPreviewSubject,
} from './qc-preview-types';
// #endregion

// #region Shared Fixtures
const allSubjectTypes = QC_PREVIEW_SUBJECT_TYPES;
// #endregion

// #region Subjects
/** Static Stage 12 preview subjects covering every required QC surface. */
export const QC_PREVIEW_SUBJECTS: readonly QCPreviewSubject[] = [
  {
    subjectId: 'qc-subject-intake-preview',
    subjectType: 'intake_preview',
    title: 'Unified intake source preview',
    summary: 'Metadata-only normalized source preview awaiting QC.',
    sourceTraceIds: ['source-trace-intake-email-static'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
  {
    subjectId: 'qc-subject-operational-preview',
    subjectType: 'operational_preview',
    title: 'Candidate lifecycle preview',
    summary: 'Preview-only candidate handoff with no record creation.',
    sourceTraceIds: ['source-trace-candidate-drive-static'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
  {
    subjectId: 'qc-subject-output-preview',
    subjectType: 'professional_output_preview',
    title: 'Professional output preview',
    summary: 'Non-final output outline with generation blocked.',
    sourceTraceIds: ['source-trace-output-scan-static'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
  {
    subjectId: 'qc-subject-workflow-map',
    subjectType: 'workflow_map',
    title: 'Protocol workflow map preview',
    summary: 'Static workflow map from intake to review-only output.',
    sourceTraceIds: ['source-trace-workflow-protocol-static'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
  {
    subjectId: 'qc-subject-policy-decision',
    subjectType: 'real_action_policy_decision',
    title: 'Future action policy decision preview',
    summary: 'Policy decision preview with all action surfaces blocked.',
    sourceTraceIds: ['source-trace-policy-static'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
    previewOnly: true,
  },
];
// #endregion

// #region Checklist Items
/** Static Stage 12 QC checklist items. */
export const QC_CHECKLIST_ITEMS: readonly QCChecklistItem[] = [
  {
    checklistItemId: 'qc-item-source-trace',
    appliesTo: allSubjectTypes,
    label: 'Source trace preserved',
    description: 'Preview keeps metadata source trace ids attached.',
    required: true,
    status: 'passed',
    findingIds: [],
    blockingIssueIds: [],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
  {
    checklistItemId: 'qc-item-preview-only',
    appliesTo: allSubjectTypes,
    label: 'Preview-only boundary',
    description: 'Preview explicitly blocks durable state and execution.',
    required: true,
    status: 'passed',
    findingIds: [],
    blockingIssueIds: [],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
  {
    checklistItemId: 'qc-item-output-generation-blocked',
    appliesTo: ['professional_output_preview'],
    label: 'Output generation blocked',
    description: 'Professional output remains an outline only.',
    required: true,
    status: 'passed_with_warnings',
    findingIds: ['qc-finding-output-reviewer-needed'],
    blockingIssueIds: [],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
  {
    checklistItemId: 'qc-item-workflow-map-complete',
    appliesTo: ['workflow_map'],
    label: 'Workflow map complete',
    description: 'Workflow map includes stages, gates, and expected preview outputs.',
    required: true,
    status: 'ready_for_qc',
    findingIds: ['qc-finding-workflow-review-needed'],
    blockingIssueIds: [],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
  {
    checklistItemId: 'qc-item-policy-gates',
    appliesTo: ['real_action_policy_decision'],
    label: 'Policy gates locked',
    description: 'Future action policy stays blocked until a later gate.',
    required: true,
    status: 'blocked',
    findingIds: ['qc-finding-policy-blocked'],
    blockingIssueIds: ['qc-block-policy-needs-gate'],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
  {
    checklistItemId: 'qc-item-operational-preview-review',
    appliesTo: ['operational_preview'],
    label: 'Candidate review required',
    description: 'Operational preview cannot create real records.',
    required: true,
    status: 'in_review',
    findingIds: ['qc-finding-candidate-review-needed'],
    blockingIssueIds: [],
    fixtureSource: QC_STATIC_FIXTURE_SOURCE,
  },
];
// #endregion

// #region Checklists
/** Static Stage 12 QC checklists grouped by preview subject type. */
export const QC_CHECKLISTS: readonly QCChecklist[] = [
  {
    checklistId: 'qc-checklist-intake-preview',
    subjectType: 'intake_preview',
    title: 'Intake preview QC',
    checklistItemIds: ['qc-item-source-trace', 'qc-item-preview-only'],
    approvalRequirementIds: ['qc-approval-intake-preview'],
    status: 'passed',
    previewOnly: true,
  },
  {
    checklistId: 'qc-checklist-operational-preview',
    subjectType: 'operational_preview',
    title: 'Operational preview QC',
    checklistItemIds: [
      'qc-item-source-trace',
      'qc-item-preview-only',
      'qc-item-operational-preview-review',
    ],
    approvalRequirementIds: ['qc-approval-operational-preview'],
    status: 'in_review',
    previewOnly: true,
  },
  {
    checklistId: 'qc-checklist-output-preview',
    subjectType: 'professional_output_preview',
    title: 'Professional output preview QC',
    checklistItemIds: [
      'qc-item-source-trace',
      'qc-item-preview-only',
      'qc-item-output-generation-blocked',
    ],
    approvalRequirementIds: ['qc-approval-output-preview'],
    status: 'passed_with_warnings',
    previewOnly: true,
  },
  {
    checklistId: 'qc-checklist-workflow-map',
    subjectType: 'workflow_map',
    title: 'Workflow map QC',
    checklistItemIds: [
      'qc-item-source-trace',
      'qc-item-preview-only',
      'qc-item-workflow-map-complete',
    ],
    approvalRequirementIds: ['qc-approval-workflow-map'],
    status: 'ready_for_qc',
    previewOnly: true,
  },
  {
    checklistId: 'qc-checklist-policy-decision',
    subjectType: 'real_action_policy_decision',
    title: 'Future action policy QC',
    checklistItemIds: [
      'qc-item-source-trace',
      'qc-item-preview-only',
      'qc-item-policy-gates',
    ],
    approvalRequirementIds: ['qc-approval-policy-decision'],
    status: 'blocked',
    previewOnly: true,
  },
];
// #endregion

// #region Findings And Blocks
/** Static Stage 12 QC findings for preview-only review. */
export const QC_FINDINGS: readonly QCFinding[] = [
  {
    findingId: 'qc-finding-output-reviewer-needed',
    subjectId: 'qc-subject-output-preview',
    checklistItemId: 'qc-item-output-generation-blocked',
    severity: 'warning',
    message: 'Output preview requires Eldad review before any later stage.',
    recommendation: 'Keep the output as a non-final outline.',
    status: 'passed_with_warnings',
    previewOnly: true,
  },
  {
    findingId: 'qc-finding-policy-blocked',
    subjectId: 'qc-subject-policy-decision',
    checklistItemId: 'qc-item-policy-gates',
    severity: 'blocking',
    message: 'Future action policy cannot proceed without a later gate.',
    recommendation: 'Request Agent A review before any executor exists.',
    status: 'blocked',
    previewOnly: true,
  },
  {
    findingId: 'qc-finding-workflow-review-needed',
    subjectId: 'qc-subject-workflow-map',
    checklistItemId: 'qc-item-workflow-map-complete',
    severity: 'info',
    message: 'Workflow map is ready for QC review.',
    recommendation: 'Confirm stages and gates before next preview step.',
    status: 'ready_for_qc',
    previewOnly: true,
  },
  {
    findingId: 'qc-finding-candidate-review-needed',
    subjectId: 'qc-subject-operational-preview',
    checklistItemId: 'qc-item-operational-preview-review',
    severity: 'info',
    message: 'Candidate preview is still awaiting review.',
    recommendation: 'Keep candidate output detached from real records.',
    status: 'in_review',
    previewOnly: true,
  },
];

/** Static Stage 12 QC blocking issues. */
export const QC_BLOCKING_ISSUES: readonly QCBlockingIssue[] = [
  {
    blockingIssueId: 'qc-block-policy-needs-gate',
    subjectId: 'qc-subject-policy-decision',
    checklistItemId: 'qc-item-policy-gates',
    reason: 'Later gate required before any future action policy can proceed.',
    requiredBeforeNextStage: 'Agent A approval for real-action implementation.',
    blocksApproval: true,
    previewOnly: true,
  },
];
// #endregion
