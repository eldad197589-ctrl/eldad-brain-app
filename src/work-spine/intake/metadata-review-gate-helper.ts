/* ==== FILE: src/work-spine/intake/metadata-review-gate-helper.ts ==== */

// #region Constants
/** Blocked actions for the static metadata review gate preview. */
export const METADATA_REVIEW_GATE_BLOCKED_ACTIONS = [
  'persistence_blocked',
  'store_access_blocked',
  'content_access_blocked',
  'ocr_blocked',
  'provider_connection_blocked',
  'operational_execution_blocked',
] as const;
// #endregion

// #region Types
/** Blocked action marker for a metadata review gate preview. */
export type MetadataReviewGateBlockedAction = (typeof METADATA_REVIEW_GATE_BLOCKED_ACTIONS)[number];

/** Minimal metadata-only input for Eldad review gate preview. */
export interface MetadataReviewGateInput {
  /** Stable metadata source identifier. */
  sourceId: string;
  /** Human-facing source label. */
  sourceLabel: string;
  /** Source type label, such as gmail, drive, scan, or manual. */
  sourceType: string;
  /** Metadata timestamp label when available. */
  timestampLabel: string | null;
}

/** Static preview gate shown before any operational action can happen. */
export interface MetadataReviewGatePreview {
  /** Stable gate preview identifier. */
  reviewGateId: string;
  /** Source identifier copied from metadata input. */
  sourceId: string;
  /** Human-facing source label copied from metadata input. */
  sourceLabel: string;
  /** Source type label copied from metadata input. */
  sourceType: string;
  /** Metadata timestamp label copied from metadata input. */
  timestampLabel: string | null;
  /** Review status for Eldad preview. */
  reviewStatus: 'pending_eldad_review';
  /** Marker proving this is preview-only. */
  previewOnly: true;
  /** Marker proving no persistence is allowed. */
  noPersistence: true;
  /** Marker proving this is only a static review gate. */
  staticReviewGateOnly: true;
  /** Marker proving no operational execution is allowed. */
  operationalExecution: false;
  /** Marker proving source content was not read. */
  contentRead: false;
  /** Marker proving OCR was not performed. */
  ocrPerformed: false;
  /** Marker proving no provider was connected. */
  providerConnected: false;
  /** Blocked actions attached to this preview. */
  blockedActions: readonly MetadataReviewGateBlockedAction[];
}
// #endregion

// #region Helper
/** Builds a stateless preview-only metadata review gate for Eldad approval. */
export function buildMetadataReviewGatePreview(input: MetadataReviewGateInput): MetadataReviewGatePreview {
  return {
    reviewGateId: `metadata-review-gate:${input.sourceId}`,
    sourceId: input.sourceId,
    sourceLabel: input.sourceLabel,
    sourceType: input.sourceType,
    timestampLabel: input.timestampLabel,
    reviewStatus: 'pending_eldad_review',
    previewOnly: true,
    noPersistence: true,
    staticReviewGateOnly: true,
    operationalExecution: false,
    contentRead: false,
    ocrPerformed: false,
    providerConnected: false,
    blockedActions: [...METADATA_REVIEW_GATE_BLOCKED_ACTIONS],
  };
}
// #endregion
