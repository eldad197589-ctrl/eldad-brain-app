/* ============================================
   FILE: LocalDraftEditor.tsx
   PURPOSE: Component-local draft editor for scanned intake task candidates.
   DEPENDENCIES: React, local draft helper components and types
   EXPORTS: LocalDraftEditor (default)
   ============================================ */

// #region Imports
import { useState } from 'react';
import { createLocalWorkItemPreview } from '../../work-spine/intake/local-workitem-preview';
import { createInitialDraftState, isLocalDraftComplete } from './local-draft/LocalDraftCompleteness';
import { LocalDraftDecisionFields } from './local-draft/LocalDraftDecisionFields';
import { LocalDraftSummary } from './local-draft/LocalDraftSummary';
import { LocalWorkItemPreviewDisplay } from './local-draft/LocalWorkItemPreviewDisplay';
import type {
  LocalDraftDueDateDecision,
  LocalDraftEditorProps,
  LocalDraftEvidenceReviewStatus,
  LocalDraftMatterDecision,
  LocalDraftOwnerDecision,
  LocalDraftPriority,
  LocalDraftPriorityDecision,
  LocalDraftSelectedDecision,
  LocalDraftState,
} from './local-draft/LocalDraftTypes';
export type {
  LocalDraftDueDateDecision,
  LocalDraftEditorProps,
  LocalDraftEvidenceReviewStatus,
  LocalDraftMatterDecision,
  LocalDraftOwnerDecision,
  LocalDraftPriority,
  LocalDraftPriorityDecision,
  LocalDraftSelectedDecision,
  LocalDraftState,
} from './local-draft/LocalDraftTypes';
// #endregion

// #region Component
export default function LocalDraftEditor({
  taskCandidateId,
  suggestedTitle,
  suggestedDescription,
  sourceGroupName,
  sourceFileNames,
  sampleSourceFileNames,
  sourceFilesCount,
  evidenceBasis,
  initialDecisionDraft,
}: LocalDraftEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState<LocalDraftState>(() => createInitialDraftState(taskCandidateId, initialDecisionDraft));
  const isComplete = isLocalDraftComplete(draft);
  const preview = createLocalWorkItemPreview(draft, {
    taskCandidateId,
    suggestedTitle,
    suggestedDescription,
    sourceGroupName,
    sourceFileNames,
    sampleSourceFileNames,
    sourceFilesCount,
    evidenceBasis,
  });

  const resetDraft = () => {
    setDraft(createInitialDraftState(taskCandidateId, initialDecisionDraft));
  };

  const updateMatterDecision = (matterDecision: LocalDraftMatterDecision) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      matterDecision,
      proposedMatterId: matterDecision === 'assign_existing_matter' ? currentDraft.proposedMatterId : '',
    }));
  };

  const updateOwnerDecision = (ownerDecision: LocalDraftOwnerDecision) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ownerDecision,
      proposedOwner: ownerDecision === 'assign_owner' ? currentDraft.proposedOwner : '',
    }));
  };

  const updateDueDateDecision = (dueDateDecision: LocalDraftDueDateDecision) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      dueDateDecision,
      proposedDueDate: dueDateDecision === 'set_due_date' ? currentDraft.proposedDueDate : '',
    }));
  };

  const updatePriorityDecision = (priorityDecision: LocalDraftPriorityDecision) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      priorityDecision,
      proposedPriority: priorityDecision === 'set_priority' ? currentDraft.proposedPriority : '',
    }));
  };

  return (
    <section
      data-testid={`local-draft-editor-${taskCandidateId}`}
      style={{
        borderTop: '1px solid rgba(148, 163, 184, 0.16)',
        paddingTop: 12,
        display: 'grid',
        gap: 12,
      }}
      dir="rtl"
    >
      <LocalDraftSummary
        draft={draft}
        isComplete={isComplete}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((currentValue) => !currentValue)}
      />

      {isExpanded ? (
        <LocalDraftDecisionFields
          draft={draft}
          suggestedTitle={suggestedTitle}
          onSelectedDecisionChange={(selectedDecision: LocalDraftSelectedDecision | null) =>
            setDraft((currentDraft) => ({ ...currentDraft, selectedDecision }))
          }
          onProposedTaskTitleChange={(proposedTaskTitle: string) =>
            setDraft((currentDraft) => ({ ...currentDraft, proposedTaskTitle }))
          }
          onMatterDecisionChange={updateMatterDecision}
          onProposedMatterIdChange={(proposedMatterId: string) =>
            setDraft((currentDraft) => ({ ...currentDraft, proposedMatterId }))
          }
          onOwnerDecisionChange={updateOwnerDecision}
          onProposedOwnerChange={(proposedOwner: string) => setDraft((currentDraft) => ({ ...currentDraft, proposedOwner }))}
          onDueDateDecisionChange={updateDueDateDecision}
          onProposedDueDateChange={(proposedDueDate: string) =>
            setDraft((currentDraft) => ({ ...currentDraft, proposedDueDate }))
          }
          onPriorityDecisionChange={updatePriorityDecision}
          onProposedPriorityChange={(proposedPriority: LocalDraftPriority) =>
            setDraft((currentDraft) => ({ ...currentDraft, proposedPriority }))
          }
          onEvidenceReviewStatusChange={(evidenceReviewStatus: LocalDraftEvidenceReviewStatus) =>
            setDraft((currentDraft) => ({ ...currentDraft, evidenceReviewStatus }))
          }
          onReset={resetDraft}
        />
      ) : null}

      <LocalWorkItemPreviewDisplay preview={preview} />
    </section>
  );
}
// #endregion
