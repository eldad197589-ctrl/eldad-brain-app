/* ============================================
   FILE: mock-drive-data.ts
   PURPOSE: Static mock Drive files and folders for Unified Intake preview.
   DEPENDENCIES: mock-gmail-drive-types
   EXPORTS: MOCK_DRIVE_CONNECTOR_STATUS, MOCK_DRIVE_FILES, MOCK_DRIVE_FOLDERS
   ============================================ */

// #region Imports
import type { MockConnectorStatus, MockDriveFile, MockDriveFolder } from './mock-gmail-drive-types';
// #endregion

// #region Static Data
export const MOCK_DRIVE_CONNECTOR_STATUS: MockConnectorStatus = {
  connectorName: 'Drive',
  mode: 'mock_only',
  liveStatus: 'live_disabled',
  credentialStatus: 'OAuth disabled',
  safetyLabel: 'candidate_and_evidence_only',
};

export const MOCK_DRIVE_FILES: readonly MockDriveFile[] = [
  {
    driveFileId: 'mock-drive-file-tsila-summary',
    driveFolderId: 'mock-drive-folder-tsila',
    drivePath: '/mock-drive/tsila/mock-tsila-summary.pdf',
    driveFolderName: 'mock-tsila',
    fileName: 'mock-tsila-summary.pdf',
    mimeType: 'application/pdf',
    fileKind: 'pdf',
    ownerEmail: 'mock-drive-owner@example.test',
    sharedWithMe: true,
    modifiedAt: '2026-04-23T11:00:00.000Z',
    createdAt: '2026-04-23T10:45:00.000Z',
    parentFolderIds: ['mock-drive-folder-tsila'],
    sourceFolderHint: 'Tsila mock source folder',
  },
  {
    driveFileId: 'mock-drive-file-vat-ledger',
    driveFolderId: 'mock-drive-folder-vat',
    drivePath: '/mock-drive/vat/mock-vat-ledger.xlsx',
    driveFolderName: 'mock-vat',
    fileName: 'mock-vat-ledger.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileKind: 'office_doc',
    ownerEmail: 'mock-drive-owner@example.test',
    sharedWithMe: false,
    modifiedAt: '2026-04-24T12:15:00.000Z',
    createdAt: '2026-04-24T12:00:00.000Z',
    parentFolderIds: ['mock-drive-folder-vat'],
    sourceFolderHint: 'VAT mock process folder',
  },
];

export const MOCK_DRIVE_FOLDERS: readonly MockDriveFolder[] = [
  {
    driveFolderId: 'mock-drive-folder-dima-bundle',
    drivePath: '/mock-drive/dima-bundle',
    driveFolderName: 'mock-dima-bundle',
    ownerEmail: 'mock-drive-owner@example.test',
    sharedWithMe: false,
    modifiedAt: '2026-04-25T13:00:00.000Z',
    createdAt: '2026-04-25T12:30:00.000Z',
    parentFolderIds: ['mock-drive-root'],
    sourceFolderHint: 'Dima mock folder bundle',
  },
];
// #endregion
