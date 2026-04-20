// ==========================================
// FILE: file-based-derived-view-repository.ts
// PURPOSE: Local durable persistence for DerivedView.
// ==========================================

import { DerivedView } from '../types/accounting-core-types';
import { IDerivedViewRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedDerivedViewRepository
  extends LocalStorageBaseRepository<DerivedView>
  implements IDerivedViewRepository {

  constructor() {
    super(EntityTypes.DERIVED_VIEW);
  }

  public listByClient(clientId: string): DerivedView[] {
    return this.listWhere(r => r.client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): DerivedView[] {
    return this.listWhere(r => r.client_id === clientId && r.accounting_period_id === periodId);
  }
}
