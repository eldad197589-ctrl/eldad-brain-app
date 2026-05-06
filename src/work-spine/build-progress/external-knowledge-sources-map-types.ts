/* ==== FILE: src/work-spine/build-progress/external-knowledge-sources-map-types.ts ==== */

// #region Constants
/** External source statuses for the Stage 18 index-only map. */
export const EXTERNAL_KNOWLEDGE_SOURCE_STATUSES = [
  'known_external_source',
  'partial_static_pointer',
  'needs_source_audit',
  'blocked_live_connection',
  'blocked_file_access',
  'unknown_needs_audit',
] as const;

/** External source kinds used for compact grouping. */
export const EXTERNAL_KNOWLEDGE_SOURCE_KINDS = [
  'professional_system',
  'professional_domain',
  'product_system',
  'product_context',
  'source_vault',
  'provider_export',
  'file_folder',
  'legacy_source_folder',
] as const;
// #endregion

// #region Types
/** Conservative status for an external source candidate. */
export type ExternalKnowledgeSourceStatus = (typeof EXTERNAL_KNOWLEDGE_SOURCE_STATUSES)[number];

/** Compact grouping kind for an external source candidate. */
export type ExternalKnowledgeSourceKind = (typeof EXTERNAL_KNOWLEDGE_SOURCE_KINDS)[number];
// #endregion

// #region Interfaces
/** Static index-only row for an external knowledge source candidate. */
export interface ExternalKnowledgeSourceMapRow {
  /** Stable source identifier. */
  sourceId: string;
  /** User-facing source label. */
  label: string;
  /** Broad professional or product domain. */
  domain: string;
  /** Source kind used for grouping. */
  sourceKind: ExternalKnowledgeSourceKind;
  /** Static location hint only, not a path read. */
  locationHint: string;
  /** Conservative source status. */
  status: ExternalKnowledgeSourceStatus;
  /** This row is an index pointer only. */
  indexOnly: true;
  /** No source content was read. */
  contentRead: false;
  /** No parsing was performed. */
  sourceParsed: false;
  /** No OCR was performed. */
  ocrPerformed: false;
  /** No provider was connected. */
  providerConnected: false;
  /** Source authenticity was not verified. */
  sourceVerified: false;
  /** Currentness of data was not verified. */
  dataCurrentVerified: false;
  /** This map cannot create records. */
  canCreateRecord: false;
  /** The Brain cannot act on this source through the map. */
  canActOnSource: false;
  /** Actions blocked for this source candidate. */
  blockedActions: readonly string[];
  /** Gate required before any access, mining, or provider work. */
  requiredGateBeforeAccess: string;
  /** Per-row warning rendered in the UI. */
  visibleWarning: string;
}
// #endregion
