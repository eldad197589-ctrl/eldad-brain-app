// ==========================================
// FILE: file-based-folder-sync-batch-repository.ts
// PURPOSE: Local durable persistence for FolderSyncBatch.
// ==========================================

import { FolderSyncBatch } from '../types/accounting-core-types';
import { IFolderSyncBatchRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedFolderSyncBatchRepository
  extends LocalStorageBaseRepository<FolderSyncBatch>
  implements IFolderSyncBatchRepository {

  constructor() {
    super(EntityTypes.FOLDER_SYNC_BATCH);
  }
}
