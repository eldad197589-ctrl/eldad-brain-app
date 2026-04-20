// ==========================================
// FILE: in-memory-audit-trace-repository.ts
// PURPOSE: In-memory persistence adapter for ImmutableAuditTraceRecord.
// Enforces strict append-only rules.
// ==========================================

import { ImmutableAuditTraceRecord } from '../types/accounting-core-types';
import { IAuditTraceRepository } from './repository-interfaces';

export class InMemoryAuditTraceRepository implements IAuditTraceRepository {
  private store = new Map<string, ImmutableAuditTraceRecord>();

  public create(entity: ImmutableAuditTraceRecord): void {
    if (this.store.has(entity.id)) {
      throw new Error(`AuditTraceRecord with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): ImmutableAuditTraceRecord | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }

  public listByClient(clientId: string): ImmutableAuditTraceRecord[] {
    return Array.from(this.store.values()).filter(r => r.related_client_if_any === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ImmutableAuditTraceRecord[] {
    return Array.from(this.store.values()).filter(r => 
      r.related_client_if_any === clientId && 
      r.related_accounting_period_if_any === periodId
    );
  }

  public listByBatch(batchId: string): ImmutableAuditTraceRecord[] {
    return Array.from(this.store.values()).filter(r => r.related_batch_or_run_id_if_any === batchId);
  }
}
