/* ====
   FILE: domain-boundary-index-seed.ts
   PURPOSE: Stage 18F-18G label-only static index rows.
   DEPENDENCIES: Domain boundary index contracts
   EXPORTS: Static Stage 18F-18G domain and boundary rows
   ==== */

// #region Imports
import type {
  DomainBoundaryIndexBoundaryRow,
  DomainBoundaryIndexDomainRow,
  DomainBoundaryIndexSeed,
} from './domain-boundary-index-types';
import {
  DOMAIN_BOUNDARY_INDEX_ROW_FALSE_FLAGS,
  DOMAIN_BOUNDARY_INDEX_SCOPE,
} from './domain-boundary-index-types';
// #endregion

// #region Static Rows
const staticRowMarkers = {
  labelOnly: true,
  staticOnly: true,
  indexOnly: true,
  safetyFlags: DOMAIN_BOUNDARY_INDEX_ROW_FALSE_FLAGS,
} as const;

/** Stage 18F external professional domain rows. */
export const STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS: readonly DomainBoundaryIndexDomainRow[] = [
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'tax',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'VAT',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'income_tax',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'payroll',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'labor_law',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'capital_gains',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'guardian',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'institutional_reports',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'Robium',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'construction',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'inventory_wms',
  },
  {
    ...staticRowMarkers,
    rowKind: 'external_professional_domain',
    stage: '18F',
    label: 'client_intake',
  },
] as const;

/** Stage 18G blocked runtime, provider, and action boundary rows. */
export const STAGE_18G_BLOCKED_BOUNDARY_ROWS: readonly DomainBoundaryIndexBoundaryRow[] = [
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'Gmail',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'Drive',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'Maven',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'APIs',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'providers',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'runtime',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'persistence',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'stores',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'accounting_posting',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'output_export_engines',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
  {
    ...staticRowMarkers,
    rowKind: 'blocked_boundary',
    stage: '18G',
    label: 'WorkItem_Matter_DocumentRef',
    boundaryMode: 'blocked_only',
    negativeOnly: true,
  },
] as const;

/** Complete isolated Stage 18F-18G domain and boundary index. */
export const STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX: DomainBoundaryIndexSeed = {
  scope: DOMAIN_BOUNDARY_INDEX_SCOPE,
  domains: STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS,
  boundaries: STAGE_18G_BLOCKED_BOUNDARY_ROWS,
} as const;
// #endregion
