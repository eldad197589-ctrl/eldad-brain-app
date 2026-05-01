/* ============================================
   FILE: google-drive-to-unified-intake.ts
   PURPOSE: Pure mapper from Google Drive metadata fixtures to unified intake candidates.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromGoogleDriveItems and related input/result types
   ============================================ */

// #region Imports
import type {
  GoogleDriveFileKind,
  GoogleDriveSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceKind,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeSuggestedContext,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Input Types
export interface GoogleDriveIntakeItemInput {
  driveFileId?: string;
  driveFolderId?: string;
  drivePath?: string;
  driveFolderName?: string;
  fileName?: string;
  mimeType?: string;
  fileKind: GoogleDriveFileKind;
  ownerEmail?: string;
  sharedWithMe?: boolean;
  modifiedAt: string;
  createdAt: string;
  webViewLink?: string;
  parentFolderIds: readonly string[];
  sourceFolderHint?: string;
  isFolder: boolean;
}
// #endregion

// #region Result Types
export interface GoogleDriveToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_drive_identity';
}

export interface GoogleDriveToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface GoogleDriveToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  folderCount: number;
  fileCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: GoogleDriveToUnifiedIntakeSkippedItem[];
  errors: GoogleDriveToUnifiedIntakeError[];
}

export interface GoogleDriveToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<GoogleDriveSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: GoogleDriveToUnifiedIntakeDiagnostics;
}
// #endregion

// #region Helpers
const TITLE_FALLBACK = 'Google Drive item without file name';

const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const isMissing = (value?: string): boolean => !value || value.trim() === '';

const sourceIdentity = (item: GoogleDriveIntakeItemInput): string =>
  item.driveFileId || item.driveFolderId || item.drivePath || item.fileName || 'unknown-google-drive-item';

const createCandidateId = (item: GoogleDriveIntakeItemInput): string =>
  `unified-google-drive-candidate-${stableHash(
    ['google_drive', item.driveFileId ?? '', item.driveFolderId ?? '', item.drivePath ?? ''].join('|')
  )}`;

const createEvidenceId = (
  candidateId: string,
  item: GoogleDriveIntakeItemInput,
  evidenceKind: UnifiedIntakeEvidenceKind
): string =>
  `unified-google-drive-evidence-${stableHash(
    [evidenceKind, candidateId, item.driveFileId ?? '', item.driveFolderId ?? ''].join('|')
  )}`;

const createWarning = (warningCode: string, message: string): UnifiedIntakeWarning => ({
  warningCode,
  message,
  severity: 'warning',
});

const createItemWarnings = (item: GoogleDriveIntakeItemInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(item.driveFileId)) {
    warnings.push(createWarning('missing_drive_file_id', 'Google Drive metadata is missing driveFileId.'));
  }
  if (isMissing(item.driveFolderId)) {
    warnings.push(createWarning('missing_drive_folder_id', 'Google Drive metadata is missing driveFolderId.'));
  }
  if (isMissing(item.fileName)) {
    warnings.push(createWarning('missing_file_name', 'Google Drive metadata is missing fileName.'));
  }
  if (isMissing(item.mimeType)) {
    warnings.push(createWarning('missing_mime_type', 'Google Drive metadata is missing mimeType.'));
  }
  if (item.parentFolderIds.length === 0) {
    warnings.push(createWarning('missing_parent_folder_ids', 'Google Drive metadata is missing parentFolderIds.'));
  }
  if (isMissing(item.drivePath)) {
    warnings.push(createWarning('missing_drive_path', 'Google Drive metadata is missing drivePath.'));
  }
  if (item.sharedWithMe === true && isMissing(item.ownerEmail)) {
    warnings.push(createWarning('shared_with_me_without_owner_email', 'Google Drive item is shared with me but ownerEmail is missing.'));
  }

  return warnings;
};

