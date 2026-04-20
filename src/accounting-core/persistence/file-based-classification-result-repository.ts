// ==========================================
// FILE: file-based-classification-result-repository.ts
// PURPOSE: Local durable persistence for ClassificationResult.
// ==========================================

import { ClassificationResult } from '../types/accounting-core-types';
import { IClassificationResultRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedClassificationResultRepository
  extends LocalStorageBaseRepository<ClassificationResult>
  implements IClassificationResultRepository {

  constructor() {
    super(EntityTypes.CLASSIFICATION_RESULT);
  }

  public listByClient(clientId: string): ClassificationResult[] {
    return this.listWhere(r => r.client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ClassificationResult[] {
    return this.listWhere(r => r.client_id === clientId && r.accounting_period_id === periodId);
  }
}
