// ==========================================
// FILE: file-based-resolution-result-repository.ts
// PURPOSE: Local durable persistence for ResolutionResult.
// ==========================================

import { ResolutionResult } from '../types/accounting-core-types';
import { IResolutionResultRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedResolutionResultRepository
  extends LocalStorageBaseRepository<ResolutionResult>
  implements IResolutionResultRepository {

  constructor() {
    super(EntityTypes.RESOLUTION_RESULT);
  }
}
