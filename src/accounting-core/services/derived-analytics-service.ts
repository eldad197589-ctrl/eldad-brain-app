// ==========================================
// FILE: derived-analytics-service.ts
// PURPOSE: Backend/domain service for generating read-only analytical views from mapped data.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  ClientCaseMapping,
  DerivedView,
  MappingStatus,
  DerivedViewStatus
} from '../types/accounting-core-types';

export type DerivedViewType =
  | 'client_accounting_snapshot'
  | 'period_based_summary'
  | 'vat_oriented_analytical_view'
  | 'advance_tax_analytical_view'
  | 'expense_composition_view'
  | 'reconciliation_support_view';

export interface AnalyticsInput {
  mappings: ClientCaseMapping[];
  viewType: DerivedViewType;
  clientId: string;
  accountingPeriodId: string;
}

export interface AnalyticsServiceResult {
  view: DerivedView | null;
  excluded_count: number;
}

/**
 * Universal UUID generator fallback.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * CORE SERVICE 7: Derived Analytics Service
 * Responsibility: Read-only aggregation engine. Generates analytical summary views
 * exclusively from LINKED and verified mapped data. Cannot modify, post, or overwrite
 * any upstream accounting truth.
 */
export class DerivedAnalyticsService {

  /**
   * Generates a single derived analytical view from linked mapping records.
   * Only LINKED records participate. Blocked/NEEDS_REVIEW records are excluded silently.
   */
  public generateView(input: AnalyticsInput): AnalyticsServiceResult {
    // 1. Filter: only LINKED records qualify
    const qualified = input.mappings.filter(m => m.mapping_status === MappingStatus.LINKED);
    const excludedCount = input.mappings.length - qualified.length;

    if (qualified.length === 0) {
      return { view: null, excluded_count: excludedCount };
    }

    // 2. Aggregate by component
    const componentCounts = new Map<string, number>();
    for (const m of qualified) {
      const current = componentCounts.get(m.linked_accounting_component_id) ?? 0;
      componentCounts.set(m.linked_accounting_component_id, current + 1);
    }

    // 3. Build summary payload — read-only analytical container
    const summaryPayload: Record<string, unknown> = {
      view_type: input.viewType,
      total_records: qualified.length,
      component_distribution: Object.fromEntries(componentCounts),
      generated_at: new Date().toISOString()
    };

    // 4. Determine view status
    let viewStatus = DerivedViewStatus.GENERATED;
    if (excludedCount > 0 && excludedCount > qualified.length) {
      viewStatus = DerivedViewStatus.NEEDS_REVIEW;
    }

    // 5. Create DerivedView output
    const view: DerivedView = {
      id: generateUuid(),
      derived_view_type: input.viewType,
      source_record_count: qualified.length,
      derived_summary_payload: summaryPayload,
      derived_view_status: viewStatus,
      traceability_index_reference: qualified.map(m => m.id).join(','),
      client_id: input.clientId,
      accounting_period_id: input.accountingPeriodId
    };

    return { view, excluded_count: excludedCount };
  }
}
