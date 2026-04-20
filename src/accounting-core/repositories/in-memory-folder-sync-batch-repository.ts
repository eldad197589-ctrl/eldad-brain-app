// ==========================================
// FILE: in-memory-folder-sync-batch-repository.ts
// PURPOSE: In-memory persistence adapter for FolderSyncBatch.
// ==========================================

import { FolderSyncBatch } from '../types/accounting-core-types';
import { IFolderSyncBatchRepository } from './repository-interfaces';

export class InMemoryFolderSyncBatchRepository implements IFolderSyncBatchRepository {
  private store = new Map<string, FolderSyncBatch>();

  public create(entity: FolderSyncBatch): void {
    if (this.store.has(entity.id)) {
      throw new Error(`FolderSyncBatch with ID ${entity.id} already exists (No Overwrite).`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): FolderSyncBatch | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }
}
