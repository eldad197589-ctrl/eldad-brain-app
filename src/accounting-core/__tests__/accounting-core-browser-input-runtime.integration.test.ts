// ==========================================
// FILE: accounting-core-browser-input-runtime.integration.test.ts
// PURPOSE: Prove that browser-selected client files can be converted by the
//          browser input adapter into valid sync inputs and run through the runtime.
// DEPENDENCIES: BrowserFileInputAdapter, Runtime factory, types
// ==========================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── localStorage Polyfill for Node test environment ──
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

// Types & Adapter
import { convertBrowserFilesToSyncInputs } from '../adapters/browser-file-input-adapter';
import { createAccountingCoreRuntime } from '../runtime/accounting-core-runtime-factory';
import { AccountingCoreRuntime } from '../runtime/accounting-core-runtime';
import { RawOcrSimulatedInput, ClassificationStatus } from '../index';

describe('Accounting Core — Browser Input to Runtime Boundary Integration', () => {

  let runtime: AccountingCoreRuntime;

  beforeEach(() => {
    // 1. Isolate localStorage and instantiate ONLY through factory
    localStorage.clear();
    runtime = createAccountingCoreRuntime();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────
  // HAPPY PATH: Browser input conversion & pipeline
  // ─────────────────────────────────────────────────
  it('should accept valid browser files, adapt them to sync inputs, and process them through the pipeline', () => {
    const ACTOR = 'client-browser-user';
    const CLIENT_ID = 'client-brown-123';
    const PERIOD_ID = '2026-Q1';

    // ── MOCKED BROWSER INPUT ──
    const fileWithRelativePath = new File(["dummy pdf content"], "invoice-a.pdf", { type: "application/pdf" });
    // Mock webkitRelativePath which web standard File objects have on directory select
    Object.defineProperty(fileWithRelativePath, 'webkitRelativePath', {
      value: '2026_receipts/invoice-a.pdf',
      writable: false
    });

    const fileWithoutRelativePath = new File(["dummy png content"], "receipt-b.png", { type: "image/png" });
    
    // We also simulate an unsupported file to test boundaries.
    const unsupportedFile = new File(["dummy exe content"], "virus.exe", { type: "application/x-msdownload" });

    const rawBrowserFiles = [fileWithRelativePath, fileWithoutRelativePath, unsupportedFile];

    // ── ADAPTER EXECUTION ──
    const conversionResult = convertBrowserFilesToSyncInputs(rawBrowserFiles);

    // Assert: unsupported extension is blocked explicitly
    expect(conversionResult.rejectedFiles).toHaveLength(1);
    expect(conversionResult.rejectedFiles[0].originalFilename).toBe('virus.exe');
    expect(conversionResult.rejectedFiles[0].reason).toContain('not permitted');

    // Assert: adapter converts File objects into valid SyncFileInputs
    expect(conversionResult.validSyncInputs).toHaveLength(2);
    
    // File with relative path preserves it
    expect(conversionResult.validSyncInputs[0].filename).toBe('invoice-a.pdf');
    expect(conversionResult.validSyncInputs[0].absolutePath).toBe('browser-upload://2026_receipts/invoice-a.pdf');
    
    // File without relative path uses filename fallback
    expect(conversionResult.validSyncInputs[1].filename).toBe('receipt-b.png');
    expect(conversionResult.validSyncInputs[1].absolutePath).toBe('browser-upload://receipt-b.png');
    expect(conversionResult.validSyncInputs[1].fileSizeBytes).toBeGreaterThan(0);

    // ── RUNTIME PIPELINE EXECUTION ──

    // 1. RunFolderSyncProcess
    const syncResult = runtime.useCases.runFolderSync.execute({
      actor_id: ACTOR,
      source_machine_reference: 'BROWSER-SESSION-123',
      root_path: 'browser-upload://',
      client_folder_path: 'browser-upload://',
      files: conversionResult.validSyncInputs,
      existing_global_hashes: new Set<string>()
    });

    // Assert: accepted by sync service
    expect(syncResult.is_success).toBe(true);
    expect(syncResult.records_synced).toBe(2);

    const syncRecords = runtime.repositories.syncedFileRecord.listByBatch(syncResult.batch!.id);
    expect(syncRecords).toHaveLength(2);

    // 2. RunDocumentIntakeProcess
    const intakeResult = runtime.useCases.runDocumentIntake.execute({
      actor_id: ACTOR,
      synced_file_record_ids: syncRecords.map(r => r.id)
    });

    expect(intakeResult.is_success).toBe(true);
    expect(intakeResult.intakes_created).toBe(2);

    // Retrieve intake for 'invoice-a.pdf'
    const intakes = intakeResult.intake_ids.map(id => runtime.repositories.documentIntake.getById(id)!);

    // 3. RunFieldExtractionProcess (Mocked OCR on one of them)
    const activeIntakeId = intakes[0].id;
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(activeIntakeId, {
      document_number_if_exists: 'Browser-INV-001',
      issue_date: '2026-03-01',
      supplier_name_if_exists: 'Pelephone',
      supplier_id_if_exists: '520044078',
      gross_amount_if_exists: 100,
      vat_amount_if_exists: 17,
      net_amount_if_exists: 83,
      currency: 'ILS',
      period_hint_if_exists: '2026-03'
    });

    const extractionResult = runtime.useCases.runFieldExtraction.execute({
      actor_id: ACTOR,
      document_intake_ids: [activeIntakeId],
      simulated_ocr_payloads: ocrPayloads
    });

    expect(extractionResult.is_success).toBe(true);
    expect(extractionResult.extracted_set_ids).toHaveLength(1);
    
    // 4. RunClassificationProcess
    const classificationResult = runtime.useCases.runClassification.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: extractionResult.extracted_set_ids
    });

    expect(classificationResult.is_success).toBe(true);
    const classificationFromRepo = runtime.repositories.classificationResult.getById(classificationResult.classification_result_ids[0]);
    
    expect(classificationFromRepo).toBeDefined();
    expect(classificationFromRepo!.classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);

    // 5. Verification - outputs remain explicit and traceable
    const traces = runtime.services.auditTrace.getTracesByActor(ACTOR);
    expect(traces.length).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────
  // BOUNDARY ASSERTIONS: Adapter strictly transforms only
  // ─────────────────────────────────────────────────
  it('should prove adapter does not create accounting truth directly (pure translation)', () => {
    const rawFiles = [new File([""], "test.pdf", { type: "application/pdf" })];
    const conversionResult = convertBrowserFilesToSyncInputs(rawFiles);
    
    expect(conversionResult.validSyncInputs).toHaveLength(1);
    
    // Check shape purely conforms to SyncFileInput without side effects
    const input = conversionResult.validSyncInputs[0];
    
    // Assert no classification/extraction/intake property exists on adapter output
    expect(input).not.toHaveProperty('intake_status');
    expect(input).not.toHaveProperty('classification_status');
    expect(input).not.toHaveProperty('supplier_name_if_exists');
    
    // Assert adapter output can strictly be passed to the runtime without modifying source
    expect(Object.isFrozen(rawFiles[0])).toBe(false); // We didn't freeze it natively, but we didn't add props
    expect((rawFiles[0] as any).classification_status).toBeUndefined();
  });

});
