// ==========================================
// FILE: file-based-client-case-mapping-repository.ts
// PURPOSE: Local durable persistence for ClientCaseMapping.
// ==========================================

import { ClientCaseMapping } from '../types/accounting-core-types';
import { IClientCaseMappingRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedClientCaseMappingRepository
  extends LocalStorageBaseRepository<ClientCaseMapping>
  implements IClientCaseMappingRepository {

  constructor() {
    super(EntityTypes.CLIENT_CASE_MAPPING);
  }

  public listByClient(clientId: string): ClientCaseMapping[] {
    return this.listWhere(r => r.linked_client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ClientCaseMapping[] {
    return this.listWhere(r => r.linked_client_id === clientId && r.linked_accounting_period_id === periodId);
  }
}
