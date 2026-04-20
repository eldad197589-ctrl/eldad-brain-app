// ==========================================
// FILE: in-memory-derived-view-repository.ts
// PURPOSE: In-memory persistence adapter for DerivedView.
// ==========================================

import { DerivedView } from '../types/accounting-core-types';
import { IDerivedViewRepository } from './repository-interfaces';

export class InMemoryDerivedViewRepository implements IDerivedViewRepository {
  private store = new Map<string, DerivedView>();

  public create(entity: DerivedView): void {
    if (this.store.has(entity.id)) {
      throw new Error(`DerivedView with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): DerivedView | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }

  public listByClient(clientId: string): DerivedView[] {
    return Array.from(this.store.values()).filter(r => r.client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): DerivedView[] {
    return Array.from(this.store.values()).filter(r => r.client_id === clientId && r.accounting_period_id === periodId);
  }
}
