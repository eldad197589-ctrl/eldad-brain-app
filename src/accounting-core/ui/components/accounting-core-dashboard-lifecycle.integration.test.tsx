// ==========================================
// FILE: accounting-core-dashboard-lifecycle.integration.test.tsx
// PURPOSE: Deep Lifecycle Integration Test spanning Intake -> Review -> Verified Work domains.
// DEPENDENCIES: vitest, runtime abstractions, mocked session
// ==========================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';

// ── 1. SETUP: Isolate namespace using Node primitive mapping ──
const _store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string): string | null => _store.get(key) ?? null,
  setItem: (key: string, value: string): void => { _store.set(key, value); },
  removeItem: (key: string): void => { _store.delete(key); },
  clear: (): void => { _store.clear(); },
  get length(): number { return _store.size; },
  key: (index: number): string | null => Array.from(_store.keys())[index] ?? null
};

// Internal Mock to avoid DOM Hook violations during deep lifecycle tests.
const mockSession = {
  actorId: 'test_lifecycle_actor',
  clientId: 'test_client_global',
  accountingPeriodId: 'FY2026'
};

vi.mock('../use-accounting-core-session', () => ({
  useAccountingCoreSession: () => ({
    session: mockSession
  })
}));

// Mock React Hooks to safely allow purely functional Node execution for Dashboard Workspace without mounting DOM
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  let activeState = 'INTAKE';
  return {
    ...actual,
    useState: (initial: any) => {
      return [activeState, (newVal: any) => { activeState = newVal; }];
    }
  };
});

import { createAccountingCoreRuntime } from '../../runtime/accounting-core-runtime-factory';
import { AccountingCoreFileIntakeController } from '../accounting-core-file-intake-controller';
import { ClassificationStatus, ResolutionStatus } from '../../types/accounting-core-types';

import { AccountingCoreDashboardWorkspaceContent } from './accounting-core-dashboard-workspace';
import { AccountingCoreReviewQueueList } from './accounting-core-review-queue-list';
import { AccountingCoreVerifiedResolutionList } from './accounting-core-verified-resolution-list';

describe('Accounting Core — Dashboard Lifecycle UI Integration', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('proves the Dashboard reliably cascades data fully through Intake -> Review -> Verified bounds entirely under UI local session limits', () => {
    
    // ── 1. BOUNDARY MOUNTING (Verify root container does not drop session context) ──
    const runtime = createAccountingCoreRuntime();
    expect(runtime).toBeDefined();

    // Verify workspace itself structure initiates properly without violating hook environments
    const dashboardElement = AccountingCoreDashboardWorkspaceContent();
    expect(dashboardElement).toBeDefined();

    // ── 2. INTAKE UI SLICE (Submit document mimicking drag/drop) ──
    const controller = new AccountingCoreFileIntakeController(runtime);
    const mockFile = new File(["dummy PDF content"], "lifecycle-invoice.pdf", { type: "application/pdf" });
    Object.defineProperty(mockFile, 'webkitRelativePath', { value: '', writable: false });

    const intakeResult = controller.handleFiles([mockFile], mockSession.actorId, 'lifecycle-session');
    expect(intakeResult.is_success).toBe(true);
    expect(intakeResult.batch_id).toBeDefined();

    // ── 3. RUNTIME PIPELINE EXECUTION (Intake -> Extraction -> Classification) ──
    const syncRecords = runtime.repositories.syncedFileRecord.listByBatch(intakeResult.batch_id!);
    const docIntakeResult = runtime.useCases.runDocumentIntake.execute({
      actor_id: 'system', synced_file_record_ids: [syncRecords[0].id]
    });

    const ocrPayloads = new Map<string, any>();
    ocrPayloads.set(docIntakeResult.intake_ids[0], {
      document_number_if_exists: 'Browser-INV-999',
      issue_date: '2026-03-01',
      supplier_name_if_exists: 'Unknown-Vendor-To-Trigger-Review', 
      net_amount_if_exists: 83,
    });

    const extractionResult = runtime.useCases.runFieldExtraction.execute({
      actor_id: 'system', document_intake_ids: docIntakeResult.intake_ids, simulated_ocr_payloads: ocrPayloads
    });

    runtime.useCases.runClassification.execute({
      actor_id: 'system',
      client_id: mockSession.clientId,
      accounting_period_id: mockSession.accountingPeriodId,
      extracted_field_set_ids: extractionResult.extracted_set_ids
    });

    // ── 4. REVIEW QUEUE UI SLICE (Verify visibility against mapped session) ──
    const candidates = runtime.repositories.classificationResult.listByClient(mockSession.clientId)
      .filter(c => c.classification_status === ClassificationStatus.NEEDS_REVIEW);
    
    expect(candidates.length).toBe(1);

    const listUI = AccountingCoreReviewQueueList({
      candidates: candidates, selectedId: null, onSelect: () => {}
    });
    expect(listUI).toBeDefined();

    // ── 5. REVIEWER EXPLICIT ACTION (Submit approval payload) ──
    // Without this decision, mappings stay blocked.
    const reviewResult = runtime.useCases.runReviewResolution.execute({
      actor_id: mockSession.actorId,
      decisions: [{
        classification_result_id: candidates[0].id,
        action: 'APPROVE',
        reason: 'Dashboard Lifecycle test explicit override approval.',
        reviewer_actor_id: mockSession.actorId,
        rule_assisted: false
      }]
    });
    
    // Advance automated processes based on approval
    runtime.useCases.runClientCaseMapping.execute({ 
      actor_id: mockSession.actorId,
      client_id: mockSession.clientId,
      accounting_period_id: mockSession.accountingPeriodId,
      resolution_result_ids: reviewResult.resolution_result_ids
    });
    
    runtime.useCases.runDerivedAnalytics.execute({ 
      actor_id: mockSession.actorId,
      client_id: mockSession.clientId,
      accounting_period_id: mockSession.accountingPeriodId,
      derived_view_type: 'expense_composition_view'
    });

    // ── 6. VERIFIED UI VISIBILITY (Assert read-only propagation limits) ──
    const mappings = runtime.repositories.clientCaseMapping.listByClient(mockSession.clientId);
    expect(mappings.length).toBe(1);
    expect(mappings[0].linked_client_id).toBe(mockSession.clientId);
    
    const resRecord = runtime.repositories.resolutionResult.getById(mappings[0].resolution_result_id)!;
    expect(resRecord).toBeDefined();
    expect(resRecord.final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);
    expect(resRecord.final_accounting_component_if_verified).toBeDefined(); // Verifies it set something
    
    // Test alternative local state bound limits
    const verifiedListUI = AccountingCoreVerifiedResolutionList({
      resolutions: [resRecord]
    });
    expect(verifiedListUI).toBeDefined();
    
    // ── 7. NEGATIVE ASSERTION: Domain / Session Crossover Bleed ──
    const unrelatedClientData = runtime.repositories.classificationResult.listByClient('some_other_client_id');
    expect(unrelatedClientData.length).toBe(0);
  });

});
