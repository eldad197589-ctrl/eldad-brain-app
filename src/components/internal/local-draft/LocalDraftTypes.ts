/* ============================================
   FILE: LocalDraftTypes.ts
   PURPOSE: Shared local-only draft editor types.
   DEPENDENCIES: manual-decision-draft types
   EXPORTS: Local draft editor state and prop types
   ============================================ */

// #region Imports
import type { ManualDecisionDraft } from '../../../work-spine/intake/manual-decision-draft';
// #endregion

// #region Types
export type LocalDraftSelectedDecision = 'open_task' | 'ignore' | 'defer' | 'merge';
export type LocalDraftMatterDecision = 'unresolved' | 'assign_existing_matter' | 'no_matter_needed';
export type LocalDraftOwnerDecision = 'unresolved' | 'assign_owner' | 'no_owner_needed';
export type LocalDraftDueDateDecision = 'unresolved' | 'set_due_date' | 'no_due_date_needed';
export type LocalDraftPriorityDecision = 'unresolved' | 'set_priority' | 'no_priority_needed';
export type LocalDraftPriority = '' | 'low' | 'medium' | 'high' | 'urgent';
export type LocalDraftEvidenceReviewStatus = 'not_reviewed' | 'reviewed_sufficient' | 'reviewed_insufficient';

export interface LocalDraftState {
  taskCandidateId: string;
  selectedDecision: LocalDraftSelectedDecision | null;
  proposedTaskTitle: string;
  matterDecision: LocalDraftMatterDecision;
  proposedMatterId: string;
  ownerDecision: LocalDraftOwnerDecision;
  proposedOwner: string;
  dueDateDecision: LocalDraftDueDateDecision;
  proposedDueDate: string;
  priorityDecision: LocalDraftPriorityDecision;
  proposedPriority: LocalDraftPriority;
  evidenceReviewStatus: LocalDraftEvidenceReviewStatus;
}

export interface LocalDraftEditorProps {
  taskCandidateId: string;
  suggestedTitle: string;
  suggestedDescription?: string;
  sourceGroupName?: string;
  sourceFileNames?: readonly string[];
  sampleSourceFileNames?: readonly string[];
  sourceFilesCount?: number;
  evidenceBasis?: unknown;
  initialDecisionDraft: ManualDecisionDraft;
}
// #endregion
