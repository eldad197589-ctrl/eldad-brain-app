// ==========================================
// FILE: accounting-core-file-based-persistence.integration.test.ts
// PURPOSE: Prove file-based (localStorage) persistence can replace in-memory
//          repositories without breaking the orchestration flow.
// DEPENDENCIES: All accounting-core services, file-based repositories, use-cases.
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

// ── File-Based Repositories ──
import { FileBasedFolderSyncBatchRepository } from '../persistence/file-based-folder-sync-batch-repository';
import { FileBasedSyncedFileRecordRepository } from '../persistence/file-based-synced-file-record-repository';
import { FileBasedDocumentIntakeRepository } from '../persistence/file-based-document-intake-repository';
import { FileBasedExtractedFieldSetRepository } from '../persistence/file-based-extracted-field-set-repository';
import { FileBasedClassificationResultRepository } from '../persistence/file-based-classification-result-repository';
import { FileBasedResolutionResultRepository } from '../persistence/file-based-resolution-result-repository';
import { FileBasedClientCaseMappingRepository } from '../persistence/file-based-client-case-mapping-repository';
import { FileBasedDerivedViewRepository } from '../persistence/file-based-derived-view-repository';
import { FileBasedAuditTraceRepository } from '../persistence/file-based-audit-trace-repository';

// ── Services ──
import { AuditTraceService } from '../services/audit-trace-service';

// ── Use Cases ──
import { RunFolderSyncProcess } from '../use-cases/run-folder-sync-process';
import { RunDocumentIntakeProcess } from '../use-cases/run-document-intake-process';
import { RunFieldExtractionProcess } from '../use-cases/run-field-extraction-process';
import { RunClassificationProcess } from '../use-cases/run-classification-process';
import { RunReviewResolutionProcess } from '../use-cases/run-review-resolution-process';
import { RunClientCaseMappingProcess } from '../use-cases/run-client-case-mapping-process';
import { RunDerivedAnalyticsProcess } from '../use-cases/run-derived-analytics-process';
import { RecordAuditTraceProcess } from '../use-cases/record-audit-trace-process';

// ── Types ──
import {
  ClassificationStatus,
  ResolutionStatus,
  MappingStatus,
  DerivedViewStatus,
  AuditTraceStatus,
  RawOcrSimulatedInput
} from '../index';

// ═══════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════

