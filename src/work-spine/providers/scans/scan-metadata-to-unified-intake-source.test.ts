/* ============================================
   FILE: scan-metadata-to-unified-intake-source.test.ts
   PURPOSE: Boundary tests for scan metadata to Unified Intake source mapping.
   DEPENDENCIES: Vitest, static scan mocks, and Stage 5C mapper
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { MOCK_SCAN_METADATA_SOURCES } from './scan-metadata-source-mock';
import {
  SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS,
  mapScanMetadataToUnifiedIntakeSource,
} from './scan-metadata-to-unified-intake-source';
// #endregion

// #region Test Constants
const FORBIDDEN_SCAN_FIELDS = [
  'filePath',
  'realPath',
  'absolutePath',
  'ocrText',
  'extractedText',
  'rawContent',
  'content',
  'body',
  'text',
  'base64',
  'buffer',
  'imageData',
  'rawBytes',
  'pdfText',
  'thumbnail',
  'fileContent',
] as const;
// #endregion

// #region Tests
describe('mapScanMetadataToUnifiedIntakeSource', () => {
  it('maps single-page invoice scan metadata into a Unified Intake scan source', () => {
    const source = mapScanMetadataToUnifiedIntakeSource({
      scan: MOCK_SCAN_METADATA_SOURCES[0],
    });

    expect(MOCK_SCAN_METADATA_SOURCES[0].provider).toBe('local_scanner');
    expect(source.sourceType).toBe('scan');
    expect(source.sourceId).toBe('scan:scan-stage5c-invoice-001');
    expect(source.senderIdentity).toBe('local-scanner-front-desk');
    expect(source.timestamp).toBe('2026-05-03T08:20:00.000Z');
    expect(source.subjectOrFilename).toBe('synthetic-invoice-scan.pdf');
    expect(source.payloadSummary.fileType).toBe('pdf');
    expect(source.payloadSummary.sizeBytes).toBe(184512);
    expect(source.payloadSummary.snippet).toContain('Pages: 1');
    expect(source.payloadSummary.snippet).toContain('Confidence: clear');
  });

  it('keeps boundary flags locked to local preview only', () => {
    const source = mapScanMetadataToUnifiedIntakeSource({
      scan: MOCK_SCAN_METADATA_SOURCES[0],
    });

    expect(source.boundaryFlags).toEqual(SCAN_UNIFIED_INTAKE_BOUNDARY_FLAGS);
    expect(source.boundaryFlags.allowedMode).toBe('local_preview_only');
    expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
    expect(source.boundaryFlags.canCreateMatter).toBe(false);
    expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
    expect(source.boundaryFlags.requiresEldadApproval).toBe(true);
    expect(source.boundaryFlags.operationalActionBlocked).toBe(true);
  });

  it('maps multi-page scan metadata with manifest page count safely', () => {
    const source = mapScanMetadataToUnifiedIntakeSource({
      scan: MOCK_SCAN_METADATA_SOURCES[1],
    });

    expect(source.sourceType).toBe('scan');
    expect(source.sourceId).toBe('scan:scan-stage5c-document-004');
    expect(source.payloadSummary.snippet).toContain('Pages: 5');
    expect(source.payloadSummary.snippet).toContain('Resolution: 300 dpi');
    expect(source.payloadSummary.snippet).toContain(
      'Batch: scan-batch-stage5c-002',
    );
  });

  it('maps unknown low-quality scan metadata without optional fields', () => {
    const source = mapScanMetadataToUnifiedIntakeSource({
      scan: MOCK_SCAN_METADATA_SOURCES[2],
    });

    expect(source.sourceType).toBe('scan');
    expect(source.subjectOrFilename).toBe('synthetic-unknown-low-quality.png');
    expect(source.payloadSummary.fileType).toBe('png');
    expect(source.payloadSummary).not.toHaveProperty('sizeBytes');
    expect(source.payloadSummary.snippet).toContain('Confidence: low_quality');
  });

  it('does not model forbidden scan payload fields', () => {
    const serializedMocks = JSON.stringify(MOCK_SCAN_METADATA_SOURCES);
    const serializedSources = JSON.stringify(
      MOCK_SCAN_METADATA_SOURCES.map((scan) =>
        mapScanMetadataToUnifiedIntakeSource({ scan }),
      ),
    );

    for (const field of FORBIDDEN_SCAN_FIELDS) {
      expect(serializedMocks).not.toContain(field);
      expect(serializedSources).not.toContain(field);
    }
  });

  it('does not create operational records from scan metadata', () => {
    const source = mapScanMetadataToUnifiedIntakeSource({
      scan: MOCK_SCAN_METADATA_SOURCES[0],
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
