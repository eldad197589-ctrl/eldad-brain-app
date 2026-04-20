// ==========================================
// FILE: run-derived-analytics-process.ts
// PURPOSE: Use-case orchestration generating read-only analytical views from linked mappings.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  DerivedAnalyticsService,
  DerivedViewType,
  AuditTraceService,
  IClientCaseMappingRepository,
  IDerivedViewRepository,
  ClientCaseMapping,
  DerivedViewStatus
} from '../index';

export interface RunDerivedAnalyticsProcessInput {
  actor_id: string;
  client_id: string;
  accounting_period_id: string;
  derived_view_type: DerivedViewType;
}

export interface RunDerivedAnalyticsProcessResult {
  is_success: boolean;
  view_generated: boolean;
  derived_view_id: string | null;
  source_records_used: number;
  records_excluded: number;
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Derived Analytics Process
 * Responsibility: Loads LINKED client case mappings for a given client/period,
 * feeds them to the analytics engine, and persists the resulting read-only view.
 * Cannot modify, post, or overwrite any upstream accounting truth.
 */
export class RunDerivedAnalyticsProcess {

  constructor(
    private clientCaseMappingRepo: IClientCaseMappingRepository,
    private derivedViewRepo: IDerivedViewRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunDerivedAnalyticsProcessInput): RunDerivedAnalyticsProcessResult {
    try {
      // 1. Mandatory identity & context gating
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory.');
      }
      if (!input.client_id || !input.accounting_period_id) {
        throw new Error('Orchestration Blocked: client_id and accounting_period_id are required for analytics.');
      }
      if (!input.derived_view_type) {
        throw new Error('Orchestration Blocked: derived_view_type is required.');
      }

      // 2. Load all mappings for the target client/period
      const mappings: ClientCaseMapping[] = this.clientCaseMappingRepo.listByPeriod(
        input.client_id,
        input.accounting_period_id
      );

      if (mappings.length === 0) {
        // Not a failure — simply no data to aggregate yet
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunDerivedAnalyticsProcess',
          target_object_type: 'DerivedView',
          target_object_id: 'NO_DATA',
          new_state: 'SKIPPED',
          reason: 'No client case mappings found for the specified client/period. Analytics skipped.',
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });

        return {
          is_success: true,
          view_generated: false,
          derived_view_id: null,
          source_records_used: 0,
          records_excluded: 0
        };
      }

      // 3. Execute domain service
      const analyticsService = new DerivedAnalyticsService();

      const result = analyticsService.generateView({
        mappings,
        viewType: input.derived_view_type,
        clientId: input.client_id,
        accountingPeriodId: input.accounting_period_id
      });

      // 4. Handle no-view outcome (all mappings excluded)
      if (!result.view) {
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunDerivedAnalyticsProcess',
          target_object_type: 'DerivedView',
          target_object_id: 'ALL_EXCLUDED',
          new_state: 'BLOCKED',
          reason: `All ${mappings.length} mappings were excluded (non-LINKED status). No view generated.`,
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });

        return {
          is_success: true,
          view_generated: false,
          derived_view_id: null,
          source_records_used: 0,
          records_excluded: result.excluded_count
        };
      }

      // 5. Persist and trace the generated view
      this.derivedViewRepo.create(result.view);

      let traceReason = 'Analytical view generated from linked mappings.';
      if (result.view.derived_view_status === DerivedViewStatus.NEEDS_REVIEW) {
        traceReason = 'View generated but flagged NEEDS_REVIEW: excluded records outnumber qualified records.';
      }

      this.auditTraceService.record({
        actor_id: input.actor_id,
        service_name: 'RunDerivedAnalyticsProcess',
        target_object_type: 'DerivedView',
        target_object_id: result.view.id,
        new_state: result.view.derived_view_status,
        reason: traceReason,
        related_client_if_any: input.client_id,
        related_accounting_period_if_any: input.accounting_period_id
      });

      return {
        is_success: true,
        view_generated: true,
        derived_view_id: result.view.id,
        source_records_used: result.view.source_record_count,
        records_excluded: result.excluded_count
      };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunDerivedAnalyticsProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_ANALYTICS_FAILURE',
        new_state: 'BLOCKED',
        reason: `Analytics orchestration halted: ${message}`
      });

      return {
        is_success: false,
        view_generated: false,
        derived_view_id: null,
        source_records_used: 0,
        records_excluded: 0,
        error_message: message
      };
    }
  }
}
