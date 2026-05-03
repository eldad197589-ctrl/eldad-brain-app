/* ============================================
   FILE: drive-metadata-to-unified-intake-source.ts
   PURPOSE: Pure mapper from Google Drive metadata to Unified Intake source previews.
   DEPENDENCIES: Unified Intake source contracts and Drive metadata contracts
   EXPORTS: Drive metadata source mapper and locked local preview boundary flags
   ============================================ */

// #region Imports
import type {
  IntakeBoundaryFlags,
  IntakePayloadSummary,
  UnifiedIntakeSource,
} from '../../intake/unified-intake-source-types';
import type { DriveFileMetadata } from './drive-metadata-types';
// #endregion

// #region Types
/** Input for mapping Google Drive file metadata into a Unified Intake source preview. */
export interface DriveMetadataToUnifiedIntakeSourceInput {
  /** Google Drive file metadata with no file payload bytes. */
  file: DriveFileMetadata;
}
// #endregion

// #region Constants
/** Locked local-only boundary flags for Drive metadata source previews. */
export const DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS: IntakeBoundaryFlags = {
  allowedMode: 'local_preview_only',
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  requiresEldadApproval: true,
  operationalActionBlocked: true,
};
// #endregion

// #region Helpers
const getDriveOriginator = (file: DriveFileMetadata): string => {
  const owner = file.owners.find((candidate) => candidate.trim().length > 0);

  if (owner !== undefined) {
    return owner;
  }

  const modifier = file.lastModifyingUser?.trim();
  return modifier !== undefined && modifier.length > 0
    ? modifier
    : 'unknown_drive_user';
};

const getDriveTimestamp = (file: DriveFileMetadata): string =>
  file.modifiedTime ?? file.createdTime;

const createDriveSnippet = (file: DriveFileMetadata): string => {
  const parentNames =
    file.parentFolderNames.length > 0
      ? file.parentFolderNames.join(', ')
      : 'No parent folder metadata';
  const provenance =
    file.provenanceUrl !== undefined
      ? ` | Provenance: ${file.provenanceUrl}`
      : '';

  return `Parents: ${parentNames} | Captured: ${file.metadataCapturedAt}${provenance}`;
};

const createDrivePayloadSummary = (
  file: DriveFileMetadata,
): IntakePayloadSummary => {
  const summary: IntakePayloadSummary = {
    fileType: file.mimeType,
    snippet: createDriveSnippet(file),
  };

  if (file.sizeBytes !== undefined) {
    summary.sizeBytes = file.sizeBytes;
  }

  return summary;
};
// #endregion

// #region Mapper
/**
 * Maps safe Google Drive file metadata into the committed Unified Intake source model.
 */
export const mapDriveMetadataToUnifiedIntakeSource = ({
  file,
}: DriveMetadataToUnifiedIntakeSourceInput): UnifiedIntakeSource => ({
  sourceId: `drive:${file.fileId}`,
  sourceType: 'drive',
  senderIdentity: getDriveOriginator(file),
  timestamp: getDriveTimestamp(file),
  subjectOrFilename: file.fileName,
  payloadSummary: createDrivePayloadSummary(file),
  boundaryFlags: DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS,
});
// #endregion
