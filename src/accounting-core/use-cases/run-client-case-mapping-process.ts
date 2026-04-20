// ==========================================
// FILE: run-client-case-mapping-process.ts
// PURPOSE: Use-case orchestration binding verified resolutions to client/period trees.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  ClientCaseMappingService,
  AuditTraceService,
  IResolutionResultRepository,
  IClientCaseMappingRepository,
  ResolutionResult,
  ResolutionStatus,
  MappingStatus
} from '../index';

export interface RunClientCaseMappingProcessInput {
  actor_id: string;
  client_id: string;
  accounting_period_id: string;
  resolution_result_ids: string[];
}

export interface RunClientCaseMappingProcessResult {
  is_success: boolean;
  mappings_created: number;
  resolutions_rejected: number;
  mapping_ids: string[];
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Client Case Mapping Process
 * Responsibility: Loads verified resolution results, binds them to a concrete
 * client/period namespace, and persists the linkage. Only VERIFIED_CLASSIFICATION
 * resolutions may pass — everything else is explicitly rejected and traced.
 */
export class RunClientCaseMappingProcess {

  constructor(
    private resolutionResultRepo: IResolutionResultRepository,
    private clientCaseMappingRepo: IClientCaseMappingRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunClientCaseMappingProcessInput): RunClientCaseMappingProcessResult {
    try {
      // 1. Mandatory identity & context gating
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory.');
      }
      if (!input.client_id || !input.accounting_period_id) {
        throw new Error('Orchestration Blocked: client_id and accounting_period_id are required for mapping.');
      }
      if (!input.resolution_result_ids || input.resolution_result_ids.length === 0) {
        throw new Error('Orchestration Blocked: No resolution IDs provided.');
      }

      // 2. Load resolutions from repository — zero tolerance for missing data
      const loadedResolutions: ResolutionResult[] = [];
      const missingIds: string[] = [];

      for (const id of input.resolution_result_ids) {
        const resolution = this.resolutionResultRepo.getById(id);
        if (resolution) {
          loadedResolutions.push(resolution);
        } else {
          missingIds.push(id);
        }
      }

      if (missingIds.length > 0) {
        throw new Error(
          `Data Integrity Risk: ${missingIds.length} ResolutionResult IDs not found in repository. Mapping batch aborted.`
        );
      }

      // 3. Pre-filter: orchestration-level guard against non-VERIFIED resolutions
      const verified: ResolutionResult[] = [];
      const nonVerified: ResolutionResult[] = [];

      for (const r of loadedResolutions) {
        if (r.final_resolution_status === ResolutionStatus.VERIFIED_CLASSIFICATION) {
          verified.push(r);
        } else {
          nonVerified.push(r);
        }
      }

      // Trace every non-verified attempt explicitly — no silent swallowing
      for (const rejected of nonVerified) {
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunClientCaseMappingProcess',
          target_object_type: 'ResolutionResult',
          target_object_id: rejected.id,
          new_state: 'BLOCKED_FROM_MAPPING',
          reason: `Resolution status is ${rejected.final_resolution_status}, not VERIFIED_CLASSIFICATION. Mapping refused.`,
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });
      }

      // 4. Build duplicate-detection set from existing mappings
      const existingMappings = this.clientCaseMappingRepo.listByPeriod(
        input.client_id,
        input.accounting_period_id
      );
      const alreadyMappedResolutionIds = new Set(
        existingMappings.map(m => m.resolution_result_id)
      );

      // 5. Execute domain service
      const mappingService = new ClientCaseMappingService();

      const result = mappingService.mapVerifiedResults(
        verified,
        input.client_id,
        input.accounting_period_id,
        alreadyMappedResolutionIds
      );

      const outputIds: string[] = [];

      // 6. Persist and trace each mapping
      for (const mapping of result.mapped) {
        this.clientCaseMappingRepo.create(mapping);
        outputIds.push(mapping.id);

        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunClientCaseMappingProcess',
          target_object_type: 'ClientCaseMapping',
          target_object_id: mapping.id,
          new_state: mapping.mapping_status,
          reason: 'Verified resolution locked into client/period namespace.',
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });
      }

      // 7. Trace service-level rejections (duplicates, missing component)
      for (const rejected of result.rejected) {
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunClientCaseMappingProcess',
          target_object_type: 'ResolutionResult',
          target_object_id: rejected.id,
          new_state: 'REJECTED_BY_MAPPING_SERVICE',
          reason: 'Domain service rejected resolution (duplicate linkage or missing verified component).',
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });
      }

      return {
        is_success: true,
        mappings_created: result.mapped.length,
        resolutions_rejected: nonVerified.length + result.rejected.length,
        mapping_ids: outputIds
      };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunClientCaseMappingProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_MAPPING_BATCH_FAILURE',
        new_state: 'BLOCKED',
        reason: `Mapping orchestration halted: ${message}`
      });

      return {
        is_success: false,
        mappings_created: 0,
        resolutions_rejected: 0,
        mapping_ids: [],
        error_message: message
      };
    }
  }
}
