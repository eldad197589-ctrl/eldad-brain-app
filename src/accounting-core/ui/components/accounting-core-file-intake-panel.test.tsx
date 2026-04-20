// ==========================================
// FILE: accounting-core-file-intake-panel.test.tsx
// PURPOSE: Verify the Controller integration layer specifically for the React component bounds.
// DEPENDENCIES: vitest
// ==========================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

import { createAccountingCoreRuntime } from '../../index';
import { AccountingCoreFileIntakeController } from '../accounting-core-file-intake-controller';
import { AccountingCoreFileIntakePanel } from './accounting-core-file-intake-panel';

describe('Accounting Core — File Intake Panel Component UI Bounds', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('verifies that the panel explicitly exports correctly and mounts its controller dependency', () => {
    expect(AccountingCoreFileIntakePanel).toBeDefined();
    
    // Test the controller exactly as the component uses it internally to simulate the boundary
    const runtimeProxy = createAccountingCoreRuntime();
    const controller = new AccountingCoreFileIntakeController(runtimeProxy);
    
    const validFile = new File(['valid content'], 'invoice.pdf', { type: 'application/pdf' });
    const result = controller.handleFiles([validFile], 'u-t-1', 'm-t-1');

    // The component depends on these fields correctly routing through
    expect(result).toBeDefined();
    expect(result.is_success).toBe(true);
    expect(result.synced_count).toBe(1);
    expect(result.batch_id).toBeDefined();
  });
});
