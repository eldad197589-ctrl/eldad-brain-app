// ==========================================
// FILE: run-classification-process.ts
// PURPOSE: Use-case orchestration executing the Automated Classification mapping bounds.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  ClassificationService,
  AuditTraceService,
  IExtractedFieldSetRepository,
  IClassificationResultRepository,
  ExtractedFieldSet,
  ClassificationResult,
  ClassificationStatus,
  AuditTraceStatus
} from '../index';

export interface RunClassificationProcessInput {
  actor_id: string; // Explicit executing identity
  client_id: string; // Structural requirement for component mapping
  accounting_period_id: string; // Structural boundary 
  extracted_field_set_ids: string[];
}

export interface RunClassificationProcessResult {
  is_success: boolean;
  classifications_created: number;
  classifications_blocked_or_rejected: number;
  classification_result_ids: string[];
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Classification Process
 * Responsibility: Transits mathematically verified OCR numbers into automated book 
 * component proposals (Ledger entries).
 * Enforces highest boundary rule: Code may ONLY PROPOSE (AUTO_CLASSIFIED or NEEDS_REVIEW).
 * No autonomous execution may emit a VERIFIED_CLASSIFICATION here.
 */
export class RunClassificationProcess {
  
  constructor(
    private extractedFieldSetRepo: IExtractedFieldSetRepository,
    private classificationResultRepo: IClassificationResultRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunClassificationProcessInput): RunClassificationProcessResult {
    try {
      // 1. Initial Gating and Strict Requirements
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory. Silent system operations are forbidden.');
      }
      
      if (!input.client_id || !input.accounting_period_id) {
         throw new Error('Orchestration Blocked: Classification logic intrinsically requires destination structural bindings (client & period).');
      }

      if (!input.extracted_field_set_ids || input.extracted_field_set_ids.length === 0) {
        throw new Error('Orchestration Blocked: Empty source lists rejected.');
      }

      // 2. Load and verify underlying truth from Repositories
      const loadedSets: ExtractedFieldSet[] = [];
      const missingIds: string[] = [];

      for (const id of input.extracted_field_set_ids) {
        const fieldSet = this.extractedFieldSetRepo.getById(id);
        if (fieldSet) {
          loadedSets.push(fieldSet);
        } else {
          missingIds.push(id);
        }
      }

      // Zero-Tolerance for repository drift
      if (missingIds.length > 0) {
        throw new Error(`Data Integrity Risk: Prevented cascading classification. Failed to locate ${missingIds.length} expected source Extraction Sets.`);
      }

      // 3. Initiate isolated Domain Engine mapping
      const classificationService = new ClassificationService();
      
      const result = classificationService.classifyExtractions(
         loadedSets,
         input.client_id, 
         input.accounting_period_id
      );


      const outputIds: string[] = [];
      let flaggedOrBlockedForMetrics = result.rejected_extractions.length; 

      // 4. Rigid State Enforcement & Audit Commitment
      for (const classification of result.classified_proposals) {
        
        // Supreme Architecture Gating:
        // ClassificationService must never produce VERIFIED — that's exclusively a Resolution concern.
        if ((classification.classification_status as string) === 'VERIFIED_CLASSIFICATION') {
            throw new Error(`Severe Boundary Violation: Auto-classification orchestrator attempted to fabricate a VERIFIED_CLASSIFICATION unassisted.`);
        }
        
        this.classificationResultRepo.create(classification);
        outputIds.push(classification.id);

        let traceReason = 'Heuristic rule engine generated valid ledger component proposal based on extracted values.';
        
        if (classification.classification_status === ClassificationStatus.NEEDS_REVIEW) {
           traceReason = 'Rule engine confidence was insufficient or exception caught. Proposal requires explicit Human Review gateway.';
           flaggedOrBlockedForMetrics++; 
        }

        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunClassificationProcess',
          target_object_type: 'ClassificationResult',
          target_object_id: classification.id,
          new_state: classification.classification_status,
          reason: traceReason,
          prior_state_if_any: 'EXTRACTED_FIELD_SET'
        });
      }

      // 5. Track unprocessable items for total trace transparency
      for (const rejected of result.rejected_extractions) {
         this.auditTraceService.record({
            actor_id: input.actor_id,
            service_name: 'RunClassificationProcess',
            target_object_type: 'ExtractedFieldSet',
            target_object_id: rejected.id,
            new_state: 'BLOCKED_FROM_CLASSIFICATION',
            reason: `Field set logically rejected prior to component formulation. Inherently blocked.`
         });
      }

      return {
        is_success: true,
        classifications_created: result.classified_proposals.length,
        classifications_blocked_or_rejected: flaggedOrBlockedForMetrics,
        classification_result_ids: outputIds
      };

    } catch (error: any) {
      
      // Strict Anti-Silent-Crash Guarantee
      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunClassificationProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_CLASSIFICATION_BATCH_FAILURE',
        new_state: 'BLOCKED',
        reason: `Process orchestration halted abruptly securing state integrity: ${error.message}`
      });

      return {
        is_success: false,
        classifications_created: 0,
        classifications_blocked_or_rejected: 0,
        classification_result_ids: [],
        error_message: error.message
      };
    }
  }
}
