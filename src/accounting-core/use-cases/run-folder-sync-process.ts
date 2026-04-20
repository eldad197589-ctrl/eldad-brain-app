// ==========================================
// FILE: run-folder-sync-process.ts
// PURPOSE: Use-case orchestration executing the Folder Sync process boundary.
// DEPENDENCIES: index.ts (Accounting Core Module exports)
// ==========================================

import {
  FolderSyncIngestionService,
  AuditTraceService,
  IFolderSyncBatchRepository,
  ISyncedFileRecordRepository,
  SyncFileInput,
  FolderSyncBatch,
  SyncedFileRecord,
  SyncStatus,
  AuditTraceStatus
} from '../index';

export interface RunFolderSyncProcessInput {
  actor_id: string; // Explicit executing identity
  source_machine_reference: string;
  root_path: string;
  client_folder_path: string;
  files: SyncFileInput[];
  existing_global_hashes: Set<string>;
}

export interface RunFolderSyncProcessResult {
  is_success: boolean;
  batch?: FolderSyncBatch;
  records_processed: number;
  records_synced: number;
  records_blocked_or_flagged: number;
  error_message?: string;
}

/**
 * ORCHESTRATION LAYER: Folder Sync Process
 * Responsibility: Wires the Domain Service logic (FolderSyncIngestionService)
 * with Persistence Repositories ensuring transactions aren't written blindly.
 * No silent failures; any failure directly yields explicit tracking via Audit.
 */
export class RunFolderSyncProcess {
  
  constructor(
    private folderSyncBatchRepo: IFolderSyncBatchRepository,
    private syncedFileRecordRepo: ISyncedFileRecordRepository,
    private auditTraceService: AuditTraceService // Preferring Domain Service over pure Repo for Audit validations
  ) {}

  public execute(input: RunFolderSyncProcessInput): RunFolderSyncProcessResult {
    try {
      if (!input.actor_id) {
        throw new Error('Orchestration Blocked: actor_id is mandatory. Silent operations forbidden.');
      }

      // 1. Instantiate pure domain boundary logic
      const syncService = new FolderSyncIngestionService(input.source_machine_reference);

      // 2. Generate immutable domain representations exclusively via Service logic
      const result = syncService.processClientFolder(
        input.root_path,
        input.client_folder_path,
        input.files,
        input.existing_global_hashes
      );

      // 3. Persist generated Batch parent safely
      this.folderSyncBatchRepo.create(result.batch);
      
      // 4. Force trace insertion explicitly tracking the new Batch entry
      const batchTrace = this.auditTraceService.record({
        actor_id: input.actor_id,
        service_name: 'RunFolderSyncProcess',
        target_object_type: 'FolderSyncBatch',
        target_object_id: result.batch.id,
        new_state: 'CREATED',
        reason: 'New folder sync batch orchestrator execution initialized'
      });

      if (batchTrace.status === AuditTraceStatus.BLOCKED || batchTrace.status === AuditTraceStatus.NEEDS_REVIEW) {
        // Halt processing strictly if traceability engines detect anomaly flags
        throw new Error(`Audit Engine Refusal: ${batchTrace.error_reason}`);
      }

      let syncedCount = 0;
      let flaggedCount = 0;

      // 5. Flow and insert underlying Sync Records tracking explicit status traces per file
      for (const record of result.records) {
        this.syncedFileRecordRepo.create(record);

        if (record.sync_status === SyncStatus.SYNCED) {
          syncedCount++;
        } else {
          flaggedCount++; // Aggregates UNREADABLE, DUPLICATE_SUSPECT, BLOCKED
        }

        const traceReason = record.sync_status === SyncStatus.SYNCED 
          ? 'Physical file effectively mapped into tracking structure' 
          : `Physical file encountered processing constraints resulting in flag: ${record.sync_status}`;

        this.auditTraceService.record({
          actor_id: input.actor_id,
          service_name: 'RunFolderSyncProcess',
          target_object_type: 'SyncedFileRecord',
          target_object_id: record.id,
          new_state: record.sync_status,
          reason: traceReason,
          related_batch_or_run_id_if_any: result.batch.id
        });
      }

      return {
        is_success: true,
        batch: result.batch,
        records_processed: result.records.length,
        records_synced: syncedCount,
        records_blocked_or_flagged: flaggedCount
      };

    } catch (error: any) {
      
      // Strict Anti-Silent-Death Rule implementation
      // Failures explicitly trace blocked interactions attempting persistence before returning hard errors natively.
      this.auditTraceService.record({
        actor_id: input.actor_id || 'UNKNOWN_ACTOR_FAILURE',
        service_name: 'RunFolderSyncProcess',
        target_object_type: 'FolderSyncBatch/EntireExecution',
        target_object_id: 'ORCHESTRATION_CONTEXT',
        new_state: 'BLOCKED',
        reason: `Process orchestration halted abruptly: ${error.message}`
      });

      return {
        is_success: false,
        records_processed: 0,
        records_synced: 0,
        records_blocked_or_flagged: 0,
        error_message: error.message
      };
    }
  }
}
