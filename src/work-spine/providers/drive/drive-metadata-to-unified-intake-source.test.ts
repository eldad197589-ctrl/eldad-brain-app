/* ============================================
   FILE: drive-metadata-to-unified-intake-source.test.ts
   PURPOSE: Boundary tests for Drive metadata to Unified Intake source mapping.
   DEPENDENCIES: Vitest, static Drive mocks, and Stage 5B mapper
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { MOCK_DRIVE_METADATA_SOURCES } from './drive-metadata-source-mock';
import {
  DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapDriveMetadataToUnifiedIntakeSource,
} from './drive-metadata-to-unified-intake-source';
// #endregion

// #region Test Constants
const FORBIDDEN_DRIVE_FIELDS = [
  'downloadUrl',
  'exportLinks',
  'webContentLink',
  'content',
  'body',
  'text',
  'base64',
  'buffer',
  'thumbnail',
  'rawBytes',
  'ocrText',
  'rawPayload',
  'fileContent',
] as const;
// #endregion

// #region Tests
describe('mapDriveMetadataToUnifiedIntakeSource', () => {
  it('maps PDF Drive metadata into a Unified Intake drive source', () => {
    const pdfSource = mapDriveMetadataToUnifiedIntakeSource({
      file: MOCK_DRIVE_METADATA_SOURCES[0],
    });

    expect(MOCK_DRIVE_METADATA_SOURCES[0].provider).toBe('google_drive');
    expect(pdfSource.sourceType).toBe('drive');
    expect(pdfSource.sourceId).toBe('drive:drive-stage5b-pdf-001');
    expect(pdfSource.senderIdentity).toBe('office@example.com');
    expect(pdfSource.timestamp).toBe('2026-05-02T10:30:00.000Z');
    expect(pdfSource.subjectOrFilename).toBe('vat-invoice-may.pdf');
    expect(pdfSource.payloadSummary.fileType).toBe('application/pdf');
    expect(pdfSource.payloadSummary.sizeBytes).toBe(58321);
    expect(pdfSource.payloadSummary.snippet).toContain('VAT Review');
  });

  it('keeps boundary flags locked to local preview only', () => {
    const source = mapDriveMetadataToUnifiedIntakeSource({
      file: MOCK_DRIVE_METADATA_SOURCES[0],
    });

    expect(source.boundaryFlags).toEqual(DRIVE_UNIFIED_INTAKE_BOUNDARY_FLAGS);
    expect(source.boundaryFlags.allowedMode).toBe('local_preview_only');
    expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
    expect(source.boundaryFlags.canCreateMatter).toBe(false);
    expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
    expect(source.boundaryFlags.requiresEldadApproval).toBe(true);
    expect(source.boundaryFlags.operationalActionBlocked).toBe(true);
  });

  it('handles Google workspace file metadata without size or modified timestamp', () => {
    const sheetSource = mapDriveMetadataToUnifiedIntakeSource({
      file: MOCK_DRIVE_METADATA_SOURCES[1],
    });

    expect(sheetSource.sourceType).toBe('drive');
    expect(sheetSource.senderIdentity).toBe('bookkeeping@example.com');
    expect(sheetSource.timestamp).toBe('2026-04-30T12:00:00.000Z');
    expect(sheetSource.subjectOrFilename).toBe('vat-reconciliation-sheet');
    expect(sheetSource.payloadSummary.fileType).toBe(
      'application/vnd.google-apps.spreadsheet',
    );
    expect(sheetSource.payloadSummary).not.toHaveProperty('sizeBytes');
  });

  it('preserves Hebrew file names and safe Drive metadata', () => {
    const hebrewSource = mapDriveMetadataToUnifiedIntakeSource({
      file: MOCK_DRIVE_METADATA_SOURCES[2],
    });

    expect(hebrewSource.subjectOrFilename).toBe('חשבונית-מע״מ-מאי.pdf');
    expect(hebrewSource.payloadSummary.snippet).toContain('מסמכי מע״מ');
    expect(MOCK_DRIVE_METADATA_SOURCES[2].parentFolderIds).toEqual([
      'drive-parent-hebrew',
    ]);
    expect(MOCK_DRIVE_METADATA_SOURCES[2].provenanceUrl).toBe(
      'https://drive.google.com/file/d/drive-stage5b-hebrew-001/view',
    );
  });

  it('does not model forbidden Drive payload fields', () => {
    const serializedMocks = JSON.stringify(MOCK_DRIVE_METADATA_SOURCES);
    const serializedSources = JSON.stringify(
      MOCK_DRIVE_METADATA_SOURCES.map((file) =>
        mapDriveMetadataToUnifiedIntakeSource({ file }),
      ),
    );

    for (const field of FORBIDDEN_DRIVE_FIELDS) {
      expect(serializedMocks).not.toContain(field);
      expect(serializedSources).not.toContain(field);
    }
  });

  it('does not create operational records from Drive metadata', () => {
    const source = mapDriveMetadataToUnifiedIntakeSource({
      file: MOCK_DRIVE_METADATA_SOURCES[0],
    });

    expect(source).not.toHaveProperty('workItem');
    expect(source).not.toHaveProperty('matter');
    expect(source).not.toHaveProperty('documentRef');
    expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
    expect(source.boundaryFlags.canCreateMatter).toBe(false);
    expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
  });
});
// #endregion
