/* ============================================
   FILE: drive-metadata-source-mock.ts
   PURPOSE: Static Google Drive metadata-only mocks for Stage 5B Unified Intake mapping.
   DEPENDENCIES: Drive metadata contracts
   EXPORTS: Static Drive source metadata mocks
   ============================================ */

// #region Imports
import type { DriveFileMetadata } from './drive-metadata-types';
// #endregion

// #region Mock Data
/** Static Google Drive metadata-only file mocks with no folder mocks. */
export const MOCK_DRIVE_METADATA_SOURCES: readonly DriveFileMetadata[] = [
  {
    provider: 'google_drive',
    fileId: 'drive-stage5b-pdf-001',
    fileName: 'vat-invoice-may.pdf',
    mimeType: 'application/pdf',
    createdTime: '2026-05-01T08:15:00.000Z',
    modifiedTime: '2026-05-02T10:30:00.000Z',
    owners: ['office@example.com'],
    lastModifyingUser: 'eldad@example.com',
    sizeBytes: 58321,
    parentFolderIds: ['drive-parent-vat'],
    parentFolderNames: ['VAT Review'],
    provenanceUrl: 'https://drive.google.com/file/d/drive-stage5b-pdf-001/view',
    metadataCapturedAt: '2026-05-03T11:00:00.000Z',
  },
  {
    provider: 'google_drive',
    fileId: 'drive-stage5b-sheet-001',
    fileName: 'vat-reconciliation-sheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    createdTime: '2026-04-30T12:00:00.000Z',
    owners: [],
    lastModifyingUser: 'bookkeeping@example.com',
    parentFolderIds: ['drive-parent-bookkeeping'],
    parentFolderNames: ['Bookkeeping Metadata'],
    provenanceUrl: 'https://drive.google.com/file/d/drive-stage5b-sheet-001/view',
    metadataCapturedAt: '2026-05-03T11:00:00.000Z',
  },
  {
    provider: 'google_drive',
    fileId: 'drive-stage5b-hebrew-001',
    fileName: 'חשבונית-מע״מ-מאי.pdf',
    mimeType: 'application/pdf',
    createdTime: '2026-05-02T07:45:00.000Z',
    modifiedTime: '2026-05-02T08:00:00.000Z',
    owners: ['hebrew-owner@example.com'],
    lastModifyingUser: 'hebrew-reviewer@example.com',
    sizeBytes: 42109,
    parentFolderIds: ['drive-parent-hebrew'],
    parentFolderNames: ['מסמכי מע״מ'],
    provenanceUrl: 'https://drive.google.com/file/d/drive-stage5b-hebrew-001/view',
    metadataCapturedAt: '2026-05-03T11:00:00.000Z',
  },
];
// #endregion
