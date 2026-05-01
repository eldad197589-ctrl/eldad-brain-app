/* ============================================
   FILE: manual-and-uploaded-file-to-unified-intake.ts
   PURPOSE: Pure mappers from manual and uploaded-file metadata fixtures to unified intake candidates.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromManualNotes, createUnifiedIntakeFromUploadedFiles, and related types
   ============================================ */

// #region Imports
import type {
  ManualSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeSuggestedContext,
  UnifiedIntakeWarning,
  UploadedFileSourceMetadata,
} from './unified-intake-registry';
// #endregion

// #region Input Types
export interface ManualIntakeInput {
  manualId?: string;
  author?: string;
  noteText?: string;
  manualCreatedAt?: string;
  sourceLabel?: string;
  relatedFreeText?: string;
  declaredClientName?: string;
  declaredMatterLabel?: string;
  tags?: readonly string[];
}

export interface UploadedFileIntakeInput {
  uploadSessionId?: string;
  fileId?: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadSource?: string;
  sourceLabel?: string;
  declaredClientName?: string;
  declaredMatterLabel?: string;
  notes?: string;
}
// #endregion

// #region Result Types
export interface ManualToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_manual_id';
}

export interface UploadedFileToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_upload_session_id' | 'missing_file_name';
}

export interface ManualToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface UploadedFileToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface ManualToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  manualCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: ManualToUnifiedIntakeSkippedItem[];
  errors: ManualToUnifiedIntakeError[];
}

export interface UploadedFileToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  uploadedFileCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: UploadedFileToUnifiedIntakeSkippedItem[];
  errors: UploadedFileToUnifiedIntakeError[];
}

export interface ManualToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<ManualSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: ManualToUnifiedIntakeDiagnostics;
}

export interface UploadedFileToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<UploadedFileSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: UploadedFileToUnifiedIntakeDiagnostics;
}
// #endregion

// #region Shared Helpers
const MANUAL_NOTE_FALLBACK = 'Manual intake note without text';
const UPLOADED_FILE_FALLBACK = 'Uploaded file without file name';

const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const isMissing = (value?: string): boolean => !value || value.trim() === '';

const createWarning = (warningCode: string, message: string): UnifiedIntakeWarning => ({
  warningCode,
  message,
  severity: 'warning',
});

const addHint = (
  contexts: UnifiedIntakeSuggestedContext[],
  label: string | undefined,
  source: string
): void => {
  const trimmed = label?.trim();
  if (!trimmed) return;
  contexts.push({
    label: trimmed,
    source,
    confidence: 'low',
    isConfirmed: false,
  });
};
// #endregion

// #region Manual Helpers
const manualSourceIdentity = (note: ManualIntakeInput): string =>
  note.manualId || note.sourceLabel || note.author || 'unknown-manual-note';

const createManualCandidateId = (
  note: Required<Pick<ManualIntakeInput, 'manualId'>> & ManualIntakeInput
): string =>
  `unified-manual-candidate-${stableHash(
    ['manual', note.manualId, note.author ?? '', note.manualCreatedAt ?? ''].join('|')
  )}`;

const createManualEvidenceId = (
  candidateId: string,
  note: Required<Pick<ManualIntakeInput, 'manualId'>> & ManualIntakeInput
): string => `unified-manual-evidence-${stableHash(['manual_note', candidateId, note.manualId].join('|'))}`;

const createManualWarnings = (note: ManualIntakeInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(note.noteText)) {
    warnings.push(createWarning('missing_note_text', 'Manual intake metadata is missing noteText.'));
  }
  if (isMissing(note.author)) {
    warnings.push(createWarning('missing_author', 'Manual intake metadata is missing author.'));
  }
  if (isMissing(note.manualCreatedAt)) {
    warnings.push(createWarning('missing_manual_created_at', 'Manual intake metadata is missing manualCreatedAt.'));
  }

  return warnings;
};

