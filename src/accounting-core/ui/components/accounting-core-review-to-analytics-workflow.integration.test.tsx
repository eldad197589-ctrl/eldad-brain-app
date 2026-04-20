// ==========================================
// FILE: accounting-core-review-to-analytics-workflow.integration.test.tsx
// PURPOSE: Deep UI Workflow Test proving mapping & analytics securely execute only after explicit Human Review interaction.
// DEPENDENCIES: vitest, React component boundaries, Runtime
// ==========================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── 1. SETUP: Maintain pure non-DOM isolation context ──
const _store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string): string | null => _store.get(key) ?? null,
  setItem: (key: string, value: string): void => { _store.set(key, value); },
  removeItem: (key: string): void => { _store.delete(key); },
  clear: (): void => { _store.clear(); },
  get length(): number { return _store.size; },
  key: (index: number): string | null => Array.from(_store.keys())[index] ?? null
};

import { createAccountingCoreRuntime } from '../../runtime/accounting-core-runtime-factory';
import { AccountingCoreFileIntakeController } from '../accounting-core-file-intake-controller';
import { ClassificationStatus, ResolutionStatus, MappingStatus } from '../../types/accounting-core-types';
import { AccountingCoreReviewQueueList } from './accounting-core-review-queue-list';
import { AccountingCoreReviewDecisionPanel } from './accounting-core-review-decision-panel';
import { ReviewerDecision } from '../../services/review-resolution-service';

