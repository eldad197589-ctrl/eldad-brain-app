// ==========================================
// FILE: run-bookkeeping-preview-process.ts
// PURPOSE: Orchestrates the generation of candidate journal entries by locating eligible, securely verified mappings. Prevents posting logic entirely.
// DEPENDENCIES: BookkeepingPreviewService, Repositories
// ==========================================

import {
  IClientCaseMappingRepository,
  IResolutionResultRepository,
  IClassificationResultRepository,
  IExtractedFieldSetRepository
} from '../repositories/repository-interfaces';
import { AuditTraceService } from '../services/audit-trace-service';
import { BookkeepingPreviewService } from './bookkeeping-preview-service';
import { CandidateJournalEntry } from './bookkeeping-preview-types';
import { MappingStatus, ResolutionStatus } from '../types/accounting-core-types';

export interface RunBookkeepingPreviewInput {
  actor_id: string;
  client_id: string;
  accounting_period_id: string;
}

export interface RunBookkeepingPreviewOutput {
  is_success: boolean;
  generated_candidates: CandidateJournalEntry[];
  blocked_count: number;
}

export class RunBookkeepingPreviewProcess {
  constructor(
    private readonly previewService: BookkeepingPreviewService,
    private readonly mappingRepo: IClientCaseMappingRepository,
    private readonly resolutionRepo: IResolutionResultRepository,
    private readonly classificationRepo: IClassificationResultRepository,
    private readonly extractionRepo: IExtractedFieldSetRepository,
    private readonly auditLog: AuditTraceService
  ) {}

  public execute(input: RunBookkeepingPreviewInput): RunBookkeepingPreviewOutput {
    const candidates: CandidateJournalEntry[] = [];
    let blockedCount = 0;

    // 1. Fetch eligible mappings bounded by period and client
    const mappings = this.mappingRepo.listByPeriod(input.client_id, input.accounting_period_id);

    for (const mapping of mappings) {
      if (mapping.mapping_status !== MappingStatus.LINKED) {
        blockedCount++;
        continue;
      }

      const resolution = this.resolutionRepo.getById(mapping.resolution_result_id);
      if (!resolution || resolution.final_resolution_status !== ResolutionStatus.VERIFIED_CLASSIFICATION) {
        // Source node either missing or not verified (safety boundary check)
        blockedCount++;
        continue;
      }

      // 2. Transverse trace tree to retrieve actual extraction numbers accurately
      const classification = this.classificationRepo.getById(resolution.classification_result_id);
      if (!classification) {
        blockedCount++;
        continue;
      }

      const extraction = this.extractionRepo.getById(classification.extracted_field_set_id);
      if (!extraction) {
        blockedCount++;
        continue;
      }

      const gross = extraction.gross_amount_if_exists || 0;
      const vat = extraction.vat_amount_if_exists || 0;

      // 3. Delegate exclusively to pure stateless preview service
      const previewResult = this.previewService.generatePreview(
        resolution,
        mapping,
        input.accounting_period_id,
        gross,
        vat
      );

      if (previewResult.is_success && previewResult.candidate_entry) {
        candidates.push(previewResult.candidate_entry);
        
        // Formally track the preview orchestration access (Auditing reads/computations without writes)
        this.auditLog.record({
          actor_id: input.actor_id,
          service_name: 'RunBookkeepingPreviewProcess',
          target_object_type: 'CandidateJournalEntry',
          target_object_id: previewResult.candidate_entry.candidate_journal_entry_id,
          new_state: previewResult.candidate_entry.preview_status,
          reason: 'Preview generation mapping succeeded cleanly from valid verified input.',
          related_client_if_any: input.client_id,
          related_accounting_period_if_any: input.accounting_period_id
        });
      } else {
        blockedCount++;
      }
    }

    return {
      is_success: true,
      generated_candidates: candidates,
      blocked_count: blockedCount
    };
  }
}
