// ==========================================
// FILE: accounting-core-runtime.integration.test.ts
// PURPOSE: Prove that the assembled runtime created by `createAccountingCoreRuntime()`
//          is the correct execution entry point for Eldad’s Brain accounting core.
// DEPENDENCIES: Runtime factory, types.
// ==========================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── localStorage Polyfill for Node test environment ──
// Node 22+ has a partial localStorage that lacks clear(). Force a full polyfill.
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

import { createAccountingCoreRuntime } from '../runtime/accounting-core-runtime-factory';
import { AccountingCoreRuntime } from '../runtime/accounting-core-runtime';

import {
  ClassificationStatus,
  ResolutionStatus,
  MappingStatus,
  DerivedViewStatus,
  AuditTraceStatus,
  RawOcrSimulatedInput
} from '../index';

describe('Accounting Core — Runtime Assembly Integration', () => {

  let runtime: AccountingCoreRuntime;

  beforeEach(() => {
    // 1. Isolate localStorage namespace before each test run
    localStorage.clear();

    // 2. Instantiate the runtime ONLY through createAccountingCoreRuntime()
    runtime = createAccountingCoreRuntime();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────
  // ASSERTIONS ON RUNTIME SHAPE
  // ─────────────────────────────────────────────────
  it('should expose the correct shape (repositories, services, useCases)', () => {
    // Repositories
    expect(runtime.repositories).toBeDefined();
    expect(runtime.repositories.folderSyncBatch).toBeDefined();
    expect(runtime.repositories.syncedFileRecord).toBeDefined();
    expect(runtime.repositories.documentIntake).toBeDefined();
    expect(runtime.repositories.extractedFieldSet).toBeDefined();
    expect(runtime.repositories.classificationResult).toBeDefined();
    expect(runtime.repositories.resolutionResult).toBeDefined();
    expect(runtime.repositories.clientCaseMapping).toBeDefined();
    expect(runtime.repositories.derivedView).toBeDefined();
    expect(runtime.repositories.auditTrace).toBeDefined();

    // Default repositories are file-based (verify instance type/name if possible, or assume based on factory)
    // We can check construction name, but TS removes it sometimes. The fact they work with localStorage proves it.

    // Services
    expect(runtime.services).toBeDefined();
    expect(runtime.services.auditTrace).toBeDefined();

    // UseCases
    expect(runtime.useCases).toBeDefined();
    expect(runtime.useCases.runFolderSync).toBeDefined();
    expect(runtime.useCases.runDocumentIntake).toBeDefined();
    expect(runtime.useCases.runFieldExtraction).toBeDefined();
    expect(runtime.useCases.runClassification).toBeDefined();
    expect(runtime.useCases.runReviewResolution).toBeDefined();
    expect(runtime.useCases.runClientCaseMapping).toBeDefined();
    expect(runtime.useCases.runDerivedAnalytics).toBeDefined();
    expect(runtime.useCases.recordAuditTrace).toBeDefined();
  });

  // ─────────────────────────────────────────────────
  // HAPPY-PATH RUNTIME FLOW & PERSISTENCE DURABILITY
  // ─────────────────────────────────────────────────
  it('should execute the full 8-step flow via runtime and persist across instances', () => {
    const ACTOR = 'runtime-integration-actor';
    const CLIENT_ID = 'runtime-client-david';
    const PERIOD_ID = '2026-Q1';

    // ── STEP 1: Folder Sync ──
    const syncResult = runtime.useCases.runFolderSync.execute({
      actor_id: ACTOR,
      source_machine_reference: 'RUNTIME-LAPTOP',
      root_path: 'C:/runtime-test',
      client_folder_path: 'C:/runtime-test/david',
      files: [{
        filename: 'pelephone-runtime-q1.pdf',
        absolutePath: 'C:/runtime-test/david/pelephone-runtime-q1.pdf',
        fileSizeBytes: 24500
      }],
      existing_global_hashes: new Set<string>()
    });

    expect(syncResult.is_success).toBe(true);
    const syncRecords = runtime.repositories.syncedFileRecord.listByBatch(syncResult.batch!.id);
    const syncedFileId = syncRecords[0].id;

    // ── STEP 2: Document Intake ──
    const intakeResult = runtime.useCases.runDocumentIntake.execute({
      actor_id: ACTOR,
      synced_file_record_ids: [syncedFileId]
    });

    expect(intakeResult.is_success).toBe(true);
    const intakeId = intakeResult.intake_ids[0];

    // ── STEP 3: Field Extraction ──
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      document_number_if_exists: 'PLF-RT-999',
      issue_date: '2026-02-01',
      supplier_name_if_exists: 'Pelephone',
      supplier_id_if_exists: '520044078',
      gross_amount_if_exists: 117.0,
      vat_amount_if_exists: 17.0,
      net_amount_if_exists: 100.0,
      currency: 'ILS',
      period_hint_if_exists: '2026-02'
    });

    const extractionResult = runtime.useCases.runFieldExtraction.execute({
      actor_id: ACTOR,
      document_intake_ids: [intakeId],
      simulated_ocr_payloads: ocrPayloads
    });

    expect(extractionResult.is_success).toBe(true);
    const extractedSetId = extractionResult.extracted_set_ids[0];

    // ── STEP 4: Classification ──
    const classificationResult = runtime.useCases.runClassification.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });

    expect(classificationResult.is_success).toBe(true);
    const classificationId = classificationResult.classification_result_ids[0];

    // ── STEP 5: Review Resolution ──
    const resolutionResult = runtime.useCases.runReviewResolution.execute({
      actor_id: ACTOR,
      decisions: [{
        classification_result_id: classificationId,
        action: 'APPROVE',
        reason: 'Pelephone invoice (Runtime test) verified.',
        reviewer_actor_id: ACTOR,
        rule_assisted: false
      }]
    });

    expect(resolutionResult.is_success).toBe(true);
    const resolutionId = resolutionResult.resolution_result_ids[0];

    // ── STEP 6: Client Case Mapping ──
    const mappingResult = runtime.useCases.runClientCaseMapping.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      resolution_result_ids: [resolutionId]
    });

    expect(mappingResult.is_success).toBe(true);
    const mappingId = mappingResult.mapping_ids[0];

    // ── STEP 7: Derived Analytics ──
    const analyticsResult = runtime.useCases.runDerivedAnalytics.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      derived_view_type: 'vat_oriented_analytical_view'
    });

    expect(analyticsResult.is_success).toBe(true);
    const derivedViewId = analyticsResult.derived_view_id!;

    // ── STEP 8: Record Audit Trace ──
    const auditResult = runtime.useCases.recordAuditTrace.execute({
      actor_id: ACTOR,
      trace_payload: {
        actor_id: ACTOR,
        service_name: 'RuntimeIntegrationTest',
        target_object_type: 'RuntimePipeline',
        target_object_id: 'RUNTIME_COMPLETE',
        new_state: 'PIPELINE_VERIFIED',
        reason: 'Runtime factory successfully wired and executed.'
      }
    });

    expect(auditResult.is_success).toBe(true);
    const traceId = auditResult.trace_id!;

    // ─────────────────────────────────────────────────
    // PERSISTENCE DURABILITY CHECK (New Runtime Instance)
    // ─────────────────────────────────────────────────
    // We create a completely new assembled runtime.
    // Because it's file-based (localStorage global string map in test), the new
    // instances of FileBased repositories should read the exact same data.
    const restoredRuntime = createAccountingCoreRuntime();

    const restoredBatch = restoredRuntime.repositories.folderSyncBatch.getById(syncResult.batch!.id);
    expect(restoredBatch).toBeDefined();

    const restoredSyncRecords = restoredRuntime.repositories.syncedFileRecord.listByBatch(syncResult.batch!.id);
    expect(restoredSyncRecords).toHaveLength(1);

    const restoredIntake = restoredRuntime.repositories.documentIntake.getById(intakeId);
    expect(restoredIntake).toBeDefined();

    const restoredExtraction = restoredRuntime.repositories.extractedFieldSet.getById(extractedSetId);
    expect(restoredExtraction).toBeDefined();

    const restoredClass = restoredRuntime.repositories.classificationResult.getById(classificationId);
    expect(restoredClass).toBeDefined();
    expect(restoredClass!.classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);

    const restoredRes = restoredRuntime.repositories.resolutionResult.getById(resolutionId);
    expect(restoredRes).toBeDefined();

    const restoredMapping = restoredRuntime.repositories.clientCaseMapping.getById(mappingId);
    expect(restoredMapping).toBeDefined();
    expect(restoredMapping!.mapping_status).toBe(MappingStatus.LINKED);

    const restoredView = restoredRuntime.repositories.derivedView.getById(derivedViewId);
    expect(restoredView).toBeDefined();
    expect(restoredView!.derived_view_status).toBe(DerivedViewStatus.GENERATED);

    const restoredTrace = restoredRuntime.repositories.auditTrace.getById(traceId);
    expect(restoredTrace).toBeDefined();
    expect(restoredTrace!.actor_id).toBe(ACTOR);
  });

  // ─────────────────────────────────────────────────
  // NEGATIVE ASSERTIONS
  // ─────────────────────────────────────────────────
  it('should block anonymous audit recording', () => {
    const result = runtime.useCases.recordAuditTrace.execute({
      actor_id: '', // Blank
      trace_payload: {
        actor_id: '',
        service_name: 'NegativeTest',
        target_object_type: 'Void',
        target_object_id: 'v1',
        new_state: 'BLOCKED',
        reason: 'Should fail'
      }
    });

    expect(result.is_success).toBe(false);
    expect(result.trace_status).toBe(AuditTraceStatus.BLOCKED);
  });

  it('should not allow mapping without VERIFIED_CLASSIFICATION', () => {
    // Generate an unverified resolution manually to test the use-case block
    const unverifiedId = 'res-unverified-1';
    runtime.repositories.resolutionResult.create({
      id: unverifiedId,
      classification_result_id: 'class-1',
      final_resolution_status: ResolutionStatus.ESCALATED, // NOT VERIFIED
      audit_trace_id: 'audit-1'
    });

    const mappingResult = runtime.useCases.runClientCaseMapping.execute({
      actor_id: 'test-actor',
      client_id: 'client-1',
      accounting_period_id: 'period-1',
      resolution_result_ids: [unverifiedId]
    });

    expect(mappingResult.is_success).toBe(true);
    expect(mappingResult.mappings_created).toBe(0);
    expect(mappingResult.resolutions_rejected).toBe(1);
  });
  
  it('should ensure derived analytics is read-only (does not alter mappings)', () => {
    const CLIENT_ID = 'calc-client';
    const PERIOD_ID = 'calc-period';

    // Seed dummy mapping
    runtime.repositories.clientCaseMapping.create({
      id: 'map-1',
      resolution_result_id: 'res-1',
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      mapping_status: MappingStatus.LINKED,
      derived_extracted_gross_amount: 100,
      derived_extracted_vat_amount: 17,
      derived_extracted_net_amount: 83,
      derived_extracted_document_date: '2026-01-01',
      derived_extracted_supplier_name: 'Test',
      assigned_accounting_component: 'COMPONENT_MARKETING_EXPENSES',
      audit_trace_id: 'audit-1'
    });

    const analyticsResult = runtime.useCases.runDerivedAnalytics.execute({
      actor_id: 'test-actor',
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      derived_view_type: 'vat_oriented_analytical_view'
    });

    expect(analyticsResult.is_success).toBe(true);
    
    // Original mapping is untouched
    const restoredMap = runtime.repositories.clientCaseMapping.getById('map-1');
    expect(restoredMap!.mapping_status).toBe(MappingStatus.LINKED); // unaltered
  });

});