const createManualSuggestedContext = (note: ManualIntakeInput): UnifiedIntakeSuggestedContext[] => {
  const contexts: UnifiedIntakeSuggestedContext[] = [];

  addHint(contexts, note.author, 'manual_author');
  addHint(contexts, note.noteText, 'manual_note_text');
  addHint(contexts, note.sourceLabel, 'manual_source_label');
  addHint(contexts, note.relatedFreeText, 'manual_related_free_text');
  addHint(contexts, note.declaredClientName, 'manual_declared_client_name');
  addHint(contexts, note.declaredMatterLabel, 'manual_declared_matter_label');
  for (const tag of note.tags ?? []) {
    addHint(contexts, tag, 'manual_tag');
  }

  return contexts;
};

const createManualEvidenceRef = (
  candidateId: string,
  note: Required<Pick<ManualIntakeInput, 'manualId'>> & ManualIntakeInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createManualEvidenceId(candidateId, note),
  sourceType: 'manual',
  sourceCandidateId: candidateId,
  evidenceKind: 'manual_note',
  title: note.sourceLabel?.trim() || note.noteText?.trim() || MANUAL_NOTE_FALLBACK,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createManualSourceMetadata = (
  note: Required<Pick<ManualIntakeInput, 'manualId'>> & ManualIntakeInput
): ManualSourceMetadata => ({
  sourceType: 'manual',
  author: note.author ?? '',
  noteText: note.noteText ?? '',
  manualCreatedAt: note.manualCreatedAt ?? '',
});

const createManualCandidate = (
  note: Required<Pick<ManualIntakeInput, 'manualId'>> & ManualIntakeInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<ManualSourceMetadata> => ({
  candidateId,
  sourceType: 'manual',
  sourceId: note.manualId,
  sourceLabel: note.sourceLabel?.trim() || note.noteText?.trim() || note.manualId,
  receivedAt: note.manualCreatedAt ?? '',
  createdAt: note.manualCreatedAt ?? '',
  updatedAt: note.manualCreatedAt ?? '',
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createManualSuggestedContext(note),
  evidenceRefs,
  warnings,
  sourceMetadata: createManualSourceMetadata(note),
});
// #endregion

// #region Uploaded File Helpers
const uploadedFileSourceIdentity = (file: UploadedFileIntakeInput): string =>
  file.uploadSessionId || file.fileName || file.fileId || file.sourceLabel || 'unknown-uploaded-file';

const createUploadedFileCandidateId = (
  file: Required<Pick<UploadedFileIntakeInput, 'uploadSessionId' | 'fileName'>> & UploadedFileIntakeInput
): string =>
  `unified-uploaded-file-candidate-${stableHash(
    ['uploaded_file', file.uploadSessionId, file.fileId ?? '', file.fileName, file.uploadedAt ?? ''].join('|')
  )}`;

const createUploadedFileEvidenceId = (
  candidateId: string,
  file: Required<Pick<UploadedFileIntakeInput, 'uploadSessionId' | 'fileName'>> & UploadedFileIntakeInput
): string =>
  `unified-uploaded-file-evidence-${stableHash(
    ['file', candidateId, file.fileId ?? '', file.fileName].join('|')
  )}`;

const createUploadedFileWarnings = (file: UploadedFileIntakeInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(file.uploadedAt)) {
    warnings.push(createWarning('missing_uploaded_at', 'Uploaded file metadata is missing uploadedAt.'));
  }
  if (isMissing(file.uploadedBy)) {
    warnings.push(createWarning('missing_uploaded_by', 'Uploaded file metadata is missing uploadedBy.'));
  }
  if (isMissing(file.mimeType)) {
    warnings.push(createWarning('missing_mime_type', 'Uploaded file metadata is missing mimeType.'));
  }

  return warnings;
};

const createUploadedFileSuggestedContext = (file: UploadedFileIntakeInput): UnifiedIntakeSuggestedContext[] => {
  const contexts: UnifiedIntakeSuggestedContext[] = [];

  addHint(contexts, file.fileName, 'uploaded_file_name');
  addHint(contexts, file.uploadedBy, 'uploaded_file_uploaded_by');
  addHint(contexts, file.uploadSource, 'uploaded_file_source');
  addHint(contexts, file.sourceLabel, 'uploaded_file_source_label');
  addHint(contexts, file.declaredClientName, 'uploaded_file_declared_client_name');
  addHint(contexts, file.declaredMatterLabel, 'uploaded_file_declared_matter_label');
  addHint(contexts, file.notes, 'uploaded_file_notes');

  return contexts;
};

const createUploadedFileEvidenceRef = (
  candidateId: string,
  file: Required<Pick<UploadedFileIntakeInput, 'uploadSessionId' | 'fileName'>> & UploadedFileIntakeInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createUploadedFileEvidenceId(candidateId, file),
  sourceType: 'uploaded_file',
  sourceCandidateId: candidateId,
  evidenceKind: 'file',
  title: file.sourceLabel?.trim() || file.fileName,
  fileName: file.fileName,
  mimeType: file.mimeType,
  sizeBytes: file.sizeBytes,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createUploadedFileSourceMetadata = (
  file: Required<Pick<UploadedFileIntakeInput, 'uploadSessionId' | 'fileName'>> & UploadedFileIntakeInput
): UploadedFileSourceMetadata => ({
  sourceType: 'uploaded_file',
  uploadSessionId: file.uploadSessionId,
  fileName: file.fileName,
  uploadedBy: file.uploadedBy ?? '',
  uploadedAt: file.uploadedAt ?? '',
});

const createUploadedFileCandidate = (
  file: Required<Pick<UploadedFileIntakeInput, 'uploadSessionId' | 'fileName'>> & UploadedFileIntakeInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<UploadedFileSourceMetadata> => ({
  candidateId,
  sourceType: 'uploaded_file',
  sourceId: file.fileId || file.uploadSessionId,
  sourceLabel: file.sourceLabel?.trim() || file.fileName,
  receivedAt: file.uploadedAt ?? '',
  createdAt: file.uploadedAt ?? '',
  updatedAt: file.uploadedAt ?? '',
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createUploadedFileSuggestedContext(file),
  evidenceRefs,
  warnings,
  sourceMetadata: createUploadedFileSourceMetadata(file),
});
// #endregion

// #region Public Exports
export function createUnifiedIntakeFromManualNotes(notes: readonly ManualIntakeInput[]): ManualToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<ManualSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: ManualToUnifiedIntakeSkippedItem[] = [];
  const errors: ManualToUnifiedIntakeError[] = [];

  for (const note of notes) {
    const sourceId = manualSourceIdentity(note);

    if (isMissing(note.manualId)) {
      skippedItems.push({ sourceId, reason: 'missing_manual_id' });
      errors.push({ sourceId, message: 'Manual intake metadata is missing manualId.' });
      continue;
    }

    const normalizedNote = {
      ...note,
      manualId: note.manualId,
    };
    const noteWarnings = createManualWarnings(note);
    warnings.push(...noteWarnings);

    const candidateId = createManualCandidateId(normalizedNote);
    const evidenceRef = createManualEvidenceRef(candidateId, normalizedNote);

    evidenceRefs.push(evidenceRef);
    candidates.push(createManualCandidate(normalizedNote, candidateId, [evidenceRef], noteWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      manualCount: notes.length,
      warnings,
      skippedItems,
      errors,
    },
  };
}

export function createUnifiedIntakeFromUploadedFiles(
  files: readonly UploadedFileIntakeInput[]
): UploadedFileToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<UploadedFileSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: UploadedFileToUnifiedIntakeSkippedItem[] = [];
  const errors: UploadedFileToUnifiedIntakeError[] = [];

  for (const file of files) {
    const sourceId = uploadedFileSourceIdentity(file);

    if (isMissing(file.uploadSessionId)) {
      skippedItems.push({ sourceId, reason: 'missing_upload_session_id' });
      errors.push({ sourceId, message: 'Uploaded file metadata is missing uploadSessionId.' });
      continue;
    }
    if (isMissing(file.fileName)) {
      skippedItems.push({ sourceId, reason: 'missing_file_name' });
      errors.push({ sourceId, message: 'Uploaded file metadata is missing fileName.' });
      continue;
    }

    const normalizedFile = {
      ...file,
      uploadSessionId: file.uploadSessionId,
      fileName: file.fileName,
    };
    const fileWarnings = createUploadedFileWarnings(file);
    warnings.push(...fileWarnings);

    const candidateId = createUploadedFileCandidateId(normalizedFile);
    const evidenceRef = createUploadedFileEvidenceRef(candidateId, normalizedFile);

    evidenceRefs.push(evidenceRef);
    candidates.push(createUploadedFileCandidate(normalizedFile, candidateId, [evidenceRef], fileWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      uploadedFileCount: files.length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
