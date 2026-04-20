// ==========================================
// FILE: accounting-core-orchestration-stage2.integration.test.ts
// PURPOSE: Deep orchestration integration test proving the first 6 use-cases
//          work together as one end-to-end backend flow with full audit tracing.
// DEPENDENCIES: All accounting-core services, repositories, and use-cases.
// ==========================================

import { describe, it, expect, beforeEach } from 'vitest';

// ── Repositories ──
import { InMemoryFolderSyncBatchRepository } from '../repositories/in-memory-folder-sync-batch-repository';
import { InMemorySyncedFileRecordRepository } from '../repositories/in-memory-synced-file-record-repository';
import { InMemoryDocumentIntakeRepository } from '../repositories/in-memory-document-intake-repository';
import { InMemoryExtractedFieldSetRepository } from '../repositories/in-memory-extracted-field-set-repository';
import { InMemoryClassificationResultRepository } from '../repositories/in-memory-classification-result-repository';
import { InMemoryResolutionResultRepository } from '../repositories/in-memory-resolution-result-repository';
import { InMemoryClientCaseMappingRepository } from '../repositories/in-memory-client-case-mapping-repository';

// ── Services ──
import { AuditTraceService } from '../services/audit-trace-service';

// ── Use Cases ──
import { RunFolderSyncProcess } from '../use-cases/run-folder-sync-process';
import { RunDocumentIntakeProcess } from '../use-cases/run-document-intake-process';
import { RunFieldExtractionProcess } from '../use-cases/run-field-extraction-process';
import { RunClassificationProcess } from '../use-cases/run-classification-process';
import { RunReviewResolutionProcess } from '../use-cases/run-review-resolution-process';
import { RunClientCaseMappingProcess } from '../use-cases/run-client-case-mapping-process';

// ── Types ──
import {
  SyncStatus,
  ClassificationStatus,
  ResolutionStatus,
  MappingStatus,
  RawOcrSimulatedInput
} from '../index';

// ═══════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════

