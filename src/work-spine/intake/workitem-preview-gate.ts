/* ============================================
   FILE: workitem-preview-gate.ts
   PURPOSE: Pure blocked dry-run gate for future WorkItem previews.
   DEPENDENCIES: manual-decision-draft types
   EXPORTS: WorkItemPreviewGate, createBlockedWorkItemPreviewGate
   ============================================ */

// #region Imports
import type { ManualDecisionDraft, ManualDecisionMissingBeforePreview } from './manual-decision-draft';
// #endregion

// #region Types
export type WorkItemPreviewBlocker = ManualDecisionMissingBeforePreview;

export interface WorkItemPreviewGate {
  previewId: string;
  sourceTaskCandidateId: string;
  sourceDecisionDraftId: string;
  previewStatus: 'blocked';
  canCreateWorkItem: false;
  wouldCreateWorkItem: false;
  proposedWorkItem: null;
  blockers: readonly WorkItemPreviewBlocker[];
  warnings: readonly string[];
}
// #endregion

// #region Factory
export function createBlockedWorkItemPreviewGate(decisionDraft: ManualDecisionDraft): WorkItemPreviewGate {
  return {
    previewId: `blocked-workitem-preview:${decisionDraft.decisionDraftId}`,
    sourceTaskCandidateId: decisionDraft.taskCandidateId,
    sourceDecisionDraftId: decisionDraft.decisionDraftId,
    previewStatus: 'blocked',
    canCreateWorkItem: false,
    wouldCreateWorkItem: false,
    proposedWorkItem: null,
    blockers: decisionDraft.missingBeforePreview,
    warnings: [],
  };
}
// #endregion
