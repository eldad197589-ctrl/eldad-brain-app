/* ============================================
   FILE: LocalDraftCompleteness.ts
   PURPOSE: Pure local draft initialization and completeness helpers.
   DEPENDENCIES: manual-decision-draft types, LocalDraftTypes
   EXPORTS: createInitialDraftState, isLocalDraftComplete
   ============================================ */

// #region Imports
import type { ManualDecisionDraft } from '../../../work-spine/intake/manual-decision-draft';
import type { LocalDraftState } from './LocalDraftTypes';
// #endregion

// #region Helpers
export const createInitialDraftState = (
  taskCandidateId: string,
  initialDecisionDraft: ManualDecisionDraft,
): LocalDraftState => ({
  taskCandidateId,
  selectedDecision: initialDecisionDraft.selectedDecision,
  proposedTaskTitle: initialDecisionDraft.proposedTaskTitle ?? '',
  matterDecision: 'unresolved',
  proposedMatterId: '',
  ownerDecision: 'unresolved',
  proposedOwner: '',
  dueDateDecision: 'unresolved',
  proposedDueDate: '',
  priorityDecision: 'unresolved',
  proposedPriority: '',
  evidenceReviewStatus: 'not_reviewed',
});

export const isLocalDraftComplete = (draft: LocalDraftState): boolean => {
  if (!draft.selectedDecision) return false;
  if (draft.proposedTaskTitle.trim() === '') return false;
  if (draft.evidenceReviewStatus !== 'reviewed_sufficient') return false;
  if (draft.matterDecision === 'unresolved') return false;
  if (draft.ownerDecision === 'unresolved') return false;
  if (draft.dueDateDecision === 'unresolved') return false;
  if (draft.priorityDecision === 'unresolved') return false;
  if (draft.matterDecision === 'assign_existing_matter' && draft.proposedMatterId.trim() === '') return false;
  if (draft.ownerDecision === 'assign_owner' && draft.proposedOwner.trim() === '') return false;
  if (draft.dueDateDecision === 'set_due_date' && draft.proposedDueDate.trim() === '') return false;
  if (draft.priorityDecision === 'set_priority' && draft.proposedPriority === '') return false;
  return true;
};
// #endregion
