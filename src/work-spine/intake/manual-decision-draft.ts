/* ============================================
   FILE: manual-decision-draft.ts
   PURPOSE: Pure read-only derived manual decision draft for scanned intake task candidates.
   DEPENDENCIES: None
   EXPORTS: ManualDecisionDraft, createManualDecisionDraftFromTaskCandidate
   ============================================ */

// #region Types
export type ManualDecisionStatus = 'empty';
export type ManualDecisionEvidenceReviewStatus = 'not_reviewed';

export type ManualDecisionMissingBeforePreview =
  | 'selectedDecision'
  | 'taskTitleApproval'
  | 'matterDecision'
  | 'ownerDecision'
  | 'dueDateDecision'
  | 'priorityDecision'
  | 'evidenceReview';

export interface ManualDecisionDraftTaskCandidateInput {
  taskCandidateId: string;
}

export interface ManualDecisionDraft {
  decisionDraftId: string;
  taskCandidateId: string;
  decisionStatus: ManualDecisionStatus;
  selectedDecision: null;
  proposedTaskTitle: null;
  proposedMatterId: null;
  proposedOwner: null;
  proposedDueDate: null;
  proposedPriority: null;
  proposedEvidenceReviewStatus: ManualDecisionEvidenceReviewStatus;
  canCreateWorkItem: false;
  canGenerateWorkItemPreview: false;
  requiresExplicitEldadApproval: true;
  missingBeforePreview: readonly ManualDecisionMissingBeforePreview[];
}
// #endregion

// #region Constants
const MISSING_BEFORE_PREVIEW: readonly ManualDecisionMissingBeforePreview[] = [
  'selectedDecision',
  'taskTitleApproval',
  'matterDecision',
  'ownerDecision',
  'dueDateDecision',
  'priorityDecision',
  'evidenceReview',
];
// #endregion

// #region Factory
export function createManualDecisionDraftFromTaskCandidate(
  taskCandidate: ManualDecisionDraftTaskCandidateInput,
): ManualDecisionDraft {
  return {
    decisionDraftId: `manual-decision-draft:${taskCandidate.taskCandidateId}`,
    taskCandidateId: taskCandidate.taskCandidateId,
    decisionStatus: 'empty',
    selectedDecision: null,
    proposedTaskTitle: null,
    proposedMatterId: null,
    proposedOwner: null,
    proposedDueDate: null,
    proposedPriority: null,
    proposedEvidenceReviewStatus: 'not_reviewed',
    canCreateWorkItem: false,
    canGenerateWorkItemPreview: false,
    requiresExplicitEldadApproval: true,
    missingBeforePreview: MISSING_BEFORE_PREVIEW,
  };
}
// #endregion
