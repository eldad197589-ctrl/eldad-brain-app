/* ============================================
   FILE: scanned-intake-task-candidates.ts
   PURPOSE: Pure in-memory mapper from scanned intake staging groups to task candidates.
   DEPENDENCIES: scanned-intake-staging types
   EXPORTS: createTaskCandidatesFromScannedIntake and related types
   ============================================ */

// #region Imports
import type { ScannedIntakeStagingGroup, ScannedIntakeStagingResult } from './scanned-intake-staging';
// #endregion

// #region Types
export type ScannedIntakeTaskCandidateSourceType = 'scan_group' | 'scan_file' | 'manual';
export type ScannedIntakeTaskCandidateTitleSource = 'auto_folder_name' | 'auto_file_name' | 'manual';
export type ScannedIntakeTaskCandidateConfidence = 'low' | 'medium' | 'manual';
export type ScannedIntakeTaskCandidateStatus = 'candidate';

export type ScannedIntakeTaskCandidateWarningCode =
  | 'missing_source_candidate_ids'
  | 'missing_source_group_name'
  | 'source_group_name_contains_action_verb';

export interface ScannedIntakeTaskCandidateWarning {
  code: ScannedIntakeTaskCandidateWarningCode;
  message: string;
  taskCandidateId?: string;
  sourceGroupName?: string;
}

export interface ScannedIntakeTaskCandidateEvidenceBasis {
  folderName?: string;
  fileNamesPreview: string[];
  sourceCandidateIds: string[];
}

export interface ScannedIntakeTaskCandidate {
  taskCandidateId: string;
  sourceType: ScannedIntakeTaskCandidateSourceType;
  sourceCandidateIds: string[];
  sourceGroupName?: string;
  sourceFileNames: string[];
  suggestedTitle: string;
  titleSource: ScannedIntakeTaskCandidateTitleSource;
  suggestedDescription: string;
  evidenceBasis: ScannedIntakeTaskCandidateEvidenceBasis;
  confidence: ScannedIntakeTaskCandidateConfidence;
  taskStatus: ScannedIntakeTaskCandidateStatus;
  requiresEldadApproval: true;
  suggestedDueDate: null;
  suggestedMatterId: null;
  suggestedOwner: null;
  suggestedPriority: null;
  warnings: ScannedIntakeTaskCandidateWarning[];
}

export interface ScannedIntakeTaskCandidateCounts {
  totalTaskCandidates: number;
  sourceGroupsCount: number;
  warningsCount: number;
}

export interface ScannedIntakeTaskCandidateResult {
  taskCandidates: ScannedIntakeTaskCandidate[];
  counts: ScannedIntakeTaskCandidateCounts;
  warnings: ScannedIntakeTaskCandidateWarning[];
}
// #endregion

// #region Constants
const FORBIDDEN_TITLE_WORDS = ['בדוק', 'בדיקת', 'טפל', 'טיפול', 'שלח', 'הגש', 'דווח', 'סווג', 'הפק', 'אשר'];
// #endregion

// #region Helpers
const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const includesForbiddenTitleWord = (value: string): boolean =>
  FORBIDDEN_TITLE_WORDS.some((word) => value.includes(word));

const getSourceGroupName = (group: ScannedIntakeStagingGroup): string | undefined =>
  group.parentFolderName ?? group.suggestedContextFromFolderName ?? group.groupKey;

const createTaskCandidateId = (group: ScannedIntakeStagingGroup, sourceCandidateIds: string[]): string => {
  const seed = ['scan-task-candidate', group.groupKey, getSourceGroupName(group) ?? '', ...sourceCandidateIds].join('|');
  return `scan-task-${stableHash(seed)}`;
};

const createWarnings = (
  taskCandidateId: string,
  sourceGroupName: string | undefined,
  sourceCandidateIds: string[]
): ScannedIntakeTaskCandidateWarning[] => {
  const warnings: ScannedIntakeTaskCandidateWarning[] = [];

  if (sourceCandidateIds.length === 0) {
    warnings.push({
      code: 'missing_source_candidate_ids',
      message: 'Task candidate has no source staging candidate ids.',
      taskCandidateId,
      sourceGroupName,
    });
  }

  if (!sourceGroupName) {
    warnings.push({
      code: 'missing_source_group_name',
      message: 'Task candidate source group name is missing.',
      taskCandidateId,
    });
  }

  if (sourceGroupName && includesForbiddenTitleWord(sourceGroupName)) {
    warnings.push({
      code: 'source_group_name_contains_action_verb',
      message: 'Source group name contains instruction-like wording; warning is metadata only and does not alter the title.',
      taskCandidateId,
      sourceGroupName,
    });
  }

  return warnings;
};
// #endregion

// #region Public API
/**
 * Creates review-only task candidates from scanned intake staging groups.
 * The result is not an operational task queue and does not assign owners, dates, priorities, matters, or professional status.
 */
export function createTaskCandidatesFromScannedIntake(
  stagingResult: ScannedIntakeStagingResult
): ScannedIntakeTaskCandidateResult {
  const warnings: ScannedIntakeTaskCandidateWarning[] = [];

  const taskCandidates = stagingResult.groupedCandidates.map((group) => {
    const sourceGroupName = getSourceGroupName(group);
    const sourceCandidateIds = group.candidates.map((candidate) => candidate.candidateId);
    const sourceFileNames = group.candidates.map((candidate) => candidate.fileName);
    const taskCandidateId = createTaskCandidateId(group, sourceCandidateIds);
    const candidateWarnings = createWarnings(taskCandidateId, sourceGroupName, sourceCandidateIds);
    const suggestedTitle = `תיקיית סריקה: ${sourceGroupName}`;
    warnings.push(...candidateWarnings);

    return {
      taskCandidateId,
      sourceType: 'scan_group',
      sourceCandidateIds,
      sourceGroupName,
      sourceFileNames,
      suggestedTitle,
      titleSource: 'auto_folder_name',
      suggestedDescription: 'מועמד למשימה מתוך קבוצת סריקות. נדרש אישור אלדד לפני פתיחת משימה.',
      evidenceBasis: {
        folderName: sourceGroupName,
        fileNamesPreview: sourceFileNames.slice(0, 3),
        sourceCandidateIds,
      },
      confidence: 'low',
      taskStatus: 'candidate',
      requiresEldadApproval: true,
      suggestedDueDate: null,
      suggestedMatterId: null,
      suggestedOwner: null,
      suggestedPriority: null,
      warnings: candidateWarnings,
    } satisfies ScannedIntakeTaskCandidate;
  });

  return {
    taskCandidates,
    counts: {
      totalTaskCandidates: taskCandidates.length,
      sourceGroupsCount: stagingResult.groupedCandidates.length,
      warningsCount: warnings.length,
    },
    warnings,
  };
}
// #endregion
