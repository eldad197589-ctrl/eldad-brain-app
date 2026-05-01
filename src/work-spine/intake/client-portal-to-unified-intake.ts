/* ============================================
   FILE: client-portal-to-unified-intake.ts
   PURPOSE: Pure mapper from client portal metadata fixtures to unified intake candidates.
   DEPENDENCIES: unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromClientPortalUploads and related input/result types
   ============================================ */

// #region Imports
import type {
  ClientPortalSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeSuggestedContext,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Input Types
export interface ClientPortalIntakeUploadInput {
  portalUploadId?: string;
  clientProvidedLabel?: string;
  uploaderIdentityClaim?: string;
  uploadedAt?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  portalFolder?: string;
  portalPath?: string;
  declaredClientName?: string;
  declaredClientId?: string;
  declaredMatterLabel?: string;
  uploadedByEmail?: string;
  notes?: string;
  sourcePortalName?: string;
}
// #endregion

// #region Result Types
export interface ClientPortalToUnifiedIntakeSkippedItem {
  sourceId: string;
  reason: 'missing_portal_upload_id' | 'missing_file_name';
}

export interface ClientPortalToUnifiedIntakeError {
  sourceId: string;
  message: string;
}

export interface ClientPortalToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  uploadCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: ClientPortalToUnifiedIntakeSkippedItem[];
  errors: ClientPortalToUnifiedIntakeError[];
}

export interface ClientPortalToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<ClientPortalSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: ClientPortalToUnifiedIntakeDiagnostics;
}
// #endregion

// #region Helpers
const PORTAL_UPLOAD_FALLBACK = 'Client portal upload without file name';

const stableHash = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const isMissing = (value?: string): boolean => !value || value.trim() === '';

const sourceIdentity = (upload: ClientPortalIntakeUploadInput): string =>
  upload.portalUploadId ||
  upload.fileName ||
  upload.clientProvidedLabel ||
  upload.portalPath ||
  'unknown-client-portal-upload';

const createCandidateId = (
  upload: Required<Pick<ClientPortalIntakeUploadInput, 'portalUploadId' | 'fileName'>> &
    ClientPortalIntakeUploadInput
): string =>
  `unified-client-portal-candidate-${stableHash(
    ['client_portal', upload.portalUploadId, upload.fileName, upload.uploadedAt ?? ''].join('|')
  )}`;

const createEvidenceId = (
  candidateId: string,
  upload: Required<Pick<ClientPortalIntakeUploadInput, 'portalUploadId' | 'fileName'>> &
    ClientPortalIntakeUploadInput
): string =>
  `unified-client-portal-evidence-${stableHash(
    ['portal_upload', candidateId, upload.portalUploadId, upload.fileName].join('|')
  )}`;

const createWarning = (warningCode: string, message: string): UnifiedIntakeWarning => ({
  warningCode,
  message,
  severity: 'warning',
});

const createUploadWarnings = (upload: ClientPortalIntakeUploadInput): UnifiedIntakeWarning[] => {
  const warnings: UnifiedIntakeWarning[] = [];

  if (isMissing(upload.uploadedAt)) {
    warnings.push(createWarning('missing_uploaded_at', 'Client portal upload metadata is missing uploadedAt.'));
  }
  if (isMissing(upload.uploaderIdentityClaim)) {
    warnings.push(
      createWarning('missing_uploader_identity_claim', 'Client portal upload metadata is missing uploaderIdentityClaim.')
    );
  }
  if (isMissing(upload.declaredClientName) && isMissing(upload.declaredClientId)) {
    warnings.push(
      createWarning('missing_declared_client_info', 'Client portal upload metadata is missing declared client information.')
    );
  }
  if (isMissing(upload.mimeType)) {
    warnings.push(createWarning('missing_mime_type', 'Client portal upload metadata is missing mimeType.'));
  }

  return warnings;
};

