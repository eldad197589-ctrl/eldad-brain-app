// ==========================================
// FILE: run-update-next-action-process.ts
// PURPOSE: Update the current next_action_description on an existing WorkItem.
// ==========================================

import { IWorkItemRepository } from '../persistence/work-item-repository';
import { WorkItemRecord, WorkItemUpdateNextActionPayload } from '../types/work-spine-types';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';
import { AuditEventPayload } from '../../accounting-core/types/audit-trace-types';

export class RunUpdateNextActionProcess {
  constructor(
    private readonly repository: IWorkItemRepository,
    private readonly auditTraceService?: AuditTraceService
  ) {}

  public execute(payload: WorkItemUpdateNextActionPayload): WorkItemRecord {
    const item = this.repository.getById(payload.work_item_id);
    if (!item) {
      throw new Error(`Cannot update next action: WorkItem ${payload.work_item_id} not found.`);
    }

    const oldAction = item.next_action_description;
    
    // 1. Update domain fields strictly
    item.next_action_description = payload.next_action_description;
    item.updated_at = new Date().toISOString();

    // 2. Persist
    this.repository.update(item);

    // 3. Audit Trace
    if (this.auditTraceService) {
      this.auditTraceService.record({
        actor_id: payload.actor_id,
        service_name: 'WorkSpineUpdateNextAction',
        target_object_type: 'WorkItemRecord',
        target_object_id: item.id,
        prior_state_if_any: oldAction,
        new_state: item.next_action_description,
        reason: payload.reason_for_update,
        related_client_if_any: item.client_id
      });
    }

    return item;
  }
}
