// ==========================================
// FILE: file-based-audit-trace-repository.ts
// PURPOSE: Local durable persistence for ImmutableAuditTraceRecord.
// Strictly append-only. No update. No delete.
// ==========================================

import { ImmutableAuditTraceRecord } from '../types/accounting-core-types';
import { IAuditTraceRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedAuditTraceRepository
  extends LocalStorageBaseRepository<ImmutableAuditTraceRecord>
  implements IAuditTraceRepository {

  constructor() {
    super(EntityTypes.AUDIT_TRACE);
  }

  public listByClient(clientId: string): ImmutableAuditTraceRecord[] {
    return this.listWhere(r => r.related_client_if_any === clientId);
  }

  public listByPeriod(clientId: string, periodId: string): ImmutableAuditTraceRecord[] {
    return this.listWhere(r =>
      r.related_client_if_any === clientId &&
      r.related_accounting_period_if_any === periodId
    );
  }

  public listByBatch(batchId: string): ImmutableAuditTraceRecord[] {
    return this.listWhere(r => r.related_batch_or_run_id_if_any === batchId);
  }
}
