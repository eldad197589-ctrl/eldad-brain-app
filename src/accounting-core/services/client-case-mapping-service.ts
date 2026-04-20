// ==========================================
// FILE: client-case-mapping-service.ts
// PURPOSE: Backend/domain service for linking verified resolutions to client trees and periods.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  ResolutionResult,
  ClientCaseMapping,
  ResolutionStatus,
  MappingStatus
} from '../types/accounting-core-types';

export interface MappingServiceResult {
  mapped: ClientCaseMapping[];
  rejected: ResolutionResult[];
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
 * CORE SERVICE 6: Client Case Mapping Service
 * Responsibility: Deterministically lock VERIFIED resolution results into a specific
 * client namespace and accounting period. Prevents duplicate linkage and data drift.
 * Accepts only VERIFIED_CLASSIFICATION items — everything else is rejected.
 */
export class ClientCaseMappingService {

  /**
   * Links verified resolution results into the client/period tree.
   * Duplicate detection is performed against a set of already-mapped resolution IDs.
   */
  public mapVerifiedResults(
    resolutions: ResolutionResult[],
    clientId: string,
    accountingPeriodId: string,
    alreadyMappedResolutionIds: Set<string>
  ): MappingServiceResult {

    const mapped: ClientCaseMapping[] = [];
    const rejected: ResolutionResult[] = [];

    for (const resolution of resolutions) {
      // 1. Accept only VERIFIED_CLASSIFICATION
      if (resolution.final_resolution_status !== ResolutionStatus.VERIFIED_CLASSIFICATION) {
        rejected.push(resolution);
        continue;
      }

      // 2. Guard against duplicate linkage
      if (alreadyMappedResolutionIds.has(resolution.id)) {
        rejected.push(resolution);
        continue;
      }

      // 3. Require a verified component to exist
      if (!resolution.final_accounting_component_if_verified) {
        rejected.push(resolution);
        continue;
      }

      // 4. Create deterministic mapping record
      const mapping: ClientCaseMapping = {
        id: generateUuid(),
        resolution_result_id: resolution.id,
        mapping_status: MappingStatus.LINKED,
        linked_client_id: clientId,
        linked_accounting_period_id: accountingPeriodId,
        linked_verified_document_id: resolution.classification_result_id,
        linked_verified_classification_id: resolution.id,
        linked_accounting_component_id: resolution.final_accounting_component_if_verified
      };

      mapped.push(mapping);
    }

    return { mapped, rejected };
  }
}
