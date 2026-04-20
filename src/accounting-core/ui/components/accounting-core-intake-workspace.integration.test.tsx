// ==========================================
// FILE: accounting-core-intake-workspace.integration.test.tsx
// PURPOSE: Verify the data flow of the execution observability components cleanly traverses boundaries.
// DEPENDENCIES: vitest
// ==========================================

import { describe, it, expect } from 'vitest';

// Setup Mock Persistence
const _store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => _store.get(key) ?? null,
  setItem: (key: string, value: string) => _store.set(key, value),
  removeItem: (key: string) => _store.delete(key),
  clear: () => _store.clear(),
  get length() { return _store.size; },
  key: (index: number) => Array.from(_store.keys())[index] ?? null
};

// Import boundary elements natively
import AccountingCoreIntakeWorkspace from './accounting-core-intake-workspace';
import { AccountingCoreRunSummary } from './accounting-core-run-summary';
import { AccountingCoreAuditTraceList } from './accounting-core-audit-trace-list';
import { createAccountingCoreRuntime } from '../../index';

describe('Accounting Core — Execution Visibility UI Integration', () => {

  it('validates all observability components mount and map structured limits without error', () => {
    // 1. Verify Top-Level Component structure bounds
    expect(AccountingCoreIntakeWorkspace).toBeDefined();

    // 2. Verify Run Summary renders bound data safely
    const mockResult = {
      is_success: true,
      synced_count: 5,
      rejected_count: 0,
      batch_id: 'batch_test_123'
    };
    const summaryUI = AccountingCoreRunSummary({ result: mockResult });
    expect(summaryUI).toBeDefined();
    expect(summaryUI.props['data-testid']).toBe('run-summary-panel');

    // 3. Verify Audit Trace List renders bound data safely without empty crash
    const emptyTraceList = AccountingCoreAuditTraceList({ traces: [] });
    expect(emptyTraceList).toBeDefined();

    // 4. Trace extraction logic verify boundary
    const runtime = createAccountingCoreRuntime();
    runtime.services.auditTrace.record({
      actor_id: 'user_eldad_admin',
      target_object_id: 'SystemTestBoundary',
      target_object_type: 'UI_TEST_SERVICE',
      old_state: 'NONE',
      new_state: 'CREATED',
      reason: 'Tested data flow layout structure bounds',
      source_machine_id: 'local_machine'
    });
    
    const fetchedTraces = runtime.services.auditTrace.getTracesByActor('user_eldad_admin');
    expect(fetchedTraces.length).toBeGreaterThan(0);

    const populatedTraceListUI = AccountingCoreAuditTraceList({ traces: fetchedTraces });
    expect(populatedTraceListUI.props['data-testid']).toBe('audit-trace-list');
  });

});
