// ==========================================
// FILE: in-memory-client-case-mapping-repository.ts
// PURPOSE: In-memory persistence adapter for ClientCaseMapping.
// ==========================================

import { ClientCaseMapping } from '../types/accounting-core-types';
import { IClientCaseMappingRepository } from './repository-interfaces';

export class InMemoryClientCaseMappingRepository implements IClientCaseMappingRepository {
  private store = new Map<string, ClientCaseMapping>();

  public create(entity: ClientCaseMapping): void {
    if (this.store.has(entity.id)) {
      throw new Error(`ClientCaseMapping with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): ClientCaseMapping | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }

  public listByClient(clientId: string): ClientCaseMapping[] {
    return Array.from(this.store.values()).filter(r => r.linked_client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ClientCaseMapping[] {
    return Array.from(this.store.values()).filter(r => r.linked_client_id === clientId && r.linked_accounting_period_id === periodId);
  }
}
