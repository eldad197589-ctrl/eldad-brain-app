/* ============================================
   FILE: scan-manifest-types.ts
   PURPOSE: Static scans manifest contracts for Stage 6C-1 read-only intake gate.
   DEPENDENCIES: Stage 5C scan metadata mapper and Unified Intake source contracts
   EXPORTS: Static scan manifest contracts and pure mapping helpers
   ============================================ */

// #region Imports
import type { UnifiedIntakeSource } from '../../intake/unified-intake-source-types';
import type {
  ScanColorMode,
  ScanConfidenceLabel,
  ScanFileMetadata,
  ScanFileType,
} from './scan-metadata-types';
import {
  mapScanMetadataToUnifiedIntakeSource,
} from './scan-metadata-to-unified-intake-source';
// #endregion

// #region Types
/** Versioned schema identifier for static scan manifests. */
export type ScanManifestSchemaVersion = 'stage6c1.static.v1';

/** Manifest-level source type, locked to scan. */
export type ScanManifestSourceType = 'scan';

/** Metadata-only static scan manifest entry. */
export interface ScanManifestEntry {
  /** Synthetic scan id from the manifest. */
  scanId: string;
  /** Manifest filename metadata only. */
  filename: string;
  /** Scanner identity metadata only. */
  scannerIdentity: string;
  /** Scan timestamp metadata. */
  timestamp: string;
  /** Manifest file type metadata. */
  fileType: ScanFileType;
  /** File size metadata, only if pre-known from the manifest. */
  fileSizeBytes?: number;
  /** Page count metadata, only if pre-known from the manifest. */
  pageCount?: number;
  /** Scan resolution metadata, only if manifest-provided. */
  scanResolutionDpi?: number;
  /** Scan color mode metadata, only if manifest-provided. */
  colorMode?: ScanColorMode;
  /** Scanner model metadata, only if manifest-provided. */
  scannerModel?: string;
  /** Scan batch metadata, only if manifest-provided. */
  scanBatchId?: string;
  /** Scan quality confidence metadata, only if manifest-provided. */
  confidenceLabel?: ScanConfidenceLabel;
  /** Time the manifest captured this metadata entry. */
  manifestCapturedAt: string;
}

/** Static manifest for read-only scan metadata intake gates. */
export interface ScanManifest {
  /** Static manifest schema version. */
  schemaVersion: ScanManifestSchemaVersion;
  /** Synthetic manifest id. */
  manifestId: string;
  /** Manifest generation timestamp. */
  generatedAt: string;
  /** Manifest source type, always scan. */
  sourceType: ScanManifestSourceType;
  /** Manifest scan metadata entries. */
  entries: readonly ScanManifestEntry[];
}
// #endregion

// #region Mapping
/** Converts a static manifest entry into the existing Stage 5C scan metadata contract. */
export const scanManifestEntryToScanFileMetadata = (
  entry: ScanManifestEntry,
): ScanFileMetadata => ({
  provider: 'local_scanner',
  scanId: entry.scanId,
  filename: entry.filename,
  scannerIdentity: entry.scannerIdentity,
  timestamp: entry.timestamp,
  fileType: entry.fileType,
  fileSizeBytes: entry.fileSizeBytes,
  pageCount: entry.pageCount,
  scanResolutionDpi: entry.scanResolutionDpi,
  colorMode: entry.colorMode,
  scannerModel: entry.scannerModel,
  scanBatchId: entry.scanBatchId,
  confidenceLabel: entry.confidenceLabel,
});

/** Maps a static scan manifest entry into a Unified Intake source preview. */
export const scanManifestEntryToUnifiedIntakeSource = (
  entry: ScanManifestEntry,
): UnifiedIntakeSource =>
  mapScanMetadataToUnifiedIntakeSource({
    scan: scanManifestEntryToScanFileMetadata(entry),
  });

/** Maps every static scan manifest entry into Unified Intake source previews. */
export const scanManifestToUnifiedIntakeSources = (
  manifest: ScanManifest,
): readonly UnifiedIntakeSource[] =>
  manifest.entries.map(scanManifestEntryToUnifiedIntakeSource);
// #endregion
