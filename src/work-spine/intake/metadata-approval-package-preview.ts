/* ==== FILE: src/work-spine/intake/metadata-approval-package-preview.ts ==== */

// #region Types
/** Input required to build a metadata-only approval package preview. */
export interface MetadataApprovalPackagePreviewInput {
  /** Static metadata candidate id */
  sourceId: string;
  /** Human-readable static source label */
  sourceLabel: string;
  /** Defensive metadata-only category suggestion */
  possibleCategory: string;
  /** Metadata-only confidence label */
  confidence: 'low' | 'medium';
  /** Metadata strings that shaped the preview */
  sourceSignals: readonly string[];
  /** Review gate preview id from the previous metadata-only gate */
  reviewGateId: string;
  /** Review gate status from the previous metadata-only gate */
  reviewStatus: 'pending_eldad_review';
}

/** Blocked action labels for the metadata approval package preview. */
export type MetadataApprovalPackageBlockedAction =
  | 'persistence_blocked'
  | 'entity_creation_blocked'
  | 'content_access_blocked'
  | 'ocr_blocked'
  | 'provider_connection_blocked'
  | 'sending_blocked'
  | 'filing_blocked'
  | 'submission_blocked';

/** Preview-only approval package shape for one metadata-classified candidate. */
export interface MetadataApprovalPackagePreview {
  /** Static preview package id */
  approvalPackageId: string;
  /** Static metadata candidate id */
  sourceId: string;
  /** Human-readable static source label */
  sourceLabel: string;
  /** Defensive metadata-only category suggestion */
  possibleCategory: string;
  /** Metadata-only confidence label */
  confidence: 'low' | 'medium';
  /** Metadata strings that shaped the preview */
  sourceSignals: readonly string[];
  /** Review gate preview id from the previous metadata-only gate */
  reviewGateId: string;
  /** Review gate status from the previous metadata-only gate */
  reviewStatus: 'pending_eldad_review';
  /** Package lifecycle marker that remains non-operational */
  packageStatus: 'preview_only_not_submitted';
  /** True because this is only a frontend preview package */
  previewPackageOnly: true;
  /** False because no retained write is allowed */
  persistenceAllowed: false;
  /** True because entity creation is blocked */
  entityCreationBlocked: true;
  /** True because no source content was read or checked */
  contentUnverified: true;
  /** False because content reading is blocked */
  contentRead: false;
  /** False because OCR is blocked */
  ocrPerformed: false;
  /** False because provider connection is blocked */
  providerConnected: false;
  /** False because sending is blocked */
  sendingAllowed: false;
  /** False because filing is blocked */
  filingAllowed: false;
  /** False because submission is blocked */
  submissionAllowed: false;
  /** Explicit blocked action list */
  blockedActions: readonly MetadataApprovalPackageBlockedAction[];
}
// #endregion

// #region Constants
/** Actions blocked for Stage 20A metadata-only approval package previews. */
export const METADATA_APPROVAL_PACKAGE_BLOCKED_ACTIONS: readonly MetadataApprovalPackageBlockedAction[] =
  [
    'persistence_blocked',
    'entity_creation_blocked',
    'content_access_blocked',
    'ocr_blocked',
    'provider_connection_blocked',
    'sending_blocked',
    'filing_blocked',
    'submission_blocked',
  ] as const;
// #endregion

// #region Builder
/** Builds a preview-only approval package from one metadata-classified candidate. */
export function buildMetadataApprovalPackagePreview(
  input: MetadataApprovalPackagePreviewInput,
): MetadataApprovalPackagePreview {
  return {
    approvalPackageId: `metadata-approval-package:${input.sourceId}`,
    sourceId: input.sourceId,
    sourceLabel: input.sourceLabel,
    possibleCategory: input.possibleCategory,
    confidence: input.confidence,
    sourceSignals: [...input.sourceSignals],
    reviewGateId: input.reviewGateId,
    reviewStatus: input.reviewStatus,
    packageStatus: 'preview_only_not_submitted',
    previewPackageOnly: true,
    persistenceAllowed: false,
    entityCreationBlocked: true,
    contentUnverified: true,
    contentRead: false,
    ocrPerformed: false,
    providerConnected: false,
    sendingAllowed: false,
    filingAllowed: false,
    submissionAllowed: false,
    blockedActions: [...METADATA_APPROVAL_PACKAGE_BLOCKED_ACTIONS],
  };
}
// #endregion
