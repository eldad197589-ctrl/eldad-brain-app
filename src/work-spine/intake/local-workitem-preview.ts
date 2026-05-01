/* ============================================
   FILE: local-workitem-preview.ts
   PURPOSE: Pure local-only evaluator for dry-run WorkItem previews.
   DEPENDENCIES: LocalDraftTypes
   EXPORTS: LocalWorkItemPreview, createLocalWorkItemPreview
   ============================================ */

// #region Imports
import type {
  LocalDraftDueDateDecision,
  LocalDraftMatterDecision,
  LocalDraftOwnerDecision,
  LocalDraftPriority,
  LocalDraftPriorityDecision,
  LocalDraftState,
} from '../../components/internal/local-draft/LocalDraftTypes';
// #endregion

// #region Types
export type LocalWorkItemPreviewStatus = 'blocked' | 'not_applicable' | 'ready';

export type LocalWorkItemPreviewBlocker =
  | 'selectedDecision'
  | 'taskTitleApproval'
  | 'matterDecision'
  | 'proposedMatterId'
  | 'ownerDecision'
  | 'proposedOwner'
  | 'dueDateDecision'
  | 'proposedDueDate'
  | 'priorityDecision'
  | 'proposedPriority'
  | 'evidenceReview';

export interface LocalWorkItemPreviewTaskCandidateInput {
  taskCandidateId: string;
  suggestedTitle: string;
  suggestedDescription?: string;
  sourceGroupName?: string;
  sourceFileNames?: readonly string[];
  sampleSourceFileNames?: readonly string[];
  sourceFilesCount?: number;
  evidenceBasis?: unknown;
}

export interface LocalWorkItemPreviewSourceEvidence {
  sourceGroupName?: string;
  sourceFileNames: readonly string[];
  sourceFilesCount: number;
  evidenceBasis?: unknown;
}

export interface LocalWorkItemPreviewProposedWorkItem {
  title: string;
  description: string;
  sourceEvidence: LocalWorkItemPreviewSourceEvidence;
  matterDecision: LocalDraftMatterDecision;
  proposedMatterId: string | null;
  ownerDecision: LocalDraftOwnerDecision;
  proposedOwner: string | null;
  dueDateDecision: LocalDraftDueDateDecision;
  proposedDueDate: string | null;
  priorityDecision: LocalDraftPriorityDecision;
  proposedPriority: Exclude<LocalDraftPriority, ''> | null;
  status: 'draft_preview_only';
}

export interface LocalWorkItemPreview {
  previewId: string;
  sourceTaskCandidateId: string;
  sourceDecisionDraftLocalOnly: true;
  previewStatus: LocalWorkItemPreviewStatus;
  canCreateWorkItem: false;
  wouldCreateWorkItem: false;
  proposedWorkItem: LocalWorkItemPreviewProposedWorkItem | null;
  blockers: readonly LocalWorkItemPreviewBlocker[];
  warnings: readonly string[];
  generatedAtLocalOnly: string;
}
// #endregion

// #region Helpers
const getSourceFileNames = (taskCandidate: LocalWorkItemPreviewTaskCandidateInput): readonly string[] =>
  taskCandidate.sourceFileNames ?? taskCandidate.sampleSourceFileNames ?? [];

const getSourceFilesCount = (taskCandidate: LocalWorkItemPreviewTaskCandidateInput): number =>
  taskCandidate.sourceFilesCount ?? getSourceFileNames(taskCandidate).length;

const isFilled = (value: string): boolean => value.trim() !== '';

