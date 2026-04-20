// ==========================================
// FILE: run-update-next-action-process.integration.test.ts
// PURPOSE: Integration tests for updating next action on a work item.
// ==========================================

import { describe, expect, it } from 'vitest';
import { IWorkItemRepository } from '../persistence/work-item-repository';
import { WorkItemRecord, WorkItemStatus } from '../types/work-spine-types';
import { RunUpdateNextActionProcess } from './run-update-next-action-process';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';
import { AuditEventPayload } from '../../accounting-core/types/audit-trace-types';

class MockWorkItemRepository implements IWorkItemRepository {
  private items = new Map<string, WorkItemRecord>();

  create(item: WorkItemRecord): void { this.items.set(item.id, item); }
  getById(id: string): WorkItemRecord | undefined { return this.items.get(id); }
  listAll(): WorkItemRecord[] { return Array.from(this.items.values()); }
  update(item: WorkItemRecord): void {
    if (!this.items.has(item.id)) throw new Error('Not found');
    this.items.set(item.id, item);
  }
}

class MockAuditTraceService extends AuditTraceService {
  public traces: any[] = [];
  override record(payload: any): void {
    this.traces.push(payload);
  }
}

describe('RunUpdateNextActionProcess', () => {
  it('should successfully update next_action_description of an existing work item', () => {
    const repo = new MockWorkItemRepository();
    const audit = new MockAuditTraceService();
    const useCase = new RunUpdateNextActionProcess(repo, audit);

    // Setup initial
    const originalTime = '2026-04-19T10:00:00.000Z';
    const item: WorkItemRecord = {
      id: 'wi-1',
      domain_type: 'WAR_COMPENSATION',
      title: 'דימה',
      next_action_description: 'old action',
      status: WorkItemStatus.IN_REVIEW,
      created_at: originalTime,
      updated_at: originalTime
    };
    repo.create(item);

    // Execute
    const updated = useCase.execute({
      work_item_id: 'wi-1',
      next_action_description: 'new action now',
      reason_for_update: 'customer sent document',
      actor_id: 'eldad_ui'
    });

    expect(updated.next_action_description).toBe('new action now');
    expect(updated.updated_at).not.toBe(originalTime); // Date was bumped
    expect(updated.status).toBe(WorkItemStatus.IN_REVIEW); // Unchanged
    expect(updated.title).toBe('דימה'); // Unchanged
  });

  it('should fail explicitly if the item does not exist', () => {
    const repo = new MockWorkItemRepository();
    const useCase = new RunUpdateNextActionProcess(repo);

    expect(() => {
      useCase.execute({
        work_item_id: 'missing-id',
        next_action_description: 'something',
        reason_for_update: 'reason',
        actor_id: 'tester'
      });
    }).toThrow('Cannot update next action: WorkItem missing-id not found.');
  });

  it('should write an Audit Trace upon success', () => {
    const repo = new MockWorkItemRepository();
    const audit = new MockAuditTraceService();
    const useCase = new RunUpdateNextActionProcess(repo, audit);

    repo.create({
      id: 'wi-2',
      domain_type: 'ACCOUNTING_CORE',
      title: 'Test',
      next_action_description: 'alpha',
      status: WorkItemStatus.NEW,
      created_at: '',
      updated_at: ''
    });

    useCase.execute({
      work_item_id: 'wi-2',
      next_action_description: 'bravo',
      reason_for_update: 'because test',
      actor_id: 'test_actor'
    });

    expect(audit.traces.length).toBe(1);
    expect(audit.traces[0].service_name).toBe('WorkSpineUpdateNextAction');
    expect(audit.traces[0].actor_id).toBe('test_actor');
    expect(audit.traces[0].prior_state_if_any).toBe('alpha');
    expect(audit.traces[0].new_state).toBe('bravo');
    expect(audit.traces[0].reason).toBe('because test');
  });
});
