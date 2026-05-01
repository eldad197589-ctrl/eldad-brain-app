/* ============================================
   FILE: scanned-intake-staging.ts
   PURPOSE: Pure in-memory mapper from scanned file listings to review-only staging candidates.
   DEPENDENCIES: node path, scanned-folder-listing types
   EXPORTS: createScannedIntakeStagingCandidates and related types
   ============================================ */

// #region Imports
import path from 'node:path';
import type { ScannedFolderFileMetadata, ScannedFolderListingResult } from './scanned-folder-listing';
// #endregion

// #region Types
export type ScannedIntakeSourceChannel = 'scan';
export type ScannedIntakeProfessionalStatus = 'not_reviewed';
export type ScannedIntakeMatterResolutionStatus = 'unresolved';

export type ScannedIntakeStagingWarningCode =
  | 'missing_created_at'
  | 'missing_modified_at'
  | 'duplicate_candidate_id'
  | 'unsupported_incomplete_listing_result'
  | 'folder_hint_ambiguous';

export interface ScannedIntakeStagingWarning {
  code: ScannedIntakeStagingWarningCode;
  message: string;
  candidateId?: string;
  fileName?: string;
  sourcePath?: string;
}

export interface ScannedIntakeStagingCandidate {
  candidateId: string;
  sourceChannel: ScannedIntakeSourceChannel;
  fileName: string;
  extension: string;
  absolutePath: string;
  relativePathFromRoot?: string;
  parentFolderName?: string;
  folderPath?: string;
  sourceRoot?: string;
  sizeBytes: number;
  createdAt?: string;
  modifiedAt?: string;
  ocrStatus: 'not_processed';
  intakeStatus: 'staging_candidate';
  suggestedContextFromFolderName?: string;
  professionalStatus: ScannedIntakeProfessionalStatus;
  matterResolutionStatus: ScannedIntakeMatterResolutionStatus;
  warnings: ScannedIntakeStagingWarning[];
}

export interface ScannedIntakeStagingGroup {
  groupKey: string;
  folderPath?: string;
  parentFolderName?: string;
  suggestedContextFromFolderName?: string;
  count: number;
  candidates: ScannedIntakeStagingCandidate[];
  warnings: ScannedIntakeStagingWarning[];
}

export interface ScannedIntakeStagingCounts {
  totalCandidates: number;
  groupsCount: number;
  warningsCount: number;
  sourceFilesCount: number;
}

export interface ScannedIntakeStagingResult {
  candidates: ScannedIntakeStagingCandidate[];
  groupedCandidates: ScannedIntakeStagingGroup[];
  counts: ScannedIntakeStagingCounts;
  warnings: ScannedIntakeStagingWarning[];
}
// #endregion

// #region Constants
const GENERIC_OR_AMBIGUOUS_FOLDER_HINTS = new Set(['general', 'misc', 'unknown', 'other', 'various', 'כללי', 'שונות']);
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

const sourceRootFromResult = (listingResult: ScannedFolderListingResult): string | undefined =>
  listingResult.success ? listingResult.folderPath : listingResult.error.folderPath;

const relativePathFromFile = (file: ScannedFolderFileMetadata, sourceRoot?: string): string | undefined => {
  if (file.relativePathFromRoot) return file.relativePathFromRoot;
  if (sourceRoot && file.absolutePath) return path.relative(sourceRoot, file.absolutePath);
  return undefined;
};

const parentFolderNameFromFile = (file: ScannedFolderFileMetadata, relativePathFromRoot?: string): string | undefined => {
  if (file.parentFolderName) return file.parentFolderName;
  if (!relativePathFromRoot) return undefined;

  const relativeFolder = path.dirname(relativePathFromRoot);
  if (!relativeFolder || relativeFolder === '.') return undefined;
  return path.basename(relativeFolder);
};

const folderPathFromFile = (file: ScannedFolderFileMetadata): string | undefined =>
  file.folderPath ?? path.dirname(file.absolutePath);

const contextHintFromFolder = (parentFolderName?: string): string | undefined => {
  const trimmed = parentFolderName?.trim();
  return trimmed ? trimmed : undefined;
};

const createCandidateId = (
  sourceRoot: string | undefined,
  relativePathFromRoot: string | undefined,
  file: ScannedFolderFileMetadata
): string => {
  const seed = ['scan', sourceRoot ?? '', relativePathFromRoot ?? file.absolutePath, String(file.sizeBytes), file.modifiedAt ?? ''].join('|');
  return `scan-${stableHash(seed)}`;
};

