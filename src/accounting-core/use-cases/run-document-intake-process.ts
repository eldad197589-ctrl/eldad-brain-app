// ==========================================
// FILE: run-document-intake-process.ts
// PURPOSE: Use-case orchestration executing the Document Intake process boundary.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  DocumentIntakeService,
  AuditTraceService,
  ISyncedFileRecordRepository,
  IDocumentIntakeRepository,
  SyncedFileRecord,
  DocumentIntakeEntity,
  IntakeStatus,
  AuditTraceStatus
} from '../index';

export interface RunDocumentIntakeProcessInput {
  actor_id: string; // Explicit executing identity
  synced_file_record_ids: string[];
}

export interface RunDocumentIntakeProcessResult {
  is_success: boolean;
  intakes_created: number;
  records_rejected: number;
  intake_ids: string[];
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Document Intake Process
 * Responsibility: Transports approved synced physical records into the formal 
 * Document Intake bounds. Extracts from previous repository boundaries and generates
 * structured representations securely mapped back per system truth parameters.
 * No silent failures. High-traceability enforced.
 */
export class RunDocumentIntakeProcess {
  
  constructor(
    private syncedFileRecordRepo: ISyncedFileRecordRepository,
    private documentIntakeRepo: IDocumentIntakeRepository,
    private auditTraceService: AuditTraceService
  ) {}

  public execute(input: RunDocumentIntakeProcessInput): RunDocumentIntakeProcessResult {
    try {
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory. Silent operations forbidden.');
      }

      if (!input.synced_file_record_ids || input.synced_file_record_ids.length === 0) {
        throw new Error('Orchestration Blocked: No target record IDs provided for intake.');
      }

      // 1. Gather Source Evidence from Storage Repositories safely
      const loadedRecords: SyncedFileRecord[] = [];
      const missingIds: string[] = [];

      for (const id of input.synced_file_record_ids) {
        const record = this.syncedFileRecordRepo.getById(id);
        if (record) {
          loadedRecords.push(record);
        } else {
          missingIds.push(id);
        }
      }

      // Strict failure mode: If records drift out of sync with storage, abort the batch.
      if (missingIds.length > 0) {
        throw new Error(`Data Integrity Risk: Failed to load ${missingIds.length} expected SyncedFileRecords.`);
      }

      // 2. Instantiate and sequence pure domain gateway boundaries
      const intakeService = new DocumentIntakeService();
      
      const result = intakeService.processSyncedFiles(loadedRecords);

      const intakeIds: string[] = [];

      // 3. Systematically persist mapped outputs tracking strict progress sequentially
      for (const intake of result.accepted_intakes) {
        // Enforce Persistence
        this.documentIntakeRepo.create(intake);
        intakeIds.push(intake.id);

        // Audit confirmation loop ensuring history remains intact
        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunDocumentIntakeProcess',
          target_object_type: 'DocumentIntakeEntity',
          target_object_id: intake.id,
          new_state: intake.intake_status,
          reason: `Structurally transformed physical sync record into identifying core intake node.`,
          prior_state_if_any: 'SYNCED_FILE', // logical lineage
        });
      }

      // 4. Force trace transparency outlining records structurally prohibited from progressing
      for (const rejected of result.rejected_records) {
         this.auditTraceService.record({
            actor_id: input.actor_id,
            service_name: 'RunDocumentIntakeProcess',
            target_object_type: 'SyncedFileRecord',
            target_object_id: rejected.id,
            new_state: 'BLOCKED_FROM_INTAKE', // Dynamic soft-block path 
            reason: `Record failed ingestion viability gating natively at Intake bounds.`
         });
      }

      return {
        is_success: true,
        intakes_created: result.accepted_intakes.length,
        records_rejected: result.rejected_records.length,
        intake_ids: intakeIds
      };

    } catch (error: any) {
      
      // Strict Anti-Silent-Death Rule implementation
      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunDocumentIntakeProcess',
        target_object_type: 'OrchestrationContext',
        target_object_id: 'SYSTEM_INTAKE_BATCH_FAILURE',
        new_state: 'BLOCKED',
        reason: `Process orchestration halted abruptly: ${error.message}`
      });

      return {
        is_success: false,
        intakes_created: 0,
        records_rejected: 0,
        intake_ids: [],
        error_message: error.message
      };
    }
  }
}
