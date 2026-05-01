/* ============================================
   FILE: scan-to-unified-intake.ts
   PURPOSE: Pure mapper from scanned staging candidates to unified intake candidates.
   DEPENDENCIES: scanned-intake-staging types, unified-intake-registry types
   EXPORTS: createUnifiedIntakeFromScannedStaging and related result types
   ============================================ */

// #region Imports
import type {
  ScannedIntakeStagingCandidate,
  ScannedIntakeStagingGroup,
  ScannedIntakeStagingResult,
  ScannedIntakeStagingWarning,
} from './scanned-intake-staging';
import type {
  ScanSourceMetadata,
  UnifiedIntakeCandidate,
  UnifiedIntakeEvidenceRef,
  UnifiedIntakeWarning,
} from './unified-intake-registry';
// #endregion

// #region Types
export interface ScanToUnifiedIntakeSkippedItem {
  groupKey: string;
  reason: 'empty_group' | 'missing_required_scan_metadata';
}

export interface ScanToUnifiedIntakeError {
  groupKey: string;
  message: string;
}

export interface ScanToUnifiedIntakeDiagnostics {
  candidateCount: number;
  evidenceCount: number;
  sourceGroupCount: number;
  warnings: UnifiedIntakeWarning[];
  skippedItems: ScanToUnifiedIntakeSkippedItem[];
  errors: ScanToUnifiedIntakeError[];
}

export interface ScanToUnifiedIntakeResult {
  candidates: UnifiedIntakeCandidate<ScanSourceMetadata>[];
  evidenceRefs: UnifiedIntakeEvidenceRef[];
  diagnostics: ScanToUnifiedIntakeDiagnostics;
}
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

const createUnifiedCandidateId = (group: ScannedIntakeStagingGroup): string =>
  `unified-scan-candidate-${stableHash(['scan', group.groupKey, group.folderPath ?? '', group.parentFolderName ?? ''].join('|'))}`;

const createUnifiedEvidenceId = (candidate: ScannedIntakeStagingCandidate): string =>
  `unified-scan-evidence-${stableHash(
    ['scan', candidate.candidateId, candidate.relativePathFromRoot ?? '', candidate.absolutePath, String(candidate.sizeBytes)].join('|')
  )}`;

const relativeFolderFromCandidate = (candidate: ScannedIntakeStagingCandidate): string | undefined => {
  const relativePath = candidate.relativePathFromRoot;
  if (!relativePath) return undefined;
  const parts = relativePath.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 1) return relativePath;
  return parts.slice(0, -1).join('/');
};

const createWarning = (warning: ScannedIntakeStagingWarning): UnifiedIntakeWarning => ({
  warningCode: warning.code,
  message: warning.message,
  severity: 'warning',
});

const hasRequiredScanMetadata = (candidate: ScannedIntakeStagingCandidate): boolean =>
  Boolean(
    candidate.sourceRoot &&
      candidate.folderPath &&
      candidate.parentFolderName &&
      candidate.relativePathFromRoot &&
      candidate.modifiedAt &&
      candidate.extension
  );

const createSourceMetadata = (
  group: ScannedIntakeStagingGroup,
  firstCandidate: ScannedIntakeStagingCandidate
): ScanSourceMetadata => ({
  sourceType: 'scan',
  sourceRoot: firstCandidate.sourceRoot as string,
  folderPath: group.folderPath ?? (firstCandidate.folderPath as string),
  parentFolderName: group.parentFolderName ?? (firstCandidate.parentFolderName as string),
  relativePathFromRoot: relativeFolderFromCandidate(firstCandidate) ?? (firstCandidate.relativePathFromRoot as string),
  modifiedAt: firstCandidate.modifiedAt as string,
  extension: firstCandidate.extension,
});