describe('Accounting Core Orchestration Stage 2 — Full 6-Step Pipeline', () => {

  // Shared infrastructure — rebuilt per test
  let folderSyncBatchRepo: InMemoryFolderSyncBatchRepository;
  let syncedFileRecordRepo: InMemorySyncedFileRecordRepository;
  let documentIntakeRepo: InMemoryDocumentIntakeRepository;
  let extractedFieldSetRepo: InMemoryExtractedFieldSetRepository;
  let classificationResultRepo: InMemoryClassificationResultRepository;
  let resolutionResultRepo: InMemoryResolutionResultRepository;
  let clientCaseMappingRepo: InMemoryClientCaseMappingRepository;
  let auditTraceService: AuditTraceService;

  beforeEach(() => {
    folderSyncBatchRepo = new InMemoryFolderSyncBatchRepository();
    syncedFileRecordRepo = new InMemorySyncedFileRecordRepository();
    documentIntakeRepo = new InMemoryDocumentIntakeRepository();
    extractedFieldSetRepo = new InMemoryExtractedFieldSetRepository();
    classificationResultRepo = new InMemoryClassificationResultRepository();
    resolutionResultRepo = new InMemoryResolutionResultRepository();
    clientCaseMappingRepo = new InMemoryClientCaseMappingRepository();
    auditTraceService = new AuditTraceService();
  });

  // ─────────────────────────────────────
  // HAPPY PATH: Full pipeline traversal
  // ─────────────────────────────────────
  it('should traverse the full 6-step pipeline from folder sync to client case mapping', () => {
    const ACTOR = 'eldad-cpa-test';
    const CLIENT_ID = 'client-david-test';
    const PERIOD_ID = '2026-Q1';

    // ── STEP 1: Folder Sync ──
    const syncUseCase = new RunFolderSyncProcess(
      folderSyncBatchRepo,
      syncedFileRecordRepo,
      auditTraceService
    );

    const syncResult = syncUseCase.execute({
      actor_id: ACTOR,
      source_machine_reference: 'ELDAD-LAPTOP-TEST',
      root_path: 'C:/clients',
      client_folder_path: 'C:/clients/david-test',
      files: [
        {
          filename: 'pelephone-invoice-march-2026.pdf',
          absolutePath: 'C:/clients/david-test/pelephone-invoice-march-2026.pdf',
          fileSizeBytes: 48200
        }
      ],
      existing_global_hashes: new Set<string>()
    });

    expect(syncResult.is_success).toBe(true);
    expect(syncResult.records_processed).toBe(1);
    expect(syncResult.records_synced).toBe(1);
    expect(syncResult.batch).toBeDefined();

    // Verify persistence
    const persistedBatch = folderSyncBatchRepo.getById(syncResult.batch!.id);
    expect(persistedBatch).toBeDefined();

    const persistedSyncRecords = syncedFileRecordRepo.listByBatch(syncResult.batch!.id);
    expect(persistedSyncRecords).toHaveLength(1);
    expect(persistedSyncRecords[0].sync_status).toBe(SyncStatus.SYNCED);

    const syncedFileId = persistedSyncRecords[0].id;

    // ── STEP 2: Document Intake ──
    const intakeUseCase = new RunDocumentIntakeProcess(
      syncedFileRecordRepo,
      documentIntakeRepo,
      auditTraceService
    );

    const intakeResult = intakeUseCase.execute({
      actor_id: ACTOR,
      synced_file_record_ids: [syncedFileId]
    });

    expect(intakeResult.is_success).toBe(true);
    expect(intakeResult.intakes_created).toBe(1);
    expect(intakeResult.records_rejected).toBe(0);
    expect(intakeResult.intake_ids).toHaveLength(1);

    const intakeId = intakeResult.intake_ids[0];
    const persistedIntake = documentIntakeRepo.getById(intakeId);
    expect(persistedIntake).toBeDefined();

    // ── STEP 3: Field Extraction ──
    const extractionUseCase = new RunFieldExtractionProcess(
      documentIntakeRepo,
      extractedFieldSetRepo,
      auditTraceService
    );

    // Simulated OCR payload with arithmetically consistent data
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      document_number_if_exists: 'INV-2026-0347',
      issue_date: '2026-03-15',
      supplier_name_if_exists: 'פלאפון תקשורת',
      supplier_id_if_exists: '520044078',
      gross_amount_if_exists: 117.0,
      vat_amount_if_exists: 17.0,
      net_amount_if_exists: 100.0,
      currency: 'ILS',
      period_hint_if_exists: '2026-03'
    });

    const extractionResult = extractionUseCase.execute({
      actor_id: ACTOR,
      document_intake_ids: [intakeId],
      simulated_ocr_payloads: ocrPayloads
    });

    expect(extractionResult.is_success).toBe(true);
    expect(extractionResult.extractions_created).toBe(1);
    expect(extractionResult.extracted_set_ids).toHaveLength(1);

    const extractedSetId = extractionResult.extracted_set_ids[0];
    const persistedFieldSet = extractedFieldSetRepo.getById(extractedSetId);
    expect(persistedFieldSet).toBeDefined();
    expect(persistedFieldSet!.gross_amount_if_exists).toBe(117.0);

    // ── STEP 4: Classification ──
    const classificationUseCase = new RunClassificationProcess(
      extractedFieldSetRepo,
      classificationResultRepo,
      auditTraceService
    );

    const classificationResult = classificationUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });

    expect(classificationResult.is_success).toBe(true);
    expect(classificationResult.classifications_created).toBe(1);
    expect(classificationResult.classification_result_ids).toHaveLength(1);

    const classificationId = classificationResult.classification_result_ids[0];
    const persistedClassification = classificationResultRepo.getById(classificationId);
    expect(persistedClassification).toBeDefined();

    // CRITICAL ASSERTION: Classification is AUTO_CLASSIFIED, NEVER VERIFIED directly
    expect(persistedClassification!.classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);
    expect(persistedClassification!.proposed_accounting_component).toBe('COMPONENT_COMMUNICATION_EXPENSES');

    // ── STEP 5: Review Resolution ──
    const resolutionUseCase = new RunReviewResolutionProcess(
      classificationResultRepo,
      resolutionResultRepo,
      auditTraceService
    );

    const resolutionResult = resolutionUseCase.execute({
      actor_id: ACTOR,
      decisions: [
        {
          classification_result_id: classificationId,
          action: 'APPROVE',
          reason: 'Pelephone invoice validated manually against bank statement.',
          reviewer_actor_id: ACTOR,
          rule_assisted: false
        }
      ]
    });

    expect(resolutionResult.is_success).toBe(true);
    expect(resolutionResult.resolutions_created).toBe(1);
    expect(resolutionResult.resolution_result_ids).toHaveLength(1);

    const resolutionId = resolutionResult.resolution_result_ids[0];
    const persistedResolution = resolutionResultRepo.getById(resolutionId);
    expect(persistedResolution).toBeDefined();

    // CRITICAL: Only reaches VERIFIED through explicit reviewer decision
    expect(persistedResolution!.final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);
    expect(persistedResolution!.final_accounting_component_if_verified).toBe('COMPONENT_COMMUNICATION_EXPENSES');

    // ── STEP 6: Client Case Mapping ──
    const mappingUseCase = new RunClientCaseMappingProcess(
      resolutionResultRepo,
      clientCaseMappingRepo,
      auditTraceService
    );

    const mappingResult = mappingUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      resolution_result_ids: [resolutionId]
    });

    expect(mappingResult.is_success).toBe(true);
    expect(mappingResult.mappings_created).toBe(1);
    expect(mappingResult.mapping_ids).toHaveLength(1);

    const mappingId = mappingResult.mapping_ids[0];
    const persistedMapping = clientCaseMappingRepo.getById(mappingId);
    expect(persistedMapping).toBeDefined();
    expect(persistedMapping!.mapping_status).toBe(MappingStatus.LINKED);
    expect(persistedMapping!.linked_client_id).toBe(CLIENT_ID);
    expect(persistedMapping!.linked_accounting_period_id).toBe(PERIOD_ID);

    // ── AUDIT TRAIL VERIFICATION ──
    // All 6 stages should have written traces
    const totalTraces = auditTraceService.getTraceCount();
    expect(totalTraces).toBeGreaterThanOrEqual(6);

    // Actor traces should be consistent
    const actorTraces = auditTraceService.getTracesByActor(ACTOR);
    expect(actorTraces.length).toBe(totalTraces);
  });

  // ──────────────────────────────────────────────────────
  // NEGATIVE: Mapping must fail without VERIFIED status
  // ──────────────────────────────────────────────────────
  it('should block client case mapping when resolution is not VERIFIED_CLASSIFICATION', () => {
    const ACTOR = 'eldad-cpa-negative-test';
    const CLIENT_ID = 'client-negative-test';
    const PERIOD_ID = '2026-Q1';

    // ── STEP 1-4: Run through sync → intake → extraction → classification ──
    const syncUseCase = new RunFolderSyncProcess(
      folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
    );
    const syncResult = syncUseCase.execute({
      actor_id: ACTOR,
      source_machine_reference: 'TEST-MACHINE',
      root_path: 'C:/test',
      client_folder_path: 'C:/test/neg',
      files: [{
        filename: 'invoice-test.pdf',
        absolutePath: 'C:/test/neg/invoice-test.pdf',
        fileSizeBytes: 10000
      }],
      existing_global_hashes: new Set<string>()
    });

    const syncedId = syncedFileRecordRepo.listByBatch(syncResult.batch!.id)[0].id;

    const intakeUseCase = new RunDocumentIntakeProcess(
      syncedFileRecordRepo, documentIntakeRepo, auditTraceService
    );
    const intakeResult = intakeUseCase.execute({
      actor_id: ACTOR,
      synced_file_record_ids: [syncedId]
    });
    const intakeId = intakeResult.intake_ids[0];

    const extractionUseCase = new RunFieldExtractionProcess(
      documentIntakeRepo, extractedFieldSetRepo, auditTraceService
    );
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      supplier_name_if_exists: 'Unknown Vendor',
      supplier_id_if_exists: '111111111',
      gross_amount_if_exists: 50.0,
      vat_amount_if_exists: 7.26,
      net_amount_if_exists: 42.74,
      currency: 'ILS'
    });

    const extractionResult = extractionUseCase.execute({
      actor_id: ACTOR,
      document_intake_ids: [intakeId],
      simulated_ocr_payloads: ocrPayloads
    });
    const extractedSetId = extractionResult.extracted_set_ids[0];

    const classificationUseCase = new RunClassificationProcess(
      extractedFieldSetRepo, classificationResultRepo, auditTraceService
    );
    const classificationResult = classificationUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });

    const classificationId = classificationResult.classification_result_ids[0];

    // ── STEP 5: SKIP review resolution — do NOT create VERIFIED ──
    // Instead, try to map the classification directly without resolution.
    // We need a ResolutionResult that is NOT VERIFIED to prove the block.

    const resolutionUseCase = new RunReviewResolutionProcess(
      classificationResultRepo, resolutionResultRepo, auditTraceService
    );

    // REJECT the classification explicitly
    const resolutionResult = resolutionUseCase.execute({
      actor_id: ACTOR,
      decisions: [{
        classification_result_id: classificationId,
        action: 'REJECT',
        reason: 'Vendor unrecognized — blocking until manual verification.',
        reviewer_actor_id: ACTOR,
        rule_assisted: false
      }]
    });

    expect(resolutionResult.is_success).toBe(true);
    const rejectedResolutionId = resolutionResult.resolution_result_ids[0];
    const rejectedResolution = resolutionResultRepo.getById(rejectedResolutionId);

    // Confirm the resolution is BLOCKED, not VERIFIED
    expect(rejectedResolution!.final_resolution_status).toBe(ResolutionStatus.BLOCKED);

    // ── STEP 6: Attempt mapping with BLOCKED resolution ──
    const mappingUseCase = new RunClientCaseMappingProcess(
      resolutionResultRepo, clientCaseMappingRepo, auditTraceService
    );

    const mappingResult = mappingUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      resolution_result_ids: [rejectedResolutionId]
    });

    // CRITICAL NEGATIVE ASSERTION: Mapping must succeed as a process...
    expect(mappingResult.is_success).toBe(true);
    // ...but zero mappings should be created because the resolution is BLOCKED
    expect(mappingResult.mappings_created).toBe(0);
    // ...and the blocked resolution should be explicitly counted as rejected
    expect(mappingResult.resolutions_rejected).toBe(1);

    // Verify audit trail captured the block
    const actorTraces = auditTraceService.getTracesByActor(ACTOR);
    const blockTraces = actorTraces.filter(t => t.new_state === 'BLOCKED_FROM_MAPPING');
    expect(blockTraces.length).toBeGreaterThanOrEqual(1);
  });
});