const createSuggestedContext = (upload: ClientPortalIntakeUploadInput): UnifiedIntakeSuggestedContext[] => {
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

  addHint(upload.clientProvidedLabel, 'client_portal_label');
  addHint(upload.uploaderIdentityClaim, 'portal_uploader_identity_claim');
  addHint(upload.declaredClientName, 'portal_declared_client_name');
  addHint(upload.declaredClientId, 'portal_declared_client_id');
  addHint(upload.declaredMatterLabel, 'portal_declared_matter_label');
  addHint(upload.portalFolder, 'portal_folder');
  addHint(upload.portalPath, 'portal_path');
  addHint(upload.uploadedByEmail, 'portal_uploaded_by_email');
  addHint(upload.notes, 'portal_notes');
  addHint(upload.sourcePortalName, 'portal_source_name');

  return contexts;
};

const createEvidenceRef = (
  candidateId: string,
  upload: Required<Pick<ClientPortalIntakeUploadInput, 'portalUploadId' | 'fileName'>> &
    ClientPortalIntakeUploadInput
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createEvidenceId(candidateId, upload),
  sourceType: 'client_portal',
  sourceCandidateId: candidateId,
  evidenceKind: 'portal_upload',
  title: upload.fileName.trim() || PORTAL_UPLOAD_FALLBACK,
  fileName: upload.fileName,
  mimeType: upload.mimeType,
  sizeBytes: upload.sizeBytes,
  portalUploadId: upload.portalUploadId,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createSourceMetadata = (
  upload: Required<Pick<ClientPortalIntakeUploadInput, 'portalUploadId' | 'fileName'>> &
    ClientPortalIntakeUploadInput
): ClientPortalSourceMetadata => ({
  sourceType: 'client_portal',
  portalUploadId: upload.portalUploadId,
  clientProvidedLabel: upload.clientProvidedLabel ?? '',
  uploaderIdentityClaim: upload.uploaderIdentityClaim ?? '',
  uploadedAt: upload.uploadedAt ?? '',
});

const createCandidate = (
  upload: Required<Pick<ClientPortalIntakeUploadInput, 'portalUploadId' | 'fileName'>> &
    ClientPortalIntakeUploadInput,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<ClientPortalSourceMetadata> => ({
  candidateId,
  sourceType: 'client_portal',
  sourceId: upload.portalUploadId,
  sourceLabel: upload.clientProvidedLabel?.trim() || upload.fileName,
  receivedAt: upload.uploadedAt ?? '',
  createdAt: upload.uploadedAt ?? '',
  updatedAt: upload.uploadedAt ?? '',
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: createSuggestedContext(upload),
  evidenceRefs,
  warnings,
  sourceMetadata: createSourceMetadata(upload),
});
// #endregion

// #region Public API
/**
 * Maps client portal metadata fixtures into unified intake candidates in memory only.
 * This function does not connect to external services, classify, persist, or create professional records.
 */
export function createUnifiedIntakeFromClientPortalUploads(
  uploads: readonly ClientPortalIntakeUploadInput[]
): ClientPortalToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<ClientPortalSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = [];
  const skippedItems: ClientPortalToUnifiedIntakeSkippedItem[] = [];
  const errors: ClientPortalToUnifiedIntakeError[] = [];

  for (const upload of uploads) {
    const sourceId = sourceIdentity(upload);

    if (isMissing(upload.portalUploadId)) {
      skippedItems.push({ sourceId, reason: 'missing_portal_upload_id' });
      errors.push({ sourceId, message: 'Client portal upload metadata is missing portalUploadId.' });
      continue;
    }
    if (isMissing(upload.fileName)) {
      skippedItems.push({ sourceId, reason: 'missing_file_name' });
      errors.push({ sourceId, message: 'Client portal upload metadata is missing fileName.' });
      continue;
    }

    const normalizedUpload = {
      ...upload,
      portalUploadId: upload.portalUploadId,
      fileName: upload.fileName,
    };
    const uploadWarnings = createUploadWarnings(upload);
    warnings.push(...uploadWarnings);

    const candidateId = createCandidateId(normalizedUpload);
    const evidenceRef = createEvidenceRef(candidateId, normalizedUpload);

    evidenceRefs.push(evidenceRef);
    candidates.push(createCandidate(normalizedUpload, candidateId, [evidenceRef], uploadWarnings));
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      uploadCount: uploads.length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