const getOpenTaskBlockers = (localDraft: LocalDraftState): LocalWorkItemPreviewBlocker[] => {
  const blockers: LocalWorkItemPreviewBlocker[] = [];

  if (localDraft.proposedTaskTitle.trim() === '') blockers.push('taskTitleApproval');
  if (localDraft.evidenceReviewStatus !== 'reviewed_sufficient') blockers.push('evidenceReview');
  if (localDraft.matterDecision === 'unresolved') blockers.push('matterDecision');
  if (localDraft.ownerDecision === 'unresolved') blockers.push('ownerDecision');
  if (localDraft.dueDateDecision === 'unresolved') blockers.push('dueDateDecision');
  if (localDraft.priorityDecision === 'unresolved') blockers.push('priorityDecision');
  if (localDraft.matterDecision === 'assign_existing_matter' && !isFilled(localDraft.proposedMatterId)) {
    blockers.push('proposedMatterId');
  }
  if (localDraft.ownerDecision === 'assign_owner' && !isFilled(localDraft.proposedOwner)) {
    blockers.push('proposedOwner');
  }
  if (localDraft.dueDateDecision === 'set_due_date' && !isFilled(localDraft.proposedDueDate)) {
    blockers.push('proposedDueDate');
  }
  if (localDraft.priorityDecision === 'set_priority' && localDraft.proposedPriority === '') {
    blockers.push('proposedPriority');
  }

  return blockers;
};

const createBasePreview = (
  localDraft: LocalDraftState,
  taskCandidate: LocalWorkItemPreviewTaskCandidateInput,
  previewStatus: LocalWorkItemPreviewStatus,
  blockers: readonly LocalWorkItemPreviewBlocker[],
  proposedWorkItem: LocalWorkItemPreviewProposedWorkItem | null,
): LocalWorkItemPreview => ({
  previewId: `local-workitem-preview:${taskCandidate.taskCandidateId}`,
  sourceTaskCandidateId: taskCandidate.taskCandidateId,
  sourceDecisionDraftLocalOnly: true,
  previewStatus,
  canCreateWorkItem: false,
  wouldCreateWorkItem: false,
  proposedWorkItem,
  blockers,
  warnings: [],
  generatedAtLocalOnly: new Date().toISOString(),
});

const createReadyProposedWorkItem = (
  localDraft: LocalDraftState,
  taskCandidate: LocalWorkItemPreviewTaskCandidateInput,
): LocalWorkItemPreviewProposedWorkItem => ({
  title: localDraft.proposedTaskTitle.trim(),
  description:
    taskCandidate.suggestedDescription ??
    'תצוגת משימה מקומית מתוך מועמד סריקה. לא נשמרה ולא נפתחה משימה.',
  sourceEvidence: {
    sourceGroupName: taskCandidate.sourceGroupName,
    sourceFileNames: getSourceFileNames(taskCandidate),
    sourceFilesCount: getSourceFilesCount(taskCandidate),
    evidenceBasis: taskCandidate.evidenceBasis,
  },
  matterDecision: localDraft.matterDecision,
  proposedMatterId: localDraft.matterDecision === 'assign_existing_matter' ? localDraft.proposedMatterId.trim() : null,
  ownerDecision: localDraft.ownerDecision,
  proposedOwner: localDraft.ownerDecision === 'assign_owner' ? localDraft.proposedOwner.trim() : null,
  dueDateDecision: localDraft.dueDateDecision,
  proposedDueDate: localDraft.dueDateDecision === 'set_due_date' ? localDraft.proposedDueDate.trim() : null,
  priorityDecision: localDraft.priorityDecision,
  proposedPriority: localDraft.priorityDecision === 'set_priority' ? (localDraft.proposedPriority as Exclude<LocalDraftPriority, ''>) : null,
  status: 'draft_preview_only',
});
// #endregion

// #region Public API
export function createLocalWorkItemPreview(
  localDraft: LocalDraftState,
  taskCandidate: LocalWorkItemPreviewTaskCandidateInput,
): LocalWorkItemPreview {
  if (!localDraft.selectedDecision) {
    return createBasePreview(localDraft, taskCandidate, 'blocked', ['selectedDecision'], null);
  }

  if (localDraft.selectedDecision !== 'open_task') {
    return createBasePreview(localDraft, taskCandidate, 'not_applicable', [], null);
  }

  const blockers = getOpenTaskBlockers(localDraft);
  if (blockers.length > 0) {
    return createBasePreview(localDraft, taskCandidate, 'blocked', blockers, null);
  }

  return createBasePreview(localDraft, taskCandidate, 'ready', [], createReadyProposedWorkItem(localDraft, taskCandidate));
}
// #endregion
