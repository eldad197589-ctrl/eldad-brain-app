/* ============================================
   FILE: scan-metadata-to-unified-intake-source.ts
   PURPOSE: Pure mapper from scan manifest metadata to Unified Intake source previews.
   DEPENDENCIES: Unified Intake source contracts and scan metadata contracts
   EXPORTS: Scan metadata source mapper and locked local preview boundary flags
   ============================================ */

// #region Imports
import type {
  IntakeBoundaryFlags,
  IntakePayloadSummary,
  UnifiedIntakeSource,
} from '../../intake/unified-intake-source-types';
import type { ScanFileMetadata } from './scan-metadata-types';
// #endregion

// #region Types
/** Input for mapping scan metadata into a Unified Intake source preview. */
export interface ScanMetadataToUnifiedIntakeSourceInput {
  /** Scan metadata from a static manifest only. */
  scan: ScanFileMetadata;
}
// #endregion

// #region Constants
/** Locked local-only boundary flags for scan metadata source previews. */
export const SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS: IntakeBoundaryFlags = {
  allowedMode: 'local_preview_only',
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  requiresEldadApproval: true,
  operationalActionBlocked: true,
};
// #endregion

// #region Helpers
const createScanSnippet = (scan: ScanFileMetadata): string => {
  const parts = [
    `Provider: ${scan.provider}`,
    `Type: ${scan.fileType}`,
    `Confidence: ${scan.confidenceLabel ?? 'unknown'}`,
  ];

  if (scan.pageCount !== undefined) {
    parts.push(`Pages: ${scan.pageCount}`);
  }

  if (scan.scanResolutionDpi !== undefined) {
    parts.push(`Resolution: ${scan.scanResolutionDpi} dpi`);
  }

  if (scan.colorMode !== undefined) {
    parts.push(`Color mode: ${scan.colorMode}`);
  }

  if (scan.scannerModel !== undefined) {
    parts.push(`Model: ${scan.scannerModel}`);
  }

  if (scan.scanBatchId !== undefined) {
    parts.push(`Batch: ${scan.scanBatchId}`);
  }

  return parts.join(' | ');
};

const createScanPayloadSummary = (
  scan: ScanFileMetadata,
): IntakePayloadSummary => {
  const summary: IntakePayloadSummary = {
    fileType: scan.fileType,
    snippet: createScanSnippet(scan),
  };

  if (scan.fileSizeBytes !== undefined) {
    summary.sizeBytes = scan.fileSizeBytes;
  }

  return summary;
};
// #endregion

// #region Mapper
/**
 * Maps safe scan manifest metadata into the committed Unified Intake source model.
 */
export const mapScanMetadataToUnifiedIntakeSource = ({
  scan,
}: ScanMetadataToUnifiedIntakeSourceInput): UnifiedIntakeSource => ({
  sourceId: `scan:${scan.scanId}`,
  sourceType: 'scan',
  senderIdentity: scan.scannerIdentity,
  timestamp: scan.timestamp,
  subjectOrFilename: scan.filename,
  payloadSummary: createScanPayloadSummary(scan),
  boundaryFlags: SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS,
});
// #endregion