describe('Accounting Core — File-Based Persistence Integration', () => {

  let folderSyncBatchRepo: FileBasedFolderSyncBatchRepository;
  let syncedFileRecordRepo: FileBasedSyncedFileRecordRepository;
  let documentIntakeRepo: FileBasedDocumentIntakeRepository;
  let extractedFieldSetRepo: FileBasedExtractedFieldSetRepository;
  let classificationResultRepo: FileBasedClassificationResultRepository;
  let resolutionResultRepo: FileBasedResolutionResultRepository;
  let clientCaseMappingRepo: FileBasedClientCaseMappingRepository;
  let derivedViewRepo: FileBasedDerivedViewRepository;
  let auditTraceRepo: FileBasedAuditTraceRepository;
  let auditTraceService: AuditTraceService;

  beforeEach(() => {
    localStorage.clear();

    folderSyncBatchRepo = new FileBasedFolderSyncBatchRepository();
    syncedFileRecordRepo = new FileBasedSyncedFileRecordRepository();
    documentIntakeRepo = new FileBasedDocumentIntakeRepository();
    extractedFieldSetRepo = new FileBasedExtractedFieldSetRepository();
    classificationResultRepo = new FileBasedClassificationResultRepository();
    resolutionResultRepo = new FileBasedResolutionResultRepository();
    clientCaseMappingRepo = new FileBasedClientCaseMappingRepository();
    derivedViewRepo = new FileBasedDerivedViewRepository();
    auditTraceRepo = new FileBasedAuditTraceRepository();
    auditTraceService = new AuditTraceService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ─────────────────────────────────────────────────
  // HAPPY PATH: Full 8-step pipeline on file-based repos
  // ─────────────────────────────────────────────────
  it('should run the full 8-step pipeline on file-based repositories', () => {
    const ACTOR = 'eldad-persistence-test';
    const CLIENT_ID = 'client-persist-david';
    const PERIOD_ID = '2026-Q1';

    // ── STEP 1: Folder Sync ──
    const syncResult = new RunFolderSyncProcess(
      folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      source_machine_reference: 'PERSIST-LAPTOP',
      root_path: 'C:/persist-test',
      client_folder_path: 'C:/persist-test/david',
      files: [{
        filename: 'pelephone-invoice-q1-2026.pdf',
        absolutePath: 'C:/persist-test/david/pelephone-invoice-q1-2026.pdf',
        fileSizeBytes: 33100
      }],
      existing_global_hashes: new Set<string>()
    });

    expect(syncResult.is_success).toBe(true);
    expect(syncResult.records_synced).toBe(1);

    // PERSISTENCE CHECK: data survives repo re-read
    const batchFromStorage = folderSyncBatchRepo.getById(syncResult.batch!.id);
    expect(batchFromStorage).toBeDefined();
    const syncRecords = syncedFileRecordRepo.listByBatch(syncResult.batch!.id);
    expect(syncRecords).toHaveLength(1);
    const syncedFileId = syncRecords[0].id;

    // ── STEP 2: Document Intake ──
    const intakeResult = new RunDocumentIntakeProcess(
      syncedFileRecordRepo, documentIntakeRepo, auditTraceService
    ).execute({ actor_id: ACTOR, synced_file_record_ids: [syncedFileId] });

    expect(intakeResult.is_success).toBe(true);
    expect(intakeResult.intakes_created).toBe(1);
    const intakeId = intakeResult.intake_ids[0];

    // PERSISTENCE CHECK
    const intakeFromStorage = documentIntakeRepo.getById(intakeId);
    expect(intakeFromStorage).toBeDefined();

    // ── STEP 3: Field Extraction ──
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      document_number_if_exists: 'PLF-2026-1122',
      issue_date: '2026-01-15',
      supplier_name_if_exists: 'Pelephone',
      supplier_id_if_exists: '520044078',
      gross_amount_if_exists: 234.0,
      vat_amount_if_exists: 34.0,
      net_amount_if_exists: 200.0,
      currency: 'ILS',
      period_hint_if_exists: '2026-01'
    });

    const extractionResult = new RunFieldExtractionProcess(
      documentIntakeRepo, extractedFieldSetRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      document_intake_ids: [intakeId],
      simulated_ocr_payloads: ocrPayloads
    });

    expect(extractionResult.is_success).toBe(true);
    const extractedSetId = extractionResult.extracted_set_ids[0];

    // PERSISTENCE CHECK
    const fieldSetFromStorage = extractedFieldSetRepo.getById(extractedSetId);
    expect(fieldSetFromStorage).toBeDefined();
    expect(fieldSetFromStorage!.gross_amount_if_exists).toBe(234.0);

    // ── STEP 4: Classification ──
    const classificationResult = new RunClassificationProcess(
      extractedFieldSetRepo, classificationResultRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });

    expect(classificationResult.is_success).toBe(true);
    const classificationId = classificationResult.classification_result_ids[0];

    // PERSISTENCE CHECK: never VERIFIED directly
    const classFromStorage = classificationResultRepo.getById(classificationId);
    expect(classFromStorage).toBeDefined();
    expect(classFromStorage!.classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);

    // listByClient on file-based repo
    const clientClassifications = classificationResultRepo.listByClient(CLIENT_ID);
    expect(clientClassifications).toHaveLength(1);

    // ── STEP 5: Review Resolution ──
    const resolutionResult = new RunReviewResolutionProcess(
      classificationResultRepo, resolutionResultRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      decisions: [{
        classification_result_id: classificationId,
        action: 'APPROVE',
        reason: 'Pelephone invoice verified against bank statement.',
        reviewer_actor_id: ACTOR,
        rule_assisted: false
      }]
    });

    expect(resolutionResult.is_success).toBe(true);
    const resolutionId = resolutionResult.resolution_result_ids[0];

    // PERSISTENCE CHECK
    const resFromStorage = resolutionResultRepo.getById(resolutionId);
    expect(resFromStorage).toBeDefined();
    expect(resFromStorage!.final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);

    // ── STEP 6: Client Case Mapping ──
    const mappingResult = new RunClientCaseMappingProcess(
      resolutionResultRepo, clientCaseMappingRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      resolution_result_ids: [resolutionId]
    });

    expect(mappingResult.is_success).toBe(true);
    expect(mappingResult.mappings_created).toBe(1);
    const mappingId = mappingResult.mapping_ids[0];

    // PERSISTENCE CHECKS: listByClient and listByPeriod
    const mappingFromStorage = clientCaseMappingRepo.getById(mappingId);
    expect(mappingFromStorage).toBeDefined();
    expect(mappingFromStorage!.mapping_status).toBe(MappingStatus.LINKED);

    const clientMappings = clientCaseMappingRepo.listByClient(CLIENT_ID);
    expect(clientMappings).toHaveLength(1);

    const periodMappings = clientCaseMappingRepo.listByPeriod(CLIENT_ID, PERIOD_ID);
    expect(periodMappings).toHaveLength(1);

    // ── STEP 7: Derived Analytics ──
    const analyticsResult = new RunDerivedAnalyticsProcess(
      clientCaseMappingRepo, derivedViewRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      derived_view_type: 'vat_oriented_analytical_view'
    });

    expect(analyticsResult.is_success).toBe(true);
    expect(analyticsResult.view_generated).toBe(true);

    // PERSISTENCE CHECK
    const viewFromStorage = derivedViewRepo.getById(analyticsResult.derived_view_id!);
    expect(viewFromStorage).toBeDefined();
    expect(viewFromStorage!.derived_view_status).toBe(DerivedViewStatus.GENERATED);

    const clientViews = derivedViewRepo.listByClient(CLIENT_ID);
    expect(clientViews).toHaveLength(1);

    // ── STEP 8: Record Audit Trace ──
    const auditResult = new RecordAuditTraceProcess(
      auditTraceService, auditTraceRepo
    ).execute({
      actor_id: ACTOR,
      trace_payload: {
        actor_id: ACTOR,
        service_name: 'PersistenceTest',
        target_object_type: 'Pipeline',
        target_object_id: 'PERSIST_COMPLETE',
        new_state: 'PIPELINE_VERIFIED',
        reason: 'Full pipeline verified on file-based persistence.',
        related_client_if_any: CLIENT_ID,
        related_accounting_period_if_any: PERIOD_ID
      }
    });

    expect(auditResult.is_success).toBe(true);
    expect(auditResult.trace_status).toBe(AuditTraceStatus.RECORDED);

    // PERSISTENCE CHECK: trace persisted to repo
    const traceFromStorage = auditTraceRepo.getById(auditResult.trace_id!);
    expect(traceFromStorage).toBeDefined();
    expect(traceFromStorage!.actor_id).toBe(ACTOR);
  });

  // ──────────────────────────────────────────────
  // PERSISTENCE: Duplicate ID throws, no overwrite
  // ──────────────────────────────────────────────
  it('should reject duplicate ID creation (no-overwrite guarantee)', () => {
    const syncResult = new RunFolderSyncProcess(
      folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
    ).execute({
      actor_id: 'dup-test-actor',
      source_machine_reference: 'DUP-MACHINE',
      root_path: 'C:/dup', client_folder_path: 'C:/dup/client',
      files: [{ filename: 'dup.pdf', absolutePath: 'C:/dup/client/dup.pdf', fileSizeBytes: 1000 }],
      existing_global_hashes: new Set<string>()
    });

    const batch = syncResult.batch!;

    // Attempting to create the same batch again should throw
    expect(() => folderSyncBatchRepo.create(batch)).toThrow(/already exists/);
  });

  // ──────────────────────────────────────────────
  // NEGATIVE: Audit trace rejects missing actor
  // ──────────────────────────────────────────────
  it('should block audit trace recording with empty actor_id on file-based repo', () => {
    const result = new RecordAuditTraceProcess(
      auditTraceService, auditTraceRepo
    ).execute({
      actor_id: '',
      trace_payload: {
        actor_id: '',
        service_name: 'GhostService',
        target_object_type: 'Unknown',
        target_object_id: 'ghost-001',
        new_state: 'PHANTOM',
        reason: 'Anonymous attempt.'
      }
    });

    expect(result.is_success).toBe(false);
    expect(result.trace_id).toBeNull();
    expect(result.trace_status).toBe(AuditTraceStatus.BLOCKED);
  });
});
