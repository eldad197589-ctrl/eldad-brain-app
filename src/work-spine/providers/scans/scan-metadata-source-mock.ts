/* ============================================
   FILE: scan-metadata-source-mock.ts
   PURPOSE: Static scan metadata-only mocks for Stage 5C Unified Intake mapping.
   DEPENDENCIES: Scan metadata contracts
   EXPORTS: Static scan source metadata mocks
   ============================================ */

// #region Imports
import type { ScanFileMetadata } from './scan-metadata-types';
// #endregion

// #region Mock Data
/** Static scan metadata-only file mocks using synthetic manifest references only. */
export const MOCK_SCAN_METADATA_SOURCES: readonly ScanFileMetadata[] = [
  {
    provider: 'local_scanner',
    scanId: 'scan-stage5c-invoice-001',
    filename: 'synthetic-invoice-scan.pdf',
    scannerIdentity: 'local-scanner-front-desk',
    timestamp: '2026-05-03T08:20:00.000Z',
    fileType: 'pdf',
    fileSizeBytes: 184512,
    pageCount: 1,
    scanResolutionDpi: 300,
    colorMode: 'color',
    scannerModel: 'Synthetic Scanner Model A',
    scanBatchId: 'scan-batch-stage5c-001',
    confidenceLabel: 'clear',
  },
  {
    provider: 'network_scanner',
    scanId: 'scan-stage5c-document-004',
    filename: 'synthetic-multi-page-document.pdf',
    scannerIdentity: 'network-scanner-office',
    timestamp: '2026-05-03T09:05:00.000Z',
    fileType: 'pdf',
    fileSizeBytes: 742880,
    pageCount: 5,
    scanResolutionDpi: 300,
    colorMode: 'grayscale',
    scannerModel: 'Synthetic Network Scanner',
    scanBatchId: 'scan-batch-stage5c-002',
    confidenceLabel: 'clear',
  },
  {
    provider: 'local_scanner',
    scanId: 'scan-stage5c-unknown-low-quality',
    filename: 'synthetic-unknown-low-quality.png',
    scannerIdentity: 'local-scanner-front-desk',
    timestamp: '2026-05-03T10:10:00.000Z',
    fileType: 'png',
    confidenceLabel: 'low_quality',
  },
];
// #endregion
