/* ============================================
   FILE: local-workitem-preview.test.ts
   PURPOSE: Focused tests for the local-only WorkItem preview evaluator.
   DEPENDENCIES: vitest, local-workitem-preview
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { LocalDraftState } from '../../components/internal/local-draft/LocalDraftTypes';
import { createLocalWorkItemPreview } from './local-workitem-preview';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const taskCandidate = {
  taskCandidateId: 'scan-task-test',
  suggestedTitle: 'תיקיית סריקה: בדיקה',
  suggestedDescription: 'מועמד למשימה מתוך קבוצת סריקות. נדרש אישור אלדד לפני פתיחת משימה.',
  sourceGroupName: 'בדיקה',
  sourceFileNames: ['file-a.pdf', 'file-b.pdf'],
  sourceFilesCount: 2,
  evidenceBasis: {
    folderName: 'בדיקה',
    fileNamesPreview: ['file-a.pdf', 'file-b.pdf'],
    sourceCandidateIds: ['scan-candidate-a'],
  },
};

const createDefaultDraft = (overrides: Partial<LocalDraftState> = {}): LocalDraftState => ({
  taskCandidateId: 'scan-task-test',
  selectedDecision: null,
  proposedTaskTitle: '',
  matterDecision: 'unresolved',
  proposedMatterId: '',
  ownerDecision: 'unresolved',
  proposedOwner: '',
  dueDateDecision: 'unresolved',
  proposedDueDate: '',
  priorityDecision: 'unresolved',
  proposedPriority: '',
  evidenceReviewStatus: 'not_reviewed',
  ...overrides,
});

const createCompleteOpenTaskDraft = (overrides: Partial<LocalDraftState> = {}): LocalDraftState =>
  createDefaultDraft({
    selectedDecision: 'open_task',
    proposedTaskTitle: 'כותרת מקומית מאושרת',
    matterDecision: 'assign_existing_matter',
    proposedMatterId: 'matter-local-only',
    ownerDecision: 'assign_owner',
    proposedOwner: 'אלדד',
    dueDateDecision: 'set_due_date',
    proposedDueDate: '2026-05-15',
    priorityDecision: 'set_priority',
    proposedPriority: 'high',
    evidenceReviewStatus: 'reviewed_sufficient',
    ...overrides,
  });
// #endregion

// #region Tests
describe('createLocalWorkItemPreview', () => {
  it('returns blocked for empty/default local draft', () => {
    const preview = createLocalWorkItemPreview(createDefaultDraft(), taskCandidate);

    expect(preview.previewStatus).toBe('blocked');
    expect(preview.blockers).toEqual(['selectedDecision']);
    expect(preview.proposedWorkItem).toBeNull();
    expect(preview.canCreateWorkItem).toBe(false);
    expect(preview.wouldCreateWorkItem).toBe(false);
    expect(preview.sourceDecisionDraftLocalOnly).toBe(true);
  });

  it('returns blocked for open_task with missing required fields', () => {
    const preview = createLocalWorkItemPreview(
      createDefaultDraft({
        selectedDecision: 'open_task',
      }),
      taskCandidate,
    );

    expect(preview.previewStatus).toBe('blocked');
    expect(preview.proposedWorkItem).toBeNull();
    expect(preview.blockers).toEqual([
      'taskTitleApproval',
      'evidenceReview',
      'matterDecision',
      'ownerDecision',
      'dueDateDecision',
      'priorityDecision',
    ]);
  });

  it('returns blocked when conditional required fields are missing', () => {
    const preview = createLocalWorkItemPreview(
      createCompleteOpenTaskDraft({
        proposedMatterId: '',
        proposedOwner: '',
        proposedDueDate: '',
        proposedPriority: '',
      }),
      taskCandidate,
    );

    expect(preview.previewStatus).toBe('blocked');
    expect(preview.proposedWorkItem).toBeNull();
    expect(preview.blockers).toEqual(['proposedMatterId', 'proposedOwner', 'proposedDueDate', 'proposedPriority']);
  });

  it('returns not_applicable for ignore', () => {
    const preview = createLocalWorkItemPreview(createDefaultDraft({ selectedDecision: 'ignore' }), taskCandidate);

    expect(preview.previewStatus).toBe('not_applicable');
    expect(preview.proposedWorkItem).toBeNull();
    expect(preview.canCreateWorkItem).toBe(false);
    expect(preview.wouldCreateWorkItem).toBe(false);
  });

  it('returns not_applicable for defer', () => {
    const preview = createLocalWorkItemPreview(createDefaultDraft({ selectedDecision: 'defer' }), taskCandidate);

    expect(preview.previewStatus).toBe('not_applicable');
    expect(preview.proposedWorkItem).toBeNull();
  });

  it('returns not_applicable for merge', () => {
    const preview = createLocalWorkItemPreview(createDefaultDraft({ selectedDecision: 'merge' }), taskCandidate);

    expect(preview.previewStatus).toBe('not_applicable');
    expect(preview.proposedWorkItem).toBeNull();
  });

  it('returns ready dry-run preview for complete open_task draft', () => {
    const preview = createLocalWorkItemPreview(createCompleteOpenTaskDraft(), taskCandidate);

    expect(preview.previewStatus).toBe('ready');
    expect(preview.blockers).toEqual([]);
    expect(preview.canCreateWorkItem).toBe(false);
    expect(preview.wouldCreateWorkItem).toBe(false);
    expect(preview.generatedAtLocalOnly).toEqual(expect.any(String));
    expect(preview.proposedWorkItem).toEqual({
      title: 'כותרת מקומית מאושרת',
      description: taskCandidate.suggestedDescription,
      sourceEvidence: {
        sourceGroupName: 'בדיקה',
        sourceFileNames: ['file-a.pdf', 'file-b.pdf'],
        sourceFilesCount: 2,
        evidenceBasis: taskCandidate.evidenceBasis,
      },
      matterDecision: 'assign_existing_matter',
      proposedMatterId: 'matter-local-only',
      ownerDecision: 'assign_owner',
      proposedOwner: 'אלדד',
      dueDateDecision: 'set_due_date',
      proposedDueDate: '2026-05-15',
      priorityDecision: 'set_priority',
      proposedPriority: 'high',
      status: 'draft_preview_only',
    });
  });

  it('keeps proposedWorkItem null unless ready and create flags false for all statuses', () => {
    const previews = [
      createLocalWorkItemPreview(createDefaultDraft(), taskCandidate),
      createLocalWorkItemPreview(createDefaultDraft({ selectedDecision: 'ignore' }), taskCandidate),
      createLocalWorkItemPreview(createCompleteOpenTaskDraft(), taskCandidate),
    ];

    for (const preview of previews) {
      expect(preview.canCreateWorkItem).toBe(false);
      expect(preview.wouldCreateWorkItem).toBe(false);
      if (preview.previewStatus !== 'ready') {
        expect(preview.proposedWorkItem).toBeNull();
      }
    }
  });

  it('keeps the evaluator free of stores, persistence, and professional creation imports', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/local-workitem-preview.ts`, 'utf8');

    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
  });
});
// #endregion
