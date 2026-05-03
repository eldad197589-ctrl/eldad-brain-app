/* ============================================
   FILE: scan-manifest-seed.ts
   PURPOSE: Static scans manifest fixture for Stage 6C-1 read-only intake gate.
   DEPENDENCIES: Static scan manifest contracts
   EXPORTS: Static scans manifest fixture
   ============================================ */

// #region Imports
import type { ScanManifest } from './scan-manifest-types';
// #endregion

// #region Static Manifest
/** Static manifest-only scans fixture with synthetic metadata and no file locations. */
export const STATIC_SCAN_MANIFEST: ScanManifest = {
  schemaVersion: 'stage6c1.static.v1',
  manifestId: 'scan-manifest-stage6c1-static-001',
  generatedAt: '2026-05-03T12:00:00.000Z',
  sourceType: 'scan',
  entries: [
    {
      scanId: 'scan-stage6c1-invoice-001',
      filename: 'stage6c1-invoice-preview.pdf',
      scannerIdentity: 'static-manifest-front-desk',
      timestamp: '2026-05-03T11:10:00.000Z',
      fileType: 'pdf',
      fileSizeBytes: 192240,
      pageCount: 1,
      scanResolutionDpi: 300,
      colorMode: 'color',
      scannerModel: 'Static Manifest Scanner',
      scanBatchId: 'stage6c1-batch-001',
      confidenceLabel: 'clear',
      manifestCapturedAt: '2026-05-03T11:12:00.000Z',
    },
    {
      scanId: 'scan-stage6c1-document-004',
      filename: 'stage6c1-multi-page-document.pdf',
      scannerIdentity: 'static-manifest-network-scanner',
      timestamp: '2026-05-03T11:25:00.000Z',
      fileType: 'pdf',
      pageCount: 6,
      scanResolutionDpi: 300,
      colorMode: 'grayscale',
      scannerModel: 'Static Network Scanner',
      scanBatchId: 'stage6c1-batch-002',
      confidenceLabel: 'clear',
      manifestCapturedAt: '2026-05-03T11:27:00.000Z',
    },
    {
      scanId: 'scan-stage6c1-unknown-low-quality',
      filename: 'stage6c1-unknown-low-quality.png',
      scannerIdentity: 'static-manifest-front-desk',
      timestamp: '2026-05-03T11:40:00.000Z',
      fileType: 'png',
      confidenceLabel: 'low_quality',
      manifestCapturedAt: '2026-05-03T11:42:00.000Z',
    },
  ],
} as const;
// #endregion
