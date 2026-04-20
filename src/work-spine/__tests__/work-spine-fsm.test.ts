// ==========================================
// FILE: work-spine-fsm.test.ts
// PURPOSE: Verify the foundational Work Spine use cases and File-Based Repo.
// ==========================================

import { describe, it, expect, beforeEach } from 'vitest';
import { FileBasedWorkItemRepository } from '../persistence/file-based-work-item-repository';
import { RunCreateWorkItemProcess } from '../use-cases/run-create-work-item';
import { RunTransitionWorkItemProcess } from '../use-cases/run-transition-work-item';
import { WorkItemStatus } from '../types/work-spine-types';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';
import { InMemoryAuditTraceRepository } from '../../accounting-core/repositories/in-memory-audit-trace-repository';

// Note: In Node 22 we overwrite the native minimal localStorage to support clear()
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => mockStorage.get(k) ?? null,
  setItem: (k: string, v: string) => mockStorage.set(k, v),
  clear: () => mockStorage.clear()
};

describe('Today Work Spine FSM', () => {
  let repo: FileBasedWorkItemRepository;
  let createProcess: RunCreateWorkItemProcess;
  let transitionProcess: RunTransitionWorkItemProcess;
  let auditService: AuditTraceService;

  beforeEach(() => {
    localStorage.clear();
    repo = new FileBasedWorkItemRepository();
    
    // Inject mock audit trace repo into the real AuditTraceService
    auditService = new AuditTraceService();
    (auditService as any).auditTraceRepository = new InMemoryAuditTraceRepository();
    
    createProcess = new RunCreateWorkItemProcess(repo);
    transitionProcess = new RunTransitionWorkItemProcess(repo, auditService);
  });

  it('1. create persists item correctly in NEW status', () => {
    const item = createProcess.execute({
      id: 'wi-100',
      domain_type: 'ACCOUNTING_CORE',
      title: 'Analyze Invoice',
      next_action_description: 'Extract numbers'
    });
    
    expect(item.status).toBe(WorkItemStatus.NEW);
    
    const fetched = repo.getById('wi-100');
    expect(fetched).toBeDefined();
    expect(fetched!.title).toBe('Analyze Invoice');
    expect(fetched!.status).toBe(WorkItemStatus.NEW);
  });

  it('2. allowed transition succeeds and traces to audit log', () => {
    createProcess.execute({ id: 'wi-2', domain_type: 'GENERAL', title: 'T', next_action_description: 'A' });
    
    const transitioned = transitionProcess.execute({
      work_item_id: 'wi-2',
      new_status: WorkItemStatus.IN_REVIEW,
      reason_for_transition: 'Eldad picked it up',
      actor_id: 'eldad'
    });

    expect(transitioned.status).toBe(WorkItemStatus.IN_REVIEW);
    
    // Verify Audit Trace recorded the transition explicitly
    expect(auditService.getTraceCount()).toBe(1);
    const traces = auditService.getTracesForObject('wi-2');
    const trace = traces[0];
    expect(trace.target_object_id).toBe('wi-2');
    expect(trace.prior_state_if_any).toBe(WorkItemStatus.NEW);
    expect(trace.new_state).toBe(WorkItemStatus.IN_REVIEW);
  });

  it('3. forbidden transition fails completely and does not trace', () => {
    createProcess.execute({ id: 'wi-3', domain_type: 'ONBOARDING', title: 'Onboard Shimon', next_action_description: 'Sign PoA' });
    
    expect(() => {
      transitionProcess.execute({
        work_item_id: 'wi-3',
        new_status: WorkItemStatus.CLOSED, // NEW -> CLOSED is explicitly forbidden
        reason_for_transition: 'Skip everything',
        actor_id: 'system'
      });
    }).toThrow(/Forbidden transition from NEW to CLOSED/);

    const fetched = repo.getById('wi-3');
    expect(fetched!.status).toBe(WorkItemStatus.NEW); // State isolated, unharmed
    expect(auditService.getTraceCount()).toBe(0);
  });

  it('4. closed item cannot transition', () => {
    // Flow: NEW -> IN_REVIEW -> RESOLVED -> CLOSED
    createProcess.execute({ id: 'wi-4', domain_type: 'GENERAL', title: 'T', next_action_description: 'A' });
    transitionProcess.execute({ work_item_id: 'wi-4', new_status: WorkItemStatus.IN_REVIEW, reason_for_transition: 'r1', actor_id: 'a' });
    transitionProcess.execute({ work_item_id: 'wi-4', new_status: WorkItemStatus.RESOLVED, reason_for_transition: 'r2', actor_id: 'a' });
    transitionProcess.execute({ work_item_id: 'wi-4', new_status: WorkItemStatus.CLOSED, reason_for_transition: 'r3', actor_id: 'a' });

    expect(() => {
      transitionProcess.execute({ work_item_id: 'wi-4', new_status: WorkItemStatus.IN_REVIEW, reason_for_transition: 'reopen', actor_id: 'a' });
    }).toThrow(/Forbidden transition from CLOSED to IN_REVIEW/);
  });

  it('5. resolved can close', () => {
    createProcess.execute({ id: 'wi-5', domain_type: 'GENERAL', title: 'T', next_action_description: 'A' });
    transitionProcess.execute({ work_item_id: 'wi-5', new_status: WorkItemStatus.IN_REVIEW, reason_for_transition: 'r', actor_id: 'a' });
    transitionProcess.execute({ work_item_id: 'wi-5', new_status: WorkItemStatus.RESOLVED, reason_for_transition: 'r', actor_id: 'a' });
    const closed = transitionProcess.execute({ work_item_id: 'wi-5', new_status: WorkItemStatus.CLOSED, reason_for_transition: 'r', actor_id: 'a' });

    expect(closed.status).toBe(WorkItemStatus.CLOSED);
  });
});
