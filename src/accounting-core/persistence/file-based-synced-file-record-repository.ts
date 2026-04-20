// ==========================================
// FILE: file-based-synced-file-record-repository.ts
// PURPOSE: Local durable persistence for SyncedFileRecord.
// ==========================================

import { SyncedFileRecord } from '../types/accounting-core-types';
import { ISyncedFileRecordRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedSyncedFileRecordRepository
  extends LocalStorageBaseRepository<SyncedFileRecord>
  implements ISyncedFileRecordRepository {

  constructor() {
    super(EntityTypes.SYNCED_FILE_RECORD);
  }

  public listByBatch(batchId: string): SyncedFileRecord[] {
    return this.listWhere(r => r.sync_batch_id === batchId);
  }
}
