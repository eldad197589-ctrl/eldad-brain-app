// ==========================================
// FILE: in-memory-classification-result-repository.ts
// PURPOSE: In-memory persistence adapter for ClassificationResult.
// ==========================================

import { ClassificationResult } from '../types/accounting-core-types';
import { IClassificationResultRepository } from './repository-interfaces';

export class InMemoryClassificationResultRepository implements IClassificationResultRepository {
  private store = new Map<string, ClassificationResult>();

  public create(entity: ClassificationResult): void {
    if (this.store.has(entity.id)) {
      throw new Error(`ClassificationResult with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): ClassificationResult | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }

  public listByClient(clientId: string): ClassificationResult[] {
    return Array.from(this.store.values()).filter(r => r.client_id === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ClassificationResult[] {
    return Array.from(this.store.values()).filter(r => r.client_id === clientId && r.accounting_period_id === periodId);
  }
}
