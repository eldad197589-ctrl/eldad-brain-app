/* ====
   FILE: learning-review-preview-seed.ts
   PURPOSE: Static Stage 14 learning review preview fixtures.
   DEPENDENCIES: Learning review preview contracts
   EXPORTS: Static learning review previews
   ==== */

// #region Imports
import type {
  LearningCandidateType,
  LearningEvidenceStrength,
  LearningReviewDomain,
  LearningReviewKind,
  LearningReviewPreview,
  LearningReviewRiskLevel,
  LearningReviewStatus,
  LearningReuseScope,
} from './learning-review-preview-types';
import { LEARNING_REVIEW_BOUNDARY_FLAGS } from './learning-review-preview-types';
// #endregion

// #region Helpers
interface PreviewInput {
  candidateType: LearningCandidateType;
  learningKind: LearningReviewKind;
  domain: LearningReviewDomain;
  proposedLearning: string;
  sourceTraceIds: readonly string[];
  evidenceBundleId: string;
  evidenceItemIds: readonly string[];
  evidenceStrength: LearningEvidenceStrength;
  missingEvidence: readonly string[];
  riskLevel: LearningReviewRiskLevel;
  professionalReviewRequired: boolean;
  suggestedReuseScope: LearningReuseScope;
  reviewStatus: LearningReviewStatus;
  eldadDecisionId: string | null;
  forbiddenReuseReasons: readonly string[];
}

const createLearningPreview = (
  previewId: string,
  candidateId: string,
  input: PreviewInput,
): LearningReviewPreview => ({
  previewId,
  candidateId,
  candidateType: input.candidateType,
  learningKind: input.learningKind,
  domain: input.domain,
  proposedLearning: input.proposedLearning,
  sourceTraceIds: input.sourceTraceIds,
  evidenceBundleId: input.evidenceBundleId,
  evidenceItemIds: input.evidenceItemIds,
  evidenceStrength: input.evidenceStrength,
  missingEvidence: input.missingEvidence,
  riskLevel: input.riskLevel,
  professionalReviewRequired: input.professionalReviewRequired,
  suggestedReuseScope: input.suggestedReuseScope,
  reviewStatus: input.reviewStatus,
  eldadDecisionId: input.eldadDecisionId,
  approvalRequired: true,
  bindingKnowledge: false,
  persistenceAllowed: false,
  automaticLearningAllowed: false,
  memoryWriteAllowed: false,
  ragWriteAllowed: false,
  knowledgeLogWriteAllowed: false,
  brainStoreWriteAllowed: false,
  forbiddenReuseReasons: input.forbiddenReuseReasons,
  boundaryFlags: LEARNING_REVIEW_BOUNDARY_FLAGS,
  createdAt: '2026-05-03T22:00:00.000Z',
});
// #endregion

