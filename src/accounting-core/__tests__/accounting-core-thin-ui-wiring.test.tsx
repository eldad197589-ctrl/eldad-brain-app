// ==========================================
// FILE: accounting-core-thin-ui-wiring.test.tsx
// PURPOSE: Verify that the Intake Controller gracefully handles bounds without crashing,
//          and that the basic UI-level dependencies can be instantiated.
// DEPENDENCIES: vitest
// ==========================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Require mock localStorage to test persistence-tied items natively in Node
const _store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string): string | null => _store.get(key) ?? null,
  setItem: (key: string, value: string): void => { _store.set(key, value); },
  removeItem: (key: string): void => { _store.delete(key); },
  clear: (): void => { _store.clear(); },
  get length(): number { return _store.size; },
  key: (index: number): string | null => {
    const keys = Array.from(_store.keys());
    return keys[index] ?? null;
  }
};

import { AccountingCoreFileIntakeController } from '../ui/accounting-core-file-intake-controller';
import { AccountingCoreRuntime, createAccountingCoreRuntime } from '../index';
import { useAccountingCoreRuntime } from '../ui/use-accounting-core-runtime';

describe('Accounting Core — UI Wiring Integration', () => {

  let runtimeProxy: AccountingCoreRuntime;

  beforeEach(() => {
    localStorage.clear();
    runtimeProxy = createAccountingCoreRuntime();
  });

  afterEach(() => {
    localStorage.clear();
  });
  
  it('AccountingCoreFileIntakeController should successfully ingest and bind standard mock files', () => {
    const controller = new AccountingCoreFileIntakeController(runtimeProxy);
    
    // Simulate File objects mapping browser state
    const validFile = new File(['mock content'], 'test_invoice.jpg', { type: 'image/jpeg' });
    const blockedFile = new File(['virus'], 'payload.exe', { type: 'application/x-msdownload' });

    const result = controller.handleFiles(
      [validFile, blockedFile], 
      'ui-user-1', 
      'browser-machine-7'
    );

    // Should indicate partial ingestion / overall success block execution limits
    expect(result.is_success).toBe(true);
    expect(result.synced_count).toBe(1);
    expect(result.rejected_count).toBe(1);
    expect(result.batch_id).toBeDefined();
  });
});

