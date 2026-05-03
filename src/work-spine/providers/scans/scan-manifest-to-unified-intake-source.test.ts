/* ============================================
   FILE: scan-manifest-to-unified-intake-source.test.ts
   PURPOSE: Stage 6C-1 static scan manifest contract and mapping tests.
   DEPENDENCIES: Vitest, static scan manifest fixture, and manifest mapping helpers
   EXPORTS: None
   ============================================ */

// #region Imports
import { describe, expect, it } from 'vitest';
import { STATIC_SCAN_MANIFEST } from './scan-manifest-seed';
import {
  scanManifestEntryToScanFileMetadata,
  scanManifestEntryToUnifiedIntakeSource,
  scanManifestToUnifiedIntakeSources,
} from './scan-manifest-types';
// #endregion

// #region Test Constants
const ALLOWED_ENTRY_FIELDS = [
  'scanId',
  'filename',
  'scannerIdentity',
  'timestamp',
  'fileType',
  'fileSizeBytes',
  'pageCount',
  'scanResolutionDpi',
  'colorMode',
  'scannerModel',
  'scanBatchId',
  'confidenceLabel',
  'manifestCapturedAt',
] as const;

const REQUIRED_ENTRY_FIELDS = [
  'scanId',
  'filename',
  'scannerIdentity',
  'timestamp',
  'fileType',
  'manifestCapturedAt',
] as const;

const FORBIDDEN_MANIFEST_FIELDS = [
  'filePath',
  'realPath',
  'absolutePath',
  'content',
  'body',
  'text',
  'rawContent',
  'ocrText',
  'extractedText',
  'pdfText',
  'base64',
  'buffer',
  'imageData',
  'rawBytes',
  'thumbnail',
  'fileContent',
] as const;
// #endregion

// #region Tests
describe('Stage 6C-1 static scans manifest', () => {
  it('contains only allowed static manifest entry fields', () => {
    expect(STATIC_SCAN_MANIFEST.schemaVersion).toBe('stage6c1.static.v1');
    expect(STATIC_SCAN_MANIFEST.sourceType).toBe('scan');
    expect(STATIC_SCAN_MANIFEST.entries.length).toBe(3);

    for (const entry of STATIC_SCAN_MANIFEST.entries) {
      for (const key of Object.keys(entry)) {
        expect(ALLOWED_ENTRY_FIELDS).toContain(key);
      }

      for (const key of REQUIRED_ENTRY_FIELDS) {
        expect(entry).toHaveProperty(key);
      }
    }
  });

  it('maps every manifest entry to sourceType scan', () => {
    const sources = scanManifestToUnifiedIntakeSources(STATIC_SCAN_MANIFEST);

    expect(sources).toHaveLength(STATIC_SCAN_MANIFEST.entries.length);
    for (const source of sources) {
      expect(source.sourceType).toBe('scan');
      expect(source.sourceId.startsWith('scan:scan-stage6c1-')).toBe(true);
    }
  });

  it('keeps boundary flags locked for every manifest source', () => {
    const sources = scanManifestToUnifiedIntakeSources(STATIC_SCAN_MANIFEST);

    for (const source of sources) {
      expect(source.boundaryFlags.allowedMode).toBe('local_preview_only');
      expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
      expect(source.boundaryFlags.canCreateMatter).toBe(false);
      expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
      expect(source.boundaryFlags.requiresEldadApproval).toBe(true);
      expect(source.boundaryFlags.operationalActionBlocked).toBe(true);
    }
  });

  it('handles missing optional manifest metadata safely', () => {
    const minimalEntry =
      STATIC_SCAN_MANIFEST.entries[STATIC_SCAN_MANIFEST.entries.length - 1];
    const metadata = scanManifestEntryToScanFileMetadata(minimalEntry);
    const source = scanManifestEntryToUnifiedIntakeSource(minimalEntry);

    expect(metadata.fileSizeBytes).toBeUndefined();
    expect(metadata.pageCount).toBeUndefined();
    expect(metadata.scanResolutionDpi).toBeUndefined();
    expect(source.payloadSummary).not.toHaveProperty('sizeBytes');
    expect(source.payloadSummary.snippet).toContain('Confidence: low_quality');
  });

  it('does not expose forbidden manifest or source payload fields', () => {
    const serializedManifest = JSON.stringify(STATIC_SCAN_MANIFEST);
    const serializedSources = JSON.stringify(
      scanManifestToUnifiedIntakeSources(STATIC_SCAN_MANIFEST),
    );

    for (const field of FORBIDDEN_MANIFEST_FIELDS) {
      expect(serializedManifest).not.toContain(field);
      expect(serializedSources).not.toContain(field);
    }
  });

  it('does not create operational records from manifest metadata', () => {
    const source = scanManifestEntryToUnifiedIntakeSource(
      STATIC_SCAN_MANIFEST.entries[0],
    );

    expect(source).not.toHaveProperty('workItem');
    expect(source).not.toHaveProperty('matter');
    expect(source).not.toHaveProperty('documentRef');
    expect(source.boundaryFlags.canCreateWorkItem).toBe(false);
    expect(source.boundaryFlags.canCreateMatter).toBe(false);
    expect(source.boundaryFlags.canCreateDocumentRef).toBe(false);
  });
});
// #endregion
