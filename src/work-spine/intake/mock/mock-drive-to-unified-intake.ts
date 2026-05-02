/* ============================================
   FILE: mock-drive-to-unified-intake.ts
   PURPOSE: Pure mock Drive mapper into Unified Intake candidates and evidence refs.
   DEPENDENCIES: google-drive-to-unified-intake, mock-drive-data, mock-gmail-drive-types
   EXPORTS: createUnifiedIntakeFromMockDriveItems, MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT
   ============================================ */

// #region Imports
import type { GoogleDriveIntakeItemInput } from '../google-drive-to-unified-intake';
import { createUnifiedIntakeFromGoogleDriveItems } from '../google-drive-to-unified-intake';
import type { GoogleDriveSourceMetadata } from '../unified-intake-registry';
import { MOCK_DRIVE_FILES, MOCK_DRIVE_FOLDERS } from './mock-drive-data';
import type { MockDriveFile, MockDriveFolder, MockUnifiedIntakeOutput } from './mock-gmail-drive-types';
// #endregion

// #region Helpers
const toDriveFileInput = (file: MockDriveFile): GoogleDriveIntakeItemInput => ({
  ...file,
  isFolder: false,
});

const toDriveFolderInput = (folder: MockDriveFolder): GoogleDriveIntakeItemInput => ({
  driveFileId: folder.driveFolderId,
  driveFolderId: folder.driveFolderId,
  drivePath: folder.drivePath,
  driveFolderName: folder.driveFolderName,
  fileName: folder.driveFolderName,
  mimeType: 'application/vnd.google-apps.folder',
  fileKind: 'folder',
  ownerEmail: folder.ownerEmail,
  sharedWithMe: folder.sharedWithMe,
  modifiedAt: folder.modifiedAt,
  createdAt: folder.createdAt,
  parentFolderIds: folder.parentFolderIds,
  sourceFolderHint: folder.sourceFolderHint,
  isFolder: true,
});
// #endregion

// #region Public API
/**
 * Maps static mock Drive files and folders into Unified Intake candidates and evidence refs only.
 *
 * This mapper is in-memory and does not connect to Drive, request credentials, persist, or create operational records.
 */
export function createUnifiedIntakeFromMockDriveItems(
  files: readonly MockDriveFile[] = MOCK_DRIVE_FILES,
  folders: readonly MockDriveFolder[] = MOCK_DRIVE_FOLDERS,
): MockUnifiedIntakeOutput<GoogleDriveSourceMetadata> {
  const result = createUnifiedIntakeFromGoogleDriveItems([
    ...files.map(toDriveFileInput),
    ...folders.map(toDriveFolderInput),
  ]);

  return {
    candidates: result.candidates,
    evidenceRefs: result.evidenceRefs,
  };
}

export const MOCK_DRIVE_UNIFIED_INTAKE_OUTPUT = createUnifiedIntakeFromMockDriveItems();
// #endregion