const createEvidenceRef = (
  candidate: ScannedIntakeStagingCandidate,
  sourceCandidateId: string
): UnifiedIntakeEvidenceRef => ({
  evidenceId: createUnifiedEvidenceId(candidate),
  sourceType: 'scan',
  sourceCandidateId,
  evidenceKind: 'file',
  title: candidate.fileName,
  fileName: candidate.fileName,
  sizeBytes: candidate.sizeBytes,
  absolutePath: candidate.absolutePath,
  relativePathFromRoot: candidate.relativePathFromRoot,
  ocrStatus: 'not_processed',
  classificationStatus: 'not_classified',
  reviewStatus: 'not_reviewed',
});

const createUnifiedCandidate = (
  group: ScannedIntakeStagingGroup,
  firstCandidate: ScannedIntakeStagingCandidate,
  candidateId: string,
  evidenceRefs: UnifiedIntakeEvidenceRef[],
  warnings: UnifiedIntakeWarning[]
): UnifiedIntakeCandidate<ScanSourceMetadata> => ({
  candidateId,
  sourceType: 'scan',
  sourceId: group.groupKey,
  sourceLabel: group.parentFolderName ?? firstCandidate.parentFolderName ?? group.groupKey,
  receivedAt: firstCandidate.createdAt ?? firstCandidate.modifiedAt ?? '',
  createdAt: firstCandidate.createdAt ?? firstCandidate.modifiedAt ?? '',
  updatedAt: firstCandidate.modifiedAt ?? firstCandidate.createdAt ?? '',
  candidateStatus: 'staging_candidate',
  professionalStatus: 'not_reviewed',
  matterResolutionStatus: 'unresolved',
  subjectResolutionStatus: 'unresolved',
  suggestedContext: group.suggestedContextFromFolderName
    ? [
        {
          label: group.suggestedContextFromFolderName,
          source: 'folder_name',
          confidence: 'low',
          isConfirmed: false,
        },
      ]
    : [],
  evidenceRefs,
  warnings,
  sourceMetadata: createSourceMetadata(group, firstCandidate),
});
// #endregion

// #region Public API
/**
 * Maps scanned staging groups into unified intake candidates in memory only.
 * This function does not infer client, matter, tax period, task, or professional classification.
 */
export function createUnifiedIntakeFromScannedStaging(
  stagingResult: ScannedIntakeStagingResult
): ScanToUnifiedIntakeResult {
  const candidates: UnifiedIntakeCandidate<ScanSourceMetadata>[] = [];
  const evidenceRefs: UnifiedIntakeEvidenceRef[] = [];
  const warnings: UnifiedIntakeWarning[] = stagingResult.warnings.map(createWarning);
  const skippedItems: ScanToUnifiedIntakeSkippedItem[] = [];
  const errors: ScanToUnifiedIntakeError[] = [];

  for (const group of stagingResult.groupedCandidates) {
    const firstCandidate = group.candidates[0];
    if (!firstCandidate) {
      skippedItems.push({ groupKey: group.groupKey, reason: 'empty_group' });
      errors.push({ groupKey: group.groupKey, message: 'Scanned staging group has no file candidates.' });
      continue;
    }

    if (!hasRequiredScanMetadata(firstCandidate)) {
      skippedItems.push({ groupKey: group.groupKey, reason: 'missing_required_scan_metadata' });
      errors.push({ groupKey: group.groupKey, message: 'Scanned staging group is missing required scan metadata.' });
      continue;
    }

    const unifiedCandidateId = createUnifiedCandidateId(group);
    const groupEvidenceRefs = group.candidates.map((candidate) => createEvidenceRef(candidate, unifiedCandidateId));
    evidenceRefs.push(...groupEvidenceRefs);
    candidates.push(
      createUnifiedCandidate(group, firstCandidate, unifiedCandidateId, groupEvidenceRefs, group.warnings.map(createWarning))
    );
  }

  return {
    candidates,
    evidenceRefs,
    diagnostics: {
      candidateCount: candidates.length,
      evidenceCount: evidenceRefs.length,
      sourceGroupCount: stagingResult.groupedCandidates.length,
      warnings,
      skippedItems,
      errors,
    },
  };
}
// #endregion
