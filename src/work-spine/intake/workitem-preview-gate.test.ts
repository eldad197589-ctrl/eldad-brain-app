/* ============================================
   FILE: workitem-preview-gate.test.ts
   PURPOSE: Focused tests for the blocked WorkItem preview gate.
   DEPENDENCIES: vitest, manual-decision-draft, workitem-preview-gate
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { createManualDecisionDraftFromTaskCandidate } from './manual-decision-draft';
import { createBlockedWorkItemPreviewGate } from './workitem-preview-gate';
// #endregion

// #region Tests
describe('createBlockedWorkItemPreviewGate', () => {
  it('returns a blocked gate without creating a proposed WorkItem', () => {
    const decisionDraft = createManualDecisionDraftFromTaskCandidate({
      taskCandidateId: 'scan-task-test',
    });

    const gate = createBlockedWorkItemPreviewGate(decisionDraft);

    expect(gate.previewId).toBe(`blocked-workitem-preview:${decisionDraft.decisionDraftId}`);
    expect(gate.sourceTaskCandidateId).toBe('scan-task-test');
    expect(gate.sourceDecisionDraftId).toBe(decisionDraft.decisionDraftId);
    expect(gate.previewStatus).toBe('blocked');
    expect(gate.canCreateWorkItem).toBe(false);
    expect(gate.wouldCreateWorkItem).toBe(false);
    expect(gate.proposedWorkItem).toBeNull();
    expect(gate.blockers).toEqual([
      'selectedDecision',
      'taskTitleApproval',
      'matterDecision',
      'ownerDecision',
      'dueDateDecision',
      'priorityDecision',
      'evidenceReview',
    ]);
    expect(gate.warnings).toEqual([]);
  });
});
// #endregion
