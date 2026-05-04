/* ==== FILE: src/work-spine/build-progress/brain-system-source-map-types.ts ==== */

// #region Constants
/** Status values for index-only source rows around Eldad Brain. */
export const BRAIN_SYSTEM_SOURCE_MAP_STATUSES = [
  'known_source',
  'partial_static',
  'imported_context',
  'needs_mining',
  'blocked_live_connection',
  'unknown_needs_audit',
] as const;

/** Source kinds used for compact grouping in the source map. */
export const BRAIN_SYSTEM_SOURCE_KINDS = [
  'internal_brain_system',
  'governance',
  'static_inventory',
  'manual_source_area',
  'case_context',
  'professional_domain',
  'product_context',
  'provider_snapshot',
  'runtime_area',
  'output_engine',
] as const;

/** Risk levels for source rows, without implying source trust. */
export const BRAIN_SYSTEM_SOURCE_RISK_LEVELS = ['low', 'medium', 'high', 'blocked'] as const;
// #endregion

// #region Types
/** Index-only status of a known source area. */
export type BrainSystemSourceStatus = (typeof BRAIN_SYSTEM_SOURCE_MAP_STATUSES)[number];

/** Compact grouping kind for a source area. */
export type BrainSystemSourceKind = (typeof BRAIN_SYSTEM_SOURCE_KINDS)[number];

/** Static risk level for a source row. */
export type BrainSystemSourceRiskLevel = (typeof BRAIN_SYSTEM_SOURCE_RISK_LEVELS)[number];
// #endregion

// #region Interfaces
/** Static index row for a known or candidate source around Eldad Brain. */
export interface BrainSystemSourceMapRow {
  /** Stable source row identifier. */
  sourceId: string;
  /** User-facing source label. */
  label: string;
  /** Broad domain label for filtering and grouping. */
  domain: string;
  /** Static source grouping kind. */
  sourceKind: BrainSystemSourceKind;
  /** Conservative source-map status. */
  status: BrainSystemSourceStatus;
  /** Marker that this is only an index row. */
  indexOnly: true;
  /** Source content was not read. */
  contentRead: false;
  /** Source was not mined. */
  sourceMined: false;
  /** Source was not verified. */
  sourceVerified: false;
  /** Currentness of data was not verified. */
  dataCurrentVerified: false;
  /** No live source connection exists through this map. */
  liveConnectionExists: false;
  /** The Brain cannot act on the source through this map. */
  canActOnSource: false;
  /** The row does not establish professional reliability. */
  professionallyReliable: false;
  /** Actions blocked for this source row. */
  blockedActions: readonly string[];
  /** Conservative risk marker. */
  riskLevel: BrainSystemSourceRiskLevel;
  /** Gate required before any mining or deeper review. */
  requiredGateBeforeMining: string;
  /** What is known at index level only. */
  whatIsKnown: string;
  /** What remains unknown or blocked. */
  whatIsNotKnown: string;
  /** Per-row warning shown in the UI. */
  visibleWarning: string;
}
// #endregion
