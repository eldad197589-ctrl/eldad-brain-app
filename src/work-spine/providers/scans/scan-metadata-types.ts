/* ============================================
   FILE: scan-metadata-types.ts
   PURPOSE: Pure scan manifest metadata contracts for Stage 5C Unified Intake mapping.
   DEPENDENCIES: None
   EXPORTS: Scan provider metadata contracts
   ============================================ */

// #region Provider Identity
/** Scanner provider identity used only inside scan-specific metadata. */
export type ScanMetadataProvider = 'local_scanner' | 'network_scanner';
// #endregion

// #region Metadata Constants
/** Scan file type values allowed in static scan metadata. */
export const SCAN_FILE_TYPES = ['pdf', 'jpeg', 'tiff', 'png'] as const;

/** Scan color mode values allowed in static scan metadata. */
export const SCAN_COLOR_MODES = ['color', 'grayscale', 'bw'] as const;

/** Scan confidence labels allowed in static scan metadata. */
export const SCAN_CONFIDENCE_LABELS = [
  'clear',
  'low_quality',
  'unknown',
] as const;
// #endregion

// #region Types
/** Scan file type values allowed in static scan metadata. */
export type ScanFileType = (typeof SCAN_FILE_TYPES)[number];

/** Scan color mode values allowed in static scan metadata. */
export type ScanColorMode = (typeof SCAN_COLOR_MODES)[number];

/** Scan confidence label values allowed in static scan metadata. */
export type ScanConfidenceLabel = (typeof SCAN_CONFIDENCE_LABELS)[number];

/** Metadata-only scan file contract for Unified Intake source previews. */
export interface ScanFileMetadata {
  /** Provider identity metadata. */
  provider: ScanMetadataProvider;
  /** Synthetic scan id from a static manifest. */
  scanId: string;
  /** Manifest filename metadata. */
  filename: string;
  /** Scanner identity metadata. */
  scannerIdentity: string;
  /** Scan timestamp metadata. */
  timestamp: string;
  /** Manifest file type metadata. */
  fileType: ScanFileType;
  /** File size metadata, when pre-known from a static manifest. */
  fileSizeBytes?: number;
  /** Page count metadata, when pre-known from a static manifest. */
  pageCount?: number;
  /** Scan resolution metadata, when pre-known from a static manifest. */
  scanResolutionDpi?: number;
  /** Scan color mode metadata, when pre-known from a static manifest. */
  colorMode?: ScanColorMode;
  /** Scanner model metadata, when present in the static manifest. */
  scannerModel?: string;
  /** Scan batch metadata, when present in the static manifest. */
  scanBatchId?: string;
  /** Scan quality confidence metadata. */
  confidenceLabel?: ScanConfidenceLabel;
}
// #endregion