const createSuggestedContext = (item: GoogleDriveIntakeItemInput): UnifiedIntakeSuggestedContext[] => {
  const contexts: UnifiedIntakeSuggestedContext[] = [];
  const addHint = (label: string | undefined, source: string): void => {
    const trimmed = label?.trim();
    if (!trimmed) return;
    contexts.push({
      label: trimmed,
      source,
      confidence: 'low',
      isConfirmed: false,
    });
  };

  addHint(item.drivePath, 'drive_path');
  addHint(item.driveFolderName, 'drive_folder_name');
  addHint(item.fileName, 'drive_file_name');
  addHint(item.sourceFolderHint, 'drive_source_folder_hint');
  addHint(item.ownerEmail, 'drive_owner_email');
  if (item.sharedWithMe === true) addHint('shared_with_me', 'drive_shared_metadata');

  return contexts;
};

const evidenceKindFromItem = (item: GoogleDriveIntakeItemInput): UnifiedIntakeEvidenceKind =>
  item.isFolder ? 'drive_folder' : 'drive_file';

const createEvidenceRef = (
  candidateId: string,
  item: GoogleDriveIntakeItemInput,
  evidenceKind: UnifiedIntakeEvidenceKind
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createEvidenceId(candidateId, item, evidenceKind),
  sourceType: 'google_drive',
  sourceCandidateId: candidateId,
  evidenceKind,
  title: item.fileName?.trim() || item.driveFolderName?.trim() || TITLE_FALLBACK,
  fileName: item.fileName,
  mimeType: item.mimeType,
  driveFileId: item.driveFileId,
  driveFolderId: item.driveFolderId,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createSourceMetadata = (item: GoogleDriveIntakeItemInput): GoogleDriveSourceMetadata => ({
  sourceType: 'google_drive',
  provider: 'google_drive',
  driveFileId: item.driveFileId ?? '',
  driveFolderId: item.driveFolderId ?? '',
  drivePath: item.drivePath ?? '',
  driveFolderName: item.driveFolderName ?? '',
  fileName: item.fileName ?? '',
  mimeType: item.mimeType ?? '',
  fileKind: item.fileKind,
  ownerEmail: item.ownerEmail,
  sharedWithMe: item.sharedWithMe,
  modifiedAt: item.modifiedAt,
  createdAt: item.createdAt,
  webViewLink: item.webViewLink,
  parentFolderIds: item.parentFolderIds,
  sourceFolderHint: item.sourceFolderHint,
});

const createCandidate = (
  item: GoogleDriveIntakeItemInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<GoogleDriveSourceMetadata> => ({
  candidateId,
  sourceType: 'google_drive',
  sourceId: sourceIdentity(item),
  sourceLabel: item.fileName?.trim() || item.driveFolderName?.trim() || TITLE_FALLBACK,
  receivedAt: item.modifiedAt || item.createdAt,
  createdAt: item.createdAt,
  updatedAt: item.modifiedAt || item.createdAt,
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createSuggestedContext(item),
  evidenceRefs,
  warnings,
  sourceMetadata: createSourceMetadata(item),
});
// #endregion

// #region Public API
/**
 * Maps Google Drive metadata fixtures into unified intake candidates in memory only.
 * This function does not connect to external services, mutate files, classify, persist, or create professional records.
 */
export function createUnifiedIntakeFromGoogleDriveItems(
  items: readonly GoogleDriveIntakeItemInput[]
): GoogleDriveToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<GoogleDriveSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: GoogleDriveToUnifiedIntakeSkippedItem[] = [];
  const errors: GoogleDriveToUnifiedIntakeError[] = [];

  for (const item of items) {
    const sourceId = sourceIdentity(item);

    if (isMissing(item.driveFileId) && isMissing(item.driveFolderId)) {
      skippedItems.push({ sourceId, reason: 'missing_drive_identity' });
      errors.push({ sourceId, message: 'Google Drive metadata is missing both driveFileId and driveFolderId.' });
      continue;
    }

    const itemWarnings = createItemWarnings(item);
    warnings.push(...itemWarnings);

    const candidateId = createCandidateId(item);
    const evidenceKind = evidenceKindFromItem(item);
    const evidenceRef = createEvidenceRef(candidateId, item, evidenceKind);
    evidenceRefs.push(evidenceRef);
    candidates.push(createCandidate(item, candidateId, [evidenceRef], itemWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      folderCount: evidenceRefs.filter((evidence) => evidence.evidenceKind === 'drive_folder').length,
      fileCount: evidenceRefs.filter((evidence) => evidence.evidenceKind === 'drive_file').length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