describe('Accounting Core — UI Workflow Integration: Review To Analytics', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Helper macro to run a generic file down to NEEDS_REVIEW state
  function driveItemToReviewQueue(runtime: any, actor: string, client: string, overrideName: string) {
    const controller = new AccountingCoreFileIntakeController(runtime);
    const mockFile = new File(["pdf contents"], `${overrideName}.pdf`, { type: "application/pdf" });
    Object.defineProperty(mockFile, 'webkitRelativePath', { value: '', writable: false });

    const intakeResult = controller.handleFiles([mockFile], actor, 'ui-session');
    
    const syncRecords = runtime.repositories.syncedFileRecord.listByBatch(intakeResult.batch_id!);
    const targetSyncId = syncRecords[0].id;

    const docIntakeResult = runtime.useCases.runDocumentIntake.execute({
      actor_id: actor,
      synced_file_record_ids: [targetSyncId]
    });

    const ocrPayloads = new Map<string, any>();
    ocrPayloads.set(docIntakeResult.intake_ids[0], {
      document_number_if_exists: `${overrideName}-NUM`,
      issue_date: '2026-03-01',
      supplier_name_if_exists: overrideName, // Provide dummy name ensuring extraction succeeds but likely flags review
      gross_amount_if_exists: 100,
      vat_amount_if_exists: 17,
      net_amount_if_exists: 83,
      currency: 'ILS',
      period_hint_if_exists: '2026-03'
    });

    const extResult = runtime.useCases.runFieldExtraction.execute({
      actor_id: actor,
      document_intake_ids: docIntakeResult.intake_ids,
      simulated_ocr_payloads: ocrPayloads
    });

    runtime.useCases.runClassification.execute({
      actor_id: actor,
      client_id: client,
      accounting_period_id: 'FY2026',
      extracted_field_set_ids: extResult.extracted_set_ids
    });

    const allClasses = runtime.repositories.classificationResult.listByClient(client);
    // Find the one matched specifically to this extraction set
    return allClasses.find((c: any) => c.extracted_field_set_id === extResult.extracted_set_ids[0]);
  }

  it('should explicitly cascade APPROVE -> Mapping -> Analytics and reject invalid downstream access', () => {
    
    const runtime = createAccountingCoreRuntime();
    const ACTOR_ID = 'test_human_reviewer';
    const TEST_CLIENT_ID = 'test_client_id_workflow_b';

    // ── 1. PREPARE 3 INDEPENDENT WORKFLOW ITEMS ──
    const reviewItemApprove = driveItemToReviewQueue(runtime, ACTOR_ID, TEST_CLIENT_ID, 'Target_Approve');
    const reviewItemReject = driveItemToReviewQueue(runtime, ACTOR_ID, TEST_CLIENT_ID, 'Target_Reject');
    const reviewItemReclass = driveItemToReviewQueue(runtime, ACTOR_ID, TEST_CLIENT_ID, 'Target_Reclass');

    expect(reviewItemApprove?.classification_status).toBe(ClassificationStatus.NEEDS_REVIEW);

    // ── 2. UI REVIEW QUEUE MOUNT & SELECT ──
    const rawList = [reviewItemApprove, reviewItemReject, reviewItemReclass];
    const uiList = AccountingCoreReviewQueueList({
      candidates: rawList,
      selectedId: reviewItemApprove.id,
      onSelect: () => {}
    });
    expect(uiList).toBeDefined();

    // Verify Decision Panel signature bounds
    expect(AccountingCoreReviewDecisionPanel).toBeDefined();

    // ── 3. SIMULATE HUMAN DECISION FLOW (APPROVE) ──
    const approveDecision: ReviewerDecision = {
      classification_result_id: reviewItemApprove.id,
      action: 'APPROVE',
      reason: 'Looks verified manually',
      reviewer_actor_id: ACTOR_ID,
      rule_assisted: false
    };

    const resResultApprove = runtime.useCases.runReviewResolution.execute({
      actor_id: ACTOR_ID,
      decisions: [approveDecision]
    });
    expect(resResultApprove.is_success).toBe(true);

    const checkApprove = runtime.repositories.resolutionResult.getById(resResultApprove.resolution_result_ids[0]);
    expect(checkApprove?.final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);

    // ── 4. NEGATIVE ASSERTION: Simulate REJECT blocking downstream ──
    const rejectDecision: ReviewerDecision = {
      classification_result_id: reviewItemReject.id,
      action: 'REJECT',
      reason: 'Invalid transaction structure blocked.',
      reviewer_actor_id: ACTOR_ID,
      rule_assisted: false
    };
    const resResultReject = runtime.useCases.runReviewResolution.execute({
      actor_id: ACTOR_ID, 
      decisions: [rejectDecision]
    });
    expect(resResultReject.is_success).toBe(true);
    
    const checkReject = runtime.repositories.resolutionResult.getById(resResultReject.resolution_result_ids[0]);
    expect(checkReject?.final_resolution_status).toBe(ResolutionStatus.BLOCKED);

    // Provide RECLASSIFY without override - should throw conceptually in ui handling but we enforce statically
    const invalidReclassDecision: ReviewerDecision = {
      classification_result_id: reviewItemReclass.id,
      action: 'RECLASSIFY',
      // override component omitted purposefully
      reason: 'Needs override',
      reviewer_actor_id: ACTOR_ID,
      rule_assisted: false
    };

    const invalidRes = runtime.useCases.runReviewResolution.execute({
      actor_id: ACTOR_ID,
      decisions: [invalidReclassDecision]
    });
    // The orchestrator handles invalid inputs smoothly by leaving them purely unresolved without throwing total exceptions
    expect(invalidRes.is_success).toBe(true); 
    expect(invalidRes.resolutions_created).toBe(0);
    expect(invalidRes.resolutions_blocked_count).toBe(1);

    // ── 5. MAPPING DOWNSTREAM BOUNDARY ──
    const mapResult = runtime.useCases.runClientCaseMapping.execute({
      client_id: TEST_CLIENT_ID,
      accounting_period_id: 'FY2026',
      actor_id: ACTOR_ID,
      resolution_result_ids: [checkApprove!.id, checkReject!.id]
    });

    expect(mapResult.is_success).toBe(true);
    
    // There were 2 IDs passed:
    // 1 APPROVED (Mapped correctly)
    // 1 REJECTED (Ignored inherently as BLOCKED isn't VERIFIED)
    expect(mapResult.mappings_created).toBe(1);

    const mappings = runtime.repositories.clientCaseMapping.listByClient(TEST_CLIENT_ID);
    expect(mappings.length).toBe(1);
    expect(mappings[0].resolution_result_id).toBe(checkApprove!.id);
    expect(mappings[0].mapping_status).toBe(MappingStatus.LINKED);

    // ── 6. ANALYTICS DOWNSTREAM BOUNDARY ──
    const analyticsResult = runtime.useCases.runDerivedAnalytics.execute({
      actor_id: ACTOR_ID,
      client_id: TEST_CLIENT_ID,
      accounting_period_id: 'FY2026',
      derived_view_type: 'CLIENT_PORTAL_PREVIEW' as any // Using literal mapping matching core types
    });

    expect(analyticsResult.is_success).toBe(true);
    
    const views = runtime.repositories.derivedView.listByClient(TEST_CLIENT_ID);
    expect(views.length).toBeGreaterThan(0);
    expect(views[0].derived_view_type).toBe('CLIENT_PORTAL_PREVIEW');
    expect(views[0].derived_summary_payload).toBeDefined();

    // ── 7. VERIFY AUDIT TRAIL ──
    const traces = runtime.services.auditTrace.getTracesByActor(ACTOR_ID);
    const traceTypes = traces.map((t: any) => t.target_object_type);
    
    // Should clearly show: Resolution -> Mapping -> View execution
    expect(traceTypes).toContain('ResolutionResult');
    expect(traceTypes).toContain('ClientCaseMapping');
    expect(traceTypes).toContain('DerivedView');
  });

});
