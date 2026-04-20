// ==========================================
// FILE: run-field-extraction-process.ts
// PURPOSE: Use-case orchestration executing the Field Extraction process boundary.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  FieldExtractionService,
  AuditTraceService,
  IDocumentIntakeRepository,
  IExtractedFieldSetRepository,
  DocumentIntakeEntity,
  ExtractedFieldSet,
  RawOcrSimulatedInput,
  ExtractionStatus
} from '../index';

export interface RunFieldExtractionProcessInput {
  actor_id: string; // Explicit executing identity
  document_intake_ids: string[];
  simulated_ocr_payloads: Map<string, RawOcrSimulatedInput>;
}

export interface RunFieldExtractionProcessResult {
  is_success: boolean;
  extractions_created: number;
  intakes_rejected: number;
  extracted_set_ids: string[];
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Field Extraction Process
 * Responsibility: Transports approved identifying Document Entities into the rigorous 
 * optical extraction bounds. Links OCR/AI Vision output directly via Domain Persistence,
 * permanently severing any unverified numeric assumptions.
 * Implements ironclad anti-silent-failure tracking mechanisms.
 */
export class RunFieldExtractionProcess {
  
  constructor(
    private documentIntakeRepo: IDocumentIntakeRepository,
    private extractedFieldSetRepo: IExtractedFieldSetRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunFieldExtractionProcessInput): RunFieldExtractionProcessResult {
    try {
      // 1. Hard identity gating
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory. Anonymous execution is prohibited.');
      }

      if (!input.document_intake_ids || input.document_intake_ids.length === 0) {
        throw new Error('Orchestration Blocked: No target Intake IDs provided for extraction mapping.');
      }

      // 2. Rehydrate required system entities checking relational decay
      const loadedIntakes: DocumentIntakeEntity[] = [];
      const missingIds: string[] = [];

      for (const id of input.document_intake_ids) {
        const intake = this.documentIntakeRepo.getById(id);
        if (intake) {
          loadedIntakes.push(intake);
        } else {
          missingIds.push(id);
        }
      }

      if (missingIds.length > 0) {
        // Critical block preventing partial states
        throw new Error(`Data Integrity Risk: Prevented cascading update. Failed to load ${missingIds.length} source Intakes.`);
      }

      // 3. Coordinate Service Execution
      const extractionService = new FieldExtractionService();
      
      const result = extractionService.extractFields(loadedIntakes, input.simulated_ocr_payloads);

      const outputIds: string[] = [];

      // 4. Secure Valid Outcomes Tracking Contradictions Transparently
      for (const fieldSet of result.extracted_fields) {
        this.extractedFieldSetRepo.create(fieldSet);
        outputIds.push(fieldSet.id);

        let traceReason = 'Structured data fields successfully acquired from document optical payload.';
        
        // Expose critical failures or mathematical breaks directly into the legal trace
        if (fieldSet.extraction_status === ExtractionStatus.NEEDS_REVIEW) {
          traceReason = `Mathematical contradiction or missing severe optical anchor detected. Handed exclusively over for review.`;
        } else if (fieldSet.extraction_status === ExtractionStatus.UNREADABLE) {
          traceReason = `Processing payload arrived intrinsically deficient. Systemic extraction blocked inherently.`;
        }

        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunFieldExtractionProcess',
          target_object_type: 'ExtractedFieldSet',
          target_object_id: fieldSet.id,
          new_state: fieldSet.extraction_status,
          reason: traceReason,
          prior_state_if_any: 'DOCUMENT_INTAKE'
        });
      }

      // 5. Audit entities failing prerequisites dynamically prior to touching extraction
      for (const rejectedIntake of result.rejected_intakes) {
         this.auditTraceService.record({
            actor_id: input.actor_id,
            service_name: 'RunFieldExtractionProcess',
            target_object_type: 'DocumentIntakeEntity',
            target_object_id: rejectedIntake.id,
            new_state: 'BLOCKED_FROM_EXTRACTION',
            reason: `Intake entity categorically refused extraction procedure due to structurally unsafe input status.`
         });
      }

      return {
        is_success: true,
        extractions_created: result.extracted_fields.length,
        intakes_rejected: result.rejected_intakes.length,
        extracted_set_ids: outputIds
      };

    } catch (error: any) {
      
      // Strict Anti-Silent-Death Sequence implementation ensures trace persists preceding crash
      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunFieldExtractionProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_EXTRACTION_BATCH_FAILURE',
        new_state: 'BLOCKED',
        reason: `Extraction process orchestration halted abruptly: ${error.message}`
      });

      return {
        is_success: false,
        extractions_created: 0,
        intakes_rejected: 0,
        extracted_set_ids: [],
        error_message: error.message
      };
    }
  }
}
