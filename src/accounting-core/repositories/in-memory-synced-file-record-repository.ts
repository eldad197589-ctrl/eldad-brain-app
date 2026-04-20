// ==========================================
// FILE: in-memory-synced-file-record-repository.ts
// PURPOSE: In-memory persistence adapter for SyncedFileRecord.
// ==========================================

import { SyncedFileRecord } from '../types/accounting-core-types';
import { ISyncedFileRecordRepository } from './repository-interfaces';

export class InMemorySyncedFileRecordRepository implements ISyncedFileRecordRepository {
  private store = new Map<string, SyncedFileRecord>();

  public create(entity: SyncedFileRecord): void {
    if (this.store.has(entity.id)) {
      throw new Error(`SyncedFileRecord with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): SyncedFileRecord | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }

  public listByBatch(batchId: string): SyncedFileRecord[] {
    return Array.from(this.store.values()).filter(r => r.sync_batch_id === batchId);
  }
}
