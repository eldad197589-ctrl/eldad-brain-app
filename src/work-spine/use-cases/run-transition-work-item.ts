// ==========================================
// FILE: run-transition-work-item.ts
// PURPOSE: Transition a WorkItem to a new status securely enforcing the FSM path.
// ==========================================

import { IWorkItemRepository } from '../persistence/work-item-repository';
import { WorkItemTransitionPayload, WorkItemRecord, WorkItemStatus } from '../types/work-spine-types';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';

export class RunTransitionWorkItemProcess {
  constructor(
    private readonly repo: IWorkItemRepository,
    private readonly auditLog: AuditTraceService
  ) {}

  public execute(payload: WorkItemTransitionPayload): WorkItemRecord {
    const item = this.repo.getById(payload.work_item_id);
    
    if (!item) {
      throw new Error(`Cannot transition: WorkItem ${payload.work_item_id} not found.`);
    }

    if (!this.isValidTransition(item.status, payload.new_status)) {
      throw new Error(`Forbidden transition from ${item.status} to ${payload.new_status}`);
    }

    const priorState = item.status;
    item.status = payload.new_status;
    item.updated_at = new Date().toISOString();

    // Enforce immutable audit trace
    this.auditLog.record({
      actor_id: payload.actor_id,
      service_name: 'WorkSpineTransition',
      target_object_type: 'WorkItemRecord',
      target_object_id: item.id,
      prior_state_if_any: priorState,
      new_state: payload.new_status,
      reason: payload.reason_for_transition,
      related_client_if_any: item.client_id
    });

    this.repo.update(item);
    return item;
  }

  private isValidTransition(from: WorkItemStatus, to: WorkItemStatus): boolean {
    if (from === WorkItemStatus.NEW && to === WorkItemStatus.IN_REVIEW) return true;
    if (from === WorkItemStatus.IN_REVIEW && to === WorkItemStatus.WAITING_INTERNAL) return true;
    if (from === WorkItemStatus.IN_REVIEW && to === WorkItemStatus.WAITING_EXTERNAL) return true;
    if (from === WorkItemStatus.IN_REVIEW && to === WorkItemStatus.RESOLVED) return true;
    if (from === WorkItemStatus.WAITING_INTERNAL && to === WorkItemStatus.IN_REVIEW) return true;
    if (from === WorkItemStatus.WAITING_EXTERNAL && to === WorkItemStatus.IN_REVIEW) return true;
    if (from === WorkItemStatus.RESOLVED && to === WorkItemStatus.CLOSED) return true;
    return false;
  }
}
