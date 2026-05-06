/* ====
   FILE: domain-boundary-index-types.ts
   PURPOSE: Stage 18F-18G label-only static index contracts.
   DEPENDENCIES: None
   EXPORTS: Domain and boundary index types and static constants
   ==== */

// #region Constants
/** Stage 18F external professional domain labels. */
export const DOMAIN_BOUNDARY_INDEX_DOMAIN_LABELS = [
  'tax',
  'VAT',
  'income_tax',
  'payroll',
  'labor_law',
  'capital_gains',
  'guardian',
  'institutional_reports',
  'Robium',
  'construction',
  'inventory_wms',
  'client_intake',
] as const;

/** Stage 18G blocked boundary labels. */
export const DOMAIN_BOUNDARY_INDEX_BOUNDARY_LABELS = [
  'Gmail',
  'Drive',
  'Maven',
  'APIs',
  'providers',
  'runtime',
  'persistence',
  'stores',
  'accounting_posting',
  'output_export_engines',
  'WorkItem_Matter_DocumentRef',
] as const;

/** Static scope marker for the isolated Stage 18F-18G index. */
export const DOMAIN_BOUNDARY_INDEX_SCOPE = 'stage_18f_18g_label_only_static_index';

/** Shared false-only flags for every Stage 18F-18G row. */
export const DOMAIN_BOUNDARY_INDEX_ROW_FALSE_FLAGS = {
  professionalConclusionFlag: false,
  clientEvidenceClassificationFlag: false,
  actionFlag: false,
  providerActionFlag: false,
  runtimeActionFlag: false,
  storageWriteFlag: false,
  fileOutputFlag: false,
  accountingLedgerWriteFlag: false,
  recordMaterializationFlag: false,
} as const;
// #endregion

// #region Types
/** Allowed Stage 18F external professional domain label. */
export type DomainBoundaryIndexDomainLabel =
  (typeof DOMAIN_BOUNDARY_INDEX_DOMAIN_LABELS)[number];

/** Allowed Stage 18G blocked boundary label. */
export type DomainBoundaryIndexBoundaryLabel =
  (typeof DOMAIN_BOUNDARY_INDEX_BOUNDARY_LABELS)[number];

/** Stage marker for the isolated domain and boundary index. */
export type DomainBoundaryIndexStage = '18F' | '18G';

/** Row kind marker for the isolated domain and boundary index. */
export type DomainBoundaryIndexRowKind =
  | 'external_professional_domain'
  | 'blocked_boundary';

/** Boundary mode marker for Stage 18G rows. */
export type DomainBoundaryIndexBoundaryMode = 'blocked_only';

/** False-only safety flags attached to every Stage 18F-18G index row. */
export interface DomainBoundaryIndexRowFalseFlags {
  /** Confirms no professional conclusion is represented. */
  professionalConclusionFlag: false;
  /** Confirms no client evidence classification is represented. */
  clientEvidenceClassificationFlag: false;
  /** Confirms no action surface is represented. */
  actionFlag: false;
  /** Confirms no provider action surface is represented. */
  providerActionFlag: false;
  /** Confirms no runtime action surface is represented. */
  runtimeActionFlag: false;
  /** Confirms no storage write surface is represented. */
  storageWriteFlag: false;
  /** Confirms no file output surface is represented. */
  fileOutputFlag: false;
  /** Confirms no accounting ledger write surface is represented. */
  accountingLedgerWriteFlag: false;
  /** Confirms no operational record materialization is represented. */
  recordMaterializationFlag: false;
}

/** Shared static markers for every Stage 18F-18G index row. */
export interface DomainBoundaryIndexRowStaticMarkers {
  /** Confirms the row is label-only. */
  labelOnly: true;
  /** Confirms the row is static-only. */
  staticOnly: true;
  /** Confirms the row is index-only. */
  indexOnly: true;
}

/** Base row shape for the isolated Stage 18F-18G index. */
export interface DomainBoundaryIndexBaseRow
  extends DomainBoundaryIndexRowStaticMarkers {
  /** Row kind marker. */
  rowKind: DomainBoundaryIndexRowKind;
  /** Stage marker. */
  stage: DomainBoundaryIndexStage;
  /** Required label for the row. */
  label: string;
  /** False-only safety flags. */
  safetyFlags: DomainBoundaryIndexRowFalseFlags;
}

/** Stage 18F external professional domain row. */
export interface DomainBoundaryIndexDomainRow
  extends DomainBoundaryIndexBaseRow {
  /** Domain rows are external professional domain labels only. */
  rowKind: 'external_professional_domain';
  /** Domain rows belong to Stage 18F. */
  stage: '18F';
  /** Domain label. */
  label: DomainBoundaryIndexDomainLabel;
}

/** Stage 18G blocked runtime, provider, and action boundary row. */
export interface DomainBoundaryIndexBoundaryRow
  extends DomainBoundaryIndexBaseRow {
  /** Boundary rows are blocked boundary labels only. */
  rowKind: 'blocked_boundary';
  /** Boundary rows belong to Stage 18G. */
  stage: '18G';
  /** Boundary label. */
  label: DomainBoundaryIndexBoundaryLabel;
  /** Boundary rows are blocked only. */
  boundaryMode: DomainBoundaryIndexBoundaryMode;
  /** Confirms the row has only negative boundary meaning. */
  negativeOnly: true;
}

/** Complete isolated Stage 18F-18G static index. */
export interface DomainBoundaryIndexSeed {
  /** Static scope marker. */
  scope: typeof DOMAIN_BOUNDARY_INDEX_SCOPE;
  /** Stage 18F external professional domain rows. */
  domains: readonly DomainBoundaryIndexDomainRow[];
  /** Stage 18G blocked boundary rows. */
  boundaries: readonly DomainBoundaryIndexBoundaryRow[];
}
// #endregion