// #region Static Fixtures
/** Static Stage 14 learning review previews covering every required status. */
export const STATIC_LEARNING_REVIEW_PREVIEWS: readonly LearningReviewPreview[] = [
  createLearningPreview('learning-preview-observed-protocol', 'candidate-protocol-001', {
    candidateType: 'workflow_map_pattern',
    learningKind: 'workflow_pattern',
    domain: 'protocol_task_management',
    proposedLearning: 'Repeated protocol items may need a task summary preview.',
    sourceTraceIds: ['evidence-source-protocol-001'],
    evidenceBundleId: 'evidence-bundle-stage13-protocol-001',
    evidenceItemIds: ['evidence-item-protocol-action-001'],
    evidenceStrength: 'weak',
    missingEvidence: ['Eldad review is missing.'],
    riskLevel: 'medium',
    professionalReviewRequired: false,
    suggestedReuseScope: 'single_case_preview',
    reviewStatus: 'observed_pattern',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Observed pattern only; not approved for reuse.'],
  }),
  createLearningPreview('learning-preview-candidate-bookkeeping', 'candidate-bookkeeping-002', {
    candidateType: 'intake_metadata_pattern',
    learningKind: 'fact',
    domain: 'bookkeeping',
    proposedLearning: 'חשבונית ללא מספר עוסק צריכה בדיקת השלמת פרטים לפני שימוש חוזר.',
    sourceTraceIds: ['evidence-source-bookkeeping-002'],
    evidenceBundleId: 'evidence-bundle-stage13-bookkeeping-002',
    evidenceItemIds: ['evidence-item-bookkeeping-field-002'],
    evidenceStrength: 'partial',
    missingEvidence: ['Reusable scope is not approved by Eldad.'],
    riskLevel: 'medium',
    professionalReviewRequired: false,
    suggestedReuseScope: 'single_case_preview',
    reviewStatus: 'learning_candidate',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Candidate is pending review.'],
  }),
  createLearningPreview('learning-preview-needs-source-vat', 'candidate-vat-003', {
    candidateType: 'qc_finding_pattern',
    learningKind: 'domain_rule',
    domain: 'vat',
    proposedLearning: 'VAT review may require both invoice metadata and bank trace evidence.',
    sourceTraceIds: [],
    evidenceBundleId: 'evidence-bundle-stage13-missing-vat-003',
    evidenceItemIds: [],
    evidenceStrength: 'none',
    missingEvidence: ['Source trace ids are missing.', 'Evidence item ids are missing.'],
    riskLevel: 'high',
    professionalReviewRequired: true,
    suggestedReuseScope: 'none',
    reviewStatus: 'needs_source_trace',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['No source trace exists.'],
  }),
  createLearningPreview('learning-preview-pending-payroll', 'candidate-payroll-004', {
    candidateType: 'output_review_pattern',
    learningKind: 'preference',
    domain: 'payroll',
    proposedLearning: 'Payroll review summaries should show missing employee identifiers first.',
    sourceTraceIds: ['evidence-source-payroll-004'],
    evidenceBundleId: 'evidence-bundle-stage13-payroll-004',
    evidenceItemIds: ['evidence-item-payroll-gap-004'],
    evidenceStrength: 'partial',
    missingEvidence: ['Eldad decision is pending.'],
    riskLevel: 'high',
    professionalReviewRequired: true,
    suggestedReuseScope: 'single_case_preview',
    reviewStatus: 'pending_eldad_review',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Pending Eldad review.'],
  }),
  createLearningPreview('learning-preview-approved-workflow', 'candidate-workflow-005', {
    candidateType: 'workflow_map_pattern',
    learningKind: 'workflow_pattern',
    domain: 'client_case_filing',
    proposedLearning: 'Approved evidence summaries may be reused as filing review prompts.',
    sourceTraceIds: ['evidence-source-case-005'],
    evidenceBundleId: 'evidence-bundle-stage13-case-005',
    evidenceItemIds: ['evidence-item-case-summary-005'],
    evidenceStrength: 'sufficient_for_preview',
    missingEvidence: [],
    riskLevel: 'high',
    professionalReviewRequired: true,
    suggestedReuseScope: 'workflow_preview',
    reviewStatus: 'approved_for_reuse_preview',
    eldadDecisionId: 'eldad-learning-decision-005',
    forbiddenReuseReasons: ['Preview-only approval cannot become binding knowledge.'],
  }),
  createLearningPreview('learning-preview-rejected-labor-law', 'candidate-labor-006', {
    candidateType: 'forbidden_learning_pattern',
    learningKind: 'domain_rule',
    domain: 'labor_law',
    proposedLearning: 'Legal conclusions cannot be generalized from one case.',
    sourceTraceIds: ['evidence-source-labor-006'],
    evidenceBundleId: 'evidence-bundle-stage13-labor-006',
    evidenceItemIds: ['evidence-item-labor-note-006'],
    evidenceStrength: 'weak',
    missingEvidence: ['Professional conclusion is not reusable.'],
    riskLevel: 'high',
    professionalReviewRequired: true,
    suggestedReuseScope: 'none',
    reviewStatus: 'rejected',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Rejected previews cannot be reused.'],
  }),
  createLearningPreview('learning-preview-deferred-compensation', 'candidate-comp-007', {
    candidateType: 'intake_metadata_pattern',
    learningKind: 'fact',
    domain: 'war_compensation',
    proposedLearning: 'Compensation claim patterns need more source diversity before reuse.',
    sourceTraceIds: ['evidence-source-comp-007'],
    evidenceBundleId: 'evidence-bundle-stage13-comp-007',
    evidenceItemIds: ['evidence-item-comp-claim-007'],
    evidenceStrength: 'partial',
    missingEvidence: ['More evidence bundles are needed.'],
    riskLevel: 'high',
    professionalReviewRequired: true,
    suggestedReuseScope: 'none',
    reviewStatus: 'deferred',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Deferred previews cannot be reused.'],
  }),
  createLearningPreview('learning-preview-blocked-expert', 'candidate-expert-008', {
    candidateType: 'forbidden_learning_pattern',
    learningKind: 'blocked_learning',
    domain: 'expert_opinions',
    proposedLearning: 'Expert opinion conclusions must never be learned automatically.',
    sourceTraceIds: ['evidence-source-expert-008'],
    evidenceBundleId: 'evidence-bundle-stage13-expert-008',
    evidenceItemIds: ['evidence-item-expert-opinion-008'],
    evidenceStrength: 'weak',
    missingEvidence: ['Binding expert knowledge is outside Stage 14 scope.'],
    riskLevel: 'critical',
    professionalReviewRequired: true,
    suggestedReuseScope: 'none',
    reviewStatus: 'blocked',
    eldadDecisionId: null,
    forbiddenReuseReasons: ['Blocked learning remains blocked.'],
  }),
] as const;
// #endregion
