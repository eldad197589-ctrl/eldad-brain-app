/* ============================================
   FILE: scanned-intake-task-candidates.test.ts
   PURPOSE: Focused tests for scanned intake task candidate mapping.
   DEPENDENCIES: vitest, node fs, scanned-intake-task-candidates
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  ScannedIntakeStagingCandidate,
  ScannedIntakeStagingGroup,
  ScannedIntakeStagingResult,
} from './scanned-intake-staging';
import { createTaskCandidatesFromScannedIntake } from './scanned-intake-task-candidates';
// #endregion

// #region Fixtures
const sourceGroupNamesForHardRegression = [
  'אוזנה ניסים טיפול מס',
  'חשבונות כרטיסי אשראי ודפי בנק אלדד לניתוח',
  'טיפול בחובות מי אשקלון',
  'טיפול בתשלום אמבולנס פינוי אמא של אלדד',
  'טיפול שוטף רוביום',
  'מסמכים בכורי פריש בדיקת דיני עבודה',
];

const createCandidate = (sourceGroupName: string, index: number): ScannedIntakeStagingCandidate => ({
  candidateId: `scan-${index}`,
  sourceChannel: 'scan',
  fileName: `source-${index}.pdf`,
  extension: '.pdf',
  absolutePath: `C:/scans/${sourceGroupName}/source-${index}.pdf`,
  relativePathFromRoot: `${sourceGroupName}/source-${index}.pdf`,
  parentFolderName: sourceGroupName,
  folderPath: `C:/scans/${sourceGroupName}`,
  sourceRoot: 'C:/scans',
  sizeBytes: 100 + index,
  createdAt: '2026-04-29T00:00:00.000Z',
  modifiedAt: `2026-04-29T00:${String(index).padStart(2, '0')}:00.000Z`,
  ocrStatus: 'not_processed',
  intakeStatus: 'staging_candidate',
  suggestedContextFromFolderName: sourceGroupName,
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  warnings: [],
});

const createGroup = (sourceGroupName: string, candidates: ScannedIntakeStagingCandidate[]): ScannedIntakeStagingGroup => ({
  groupKey: `C:/scans/${sourceGroupName}`,
  folderPath: `C:/scans/${sourceGroupName}`,
  parentFolderName: sourceGroupName,
  suggestedContextFromFolderName: sourceGroupName,
  count: candidates.length,
  candidates,
  warnings: [],
});

const createStagingResult = (): ScannedIntakeStagingResult => {
  const candidates = [
    createCandidate('טיפול בחובות מי אשקלון', 1),
    createCandidate('טיפול בחובות מי אשקלון', 2),
    createCandidate('מסמכים בכורי פריש', 3),
  ];

  return {
    candidates,
    groupedCandidates: [
      createGroup('טיפול בחובות מי אשקלון', candidates.slice(0, 2)),
      createGroup('מסמכים בכורי פריש', candidates.slice(2)),
    ],
    counts: {
      totalCandidates: 3,
      groupsCount: 2,
      warningsCount: 0,
      sourceFilesCount: 3,
    },
    warnings: [],
  };
};

const createHardRegressionStagingResult = (): ScannedIntakeStagingResult => {
  const candidates = sourceGroupNamesForHardRegression.map((sourceGroupName, index) =>
    createCandidate(sourceGroupName, index + 1)
  );

  return {
    candidates,
    groupedCandidates: sourceGroupNamesForHardRegression.map((sourceGroupName, index) =>
      createGroup(sourceGroupName, [candidates[index]])
    ),
    counts: {
      totalCandidates: candidates.length,
      groupsCount: sourceGroupNamesForHardRegression.length,
      warningsCount: 0,
      sourceFilesCount: candidates.length,
    },
    warnings: [],
  };
};
// #endregion

// #region Tests
describe('createTaskCandidatesFromScannedIntake', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates one source-backed task candidate per scanned intake group', () => {
    const result = createTaskCandidatesFromScannedIntake(createStagingResult());

    expect(result.counts).toEqual({
      totalTaskCandidates: 2,
      sourceGroupsCount: 2,
      warningsCount: 1,
    });
    expect(result.taskCandidates).toHaveLength(2);
    expect(result.taskCandidates[0]).toMatchObject({
      sourceType: 'scan_group',
      sourceCandidateIds: ['scan-1', 'scan-2'],
      sourceGroupName: 'טיפול בחובות מי אשקלון',
      sourceFileNames: ['source-1.pdf', 'source-2.pdf'],
      suggestedTitle: 'תיקיית סריקה: טיפול בחובות מי אשקלון',
      titleSource: 'auto_folder_name',
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      evidenceBasis: {
        folderName: 'טיפול בחובות מי אשקלון',
        fileNamesPreview: ['source-1.pdf', 'source-2.pdf'],
        sourceCandidateIds: ['scan-1', 'scan-2'],
      },
    });
    expect(result.taskCandidates[1]?.sourceCandidateIds).toEqual(['scan-3']);
  });

  it('preserves exact sourceGroupName in suggestedTitle even when warnings exist', () => {
    const result = createTaskCandidatesFromScannedIntake(createHardRegressionStagingResult());

    expect(result.taskCandidates).toHaveLength(sourceGroupNamesForHardRegression.length);

    for (const sourceGroupName of sourceGroupNamesForHardRegression) {
      const candidate = result.taskCandidates.find((item) => item.sourceGroupName === sourceGroupName);

      expect(candidate).toBeDefined();
      expect(candidate?.sourceGroupName).toBe(sourceGroupName);
      expect(candidate?.suggestedTitle).toBe(`תיקיית סריקה: ${sourceGroupName}`);
      expect(candidate?.titleSource).toBe('auto_folder_name');
      expect(candidate?.suggestedTitle.includes('קבוצה')).toBe(sourceGroupName.includes('קבוצה'));
      if (candidate?.warnings.some((warning) => warning.code === 'source_group_name_contains_action_verb')) {
        expect(candidate.suggestedTitle).toBe(`תיקיית סריקה: ${sourceGroupName}`);
      }
    }
  });

  it('keeps warning metadata without altering titles', () => {
    const result = createTaskCandidatesFromScannedIntake(createStagingResult());
    const warningCandidate = result.taskCandidates[0];

    expect(warningCandidate?.warnings.map((warning) => warning.code)).toEqual(['source_group_name_contains_action_verb']);
    expect(warningCandidate?.sourceGroupName).toBe('טיפול בחובות מי אשקלון');
    expect(warningCandidate?.suggestedTitle).toBe('תיקיית סריקה: טיפול בחובות מי אשקלון');
    expect(result.warnings).toHaveLength(1);
  });

  it('requires Eldad approval and never assigns due date, matter, owner, or priority', () => {
    const result = createTaskCandidatesFromScannedIntake(createStagingResult());

    for (const candidate of result.taskCandidates) {
      expect(candidate.requiresEldadApproval).toBe(true);
      expect(candidate.suggestedDueDate).toBeNull();
      expect(candidate.suggestedMatterId).toBeNull();
      expect(candidate.suggestedOwner).toBeNull();
      expect(candidate.suggestedPriority).toBeNull();
      expect(candidate.confidence).toBe('low');
      expect(candidate.taskStatus).toBe('candidate');
    }
  });

  it('does not create operational records or recurring tasks', () => {
    const result = createTaskCandidatesFromScannedIntake(createStagingResult());
    const candidateRecord = result.taskCandidates[0] as unknown as Record<string, unknown>;

    expect(candidateRecord.workItemId).toBeUndefined();
    expect(candidateRecord.processInstanceId).toBeUndefined();
    expect(candidateRecord.matterId).toBeUndefined();
    expect(candidateRecord.documentRefId).toBeUndefined();
    expect(candidateRecord.intakeEventId).toBeUndefined();
    expect(candidateRecord.intakeAttachmentId).toBeUndefined();
    expect(candidateRecord.recurringRuleId).toBeUndefined();
    expect(candidateRecord.recurrence).toBeUndefined();
  });

  it('does not write to storage and does not import stores or creation flows', async () => {
    const setItem = vi.fn();
    const indexedOpen = vi.fn();
    const fetchSpy = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.stubGlobal('indexedDB', { open: indexedOpen, deleteDatabase: vi.fn() });
    vi.stubGlobal('fetch', fetchSpy);

    createTaskCandidatesFromScannedIntake(createStagingResult());
    const source = await readFile('src/work-spine/intake/scanned-intake-task-candidates.ts', 'utf8');

    expect(setItem).not.toHaveBeenCalled();
    expect(indexedOpen).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('rename(');
    expect(source).not.toContain('unlink(');
    expect(source).not.toContain('rm(');
    expect(source).not.toContain('DocumentRef');
    expect(source).not.toContain('IntakeEvent');
    expect(source).not.toContain('IntakeAttachment');
  });

  it('handles empty staging results safely', () => {
    const emptyResult: ScannedIntakeStagingResult = {
      candidates: [],
      groupedCandidates: [],
      counts: {
        totalCandidates: 0,
        groupsCount: 0,
        warningsCount: 0,
        sourceFilesCount: 0,
      },
      warnings: [],
    };

    const result = createTaskCandidatesFromScannedIntake(emptyResult);

    expect(result).toEqual({
      taskCandidates: [],
      counts: {
        totalTaskCandidates: 0,
        sourceGroupsCount: 0,
        warningsCount: 0,
      },
      warnings: [],
    });
  });
});
// #endregion