const createCandidateWarnings = (
  candidateId: string,
  file: ScannedFolderFileMetadata,
  suggestedContextFromFolderName?: string
): ScannedIntakeStagingWarning[] => {
  const warnings: ScannedIntakeStagingWarning[] = [];

  if (!file.createdAt) {
    warnings.push({
      code: 'missing_created_at',
      message: 'Scanned file metadata is missing createdAt.',
      candidateId,
      fileName: file.fileName,
      sourcePath: file.absolutePath,
    });
  }

  if (!file.modifiedAt) {
    warnings.push({
      code: 'missing_modified_at',
      message: 'Scanned file metadata is missing modifiedAt.',
      candidateId,
      fileName: file.fileName,
      sourcePath: file.absolutePath,
    });
  }

  if (suggestedContextFromFolderName && GENERIC_OR_AMBIGUOUS_FOLDER_HINTS.has(suggestedContextFromFolderName.toLowerCase())) {
    warnings.push({
      code: 'folder_hint_ambiguous',
      message: 'Folder context is generic and must remain a review hint only.',
      candidateId,
      fileName: file.fileName,
      sourcePath: file.absolutePath,
    });
  }

  return warnings;
};

const createIncompleteListingWarning = (listingResult: ScannedFolderListingResult): ScannedIntakeStagingWarning | undefined => {
  if (listingResult.success) return undefined;
  return {
    code: 'unsupported_incomplete_listing_result',
    message: listingResult.error.message,
    sourcePath: listingResult.error.folderPath,
  };
};
// #endregion

// #region Public API
/**
 * Maps read-only scan listing metadata into in-memory staging candidates.
 * Candidate output is review-only and does not perform storage, classification, linking, or record creation.
 */
export function createScannedIntakeStagingCandidates(
  listingResult: ScannedFolderListingResult
): ScannedIntakeStagingResult {
  const sourceRoot = sourceRootFromResult(listingResult);
  const sourceFiles = listingResult.success ? listingResult.files : [];
  const warnings: ScannedIntakeStagingWarning[] = [];
  const duplicateTracker = new Set<string>();
  const grouped = new Map<string, ScannedIntakeStagingGroup>();

  const incompleteListingWarning = createIncompleteListingWarning(listingResult);
  if (incompleteListingWarning) warnings.push(incompleteListingWarning);

  const candidates = sourceFiles.map((file) => {
    const relativePathFromRoot = relativePathFromFile(file, sourceRoot);
    const parentFolderName = parentFolderNameFromFile(file, relativePathFromRoot);
    const folderPath = folderPathFromFile(file);
    const candidateSourceRoot = file.sourceRoot ?? sourceRoot;
    const suggestedContextFromFolderName = contextHintFromFolder(parentFolderName);
    const candidateId = createCandidateId(candidateSourceRoot, relativePathFromRoot, file);
    const candidateWarnings = createCandidateWarnings(candidateId, file, suggestedContextFromFolderName);

    if (duplicateTracker.has(candidateId)) {
      candidateWarnings.push({
        code: 'duplicate_candidate_id',
        message: 'Duplicate-looking scanned staging candidate id detected.',
        candidateId,
        fileName: file.fileName,
        sourcePath: file.absolutePath,
      });
    }
    duplicateTracker.add(candidateId);
    warnings.push(...candidateWarnings);

    const candidate: ScannedIntakeStagingCandidate = {
      candidateId,
      sourceChannel: 'scan',
      fileName: file.fileName,
      extension: file.extension,
      absolutePath: file.absolutePath,
      relativePathFromRoot,
      parentFolderName,
      folderPath,
      sourceRoot: candidateSourceRoot,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt,
      modifiedAt: file.modifiedAt,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
      suggestedContextFromFolderName,
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      warnings: candidateWarnings,
    };

    const groupKey = folderPath ?? parentFolderName ?? candidateSourceRoot ?? 'scan-root';
    const existingGroup = grouped.get(groupKey);
    if (existingGroup) {
      existingGroup.candidates.push(candidate);
      existingGroup.count = existingGroup.candidates.length;
      existingGroup.warnings.push(...candidateWarnings);
    } else {
      grouped.set(groupKey, {
        groupKey,
        folderPath,
        parentFolderName,
        suggestedContextFromFolderName,
        count: 1,
        candidates: [candidate],
        warnings: [...candidateWarnings],
      });
    }

    return candidate;
  });

  const groupedCandidates = Array.from(grouped.values());

  return {
    candidates,
    groupedCandidates,
    counts: {
      totalCandidates: candidates.length,
      groupsCount: groupedCandidates.length,
      warningsCount: warnings.length,
      sourceFilesCount: sourceFiles.length,
    },
    warnings,
  };
}
// #endregion
