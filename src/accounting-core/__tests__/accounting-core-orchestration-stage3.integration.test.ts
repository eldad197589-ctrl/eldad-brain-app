// ==========================================
// FILE: accounting-core-orchestration-stage3.integration.test.ts
// PURPOSE: Final deep integration test proving all 8 use-cases work together
//          as one end-to-end backend flow with analytics and explicit audit trace.
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
import { InMemoryDerivedViewRepository } from '../repositories/in-memory-derived-view-repository';
import { InMemoryAuditTraceRepository } from '../repositories/in-memory-audit-trace-repository';

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
  SyncStatus,
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

describe('Accounting Core Orchestration Stage 3 — Full 8-Step Pipeline', () => {

  // Shared infrastructure — rebuilt per test
  let folderSyncBatchRepo: InMemoryFolderSyncBatchRepository;
  let syncedFileRecordRepo: InMemorySyncedFileRecordRepository;
  let documentIntakeRepo: InMemoryDocumentIntakeRepository;
  let extractedFieldSetRepo: InMemoryExtractedFieldSetRepository;
  let classificationResultRepo: InMemoryClassificationResultRepository;
  let resolutionResultRepo: InMemoryResolutionResultRepository;
  let clientCaseMappingRepo: InMemoryClientCaseMappingRepository;
  let derivedViewRepo: InMemoryDerivedViewRepository;
  let auditTraceRepo: InMemoryAuditTraceRepository;
  let auditTraceService: AuditTraceService;

  beforeEach(() => {
    folderSyncBatchRepo = new InMemoryFolderSyncBatchRepository();
    syncedFileRecordRepo = new InMemorySyncedFileRecordRepository();
    documentIntakeRepo = new InMemoryDocumentIntakeRepository();
    extractedFieldSetRepo = new InMemoryExtractedFieldSetRepository();
    classificationResultRepo = new InMemoryClassificationResultRepository();
    resolutionResultRepo = new InMemoryResolutionResultRepository();
    clientCaseMappingRepo = new InMemoryClientCaseMappingRepository();
    derivedViewRepo = new InMemoryDerivedViewRepository();
    auditTraceRepo = new InMemoryAuditTraceRepository();
    auditTraceService = new AuditTraceService();
  });

  // ─────────────────────────────────────────
  // HAPPY PATH: Full 8-step pipeline traversal
  // ─────────────────────────────────────────
  it('should traverse the full 8-step pipeline from folder sync to audit trace', () => {
    const ACTOR = 'eldad-cpa-stage3';
    const CLIENT_ID = 'client-david-stage3';
    const PERIOD_ID = '2026-Q1';

    // ── STEP 1: Folder Sync ──
    const syncUseCase = new RunFolderSyncProcess(
      folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
    );
    const syncResult = syncUseCase.execute({
      actor_id: ACTOR,
      source_machine_reference: 'ELDAD-LAPTOP-STAGE3',
      root_path: 'C:/clients',
      client_folder_path: 'C:/clients/david-stage3',
      files: [{
        filename: 'google-ads-invoice-march-2026.pdf',
        absolutePath: 'C:/clients/david-stage3/google-ads-invoice-march-2026.pdf',
        fileSizeBytes: 62400
      }],
      existing_global_hashes: new Set<string>()
    });

    expect(syncResult.is_success).toBe(true);
    expect(syncResult.records_synced).toBe(1);
    const syncedFileId = syncedFileRecordRepo.listByBatch(syncResult.batch!.id)[0].id;

    // ── STEP 2: Document Intake ──
    const intakeUseCase = new RunDocumentIntakeProcess(
      syncedFileRecordRepo, documentIntakeRepo, auditTraceService
    );
    const intakeResult = intakeUseCase.execute({
      actor_id: ACTOR,
      synced_file_record_ids: [syncedFileId]
    });

    expect(intakeResult.is_success).toBe(true);
    expect(intakeResult.intakes_created).toBe(1);
    const intakeId = intakeResult.intake_ids[0];

    // ── STEP 3: Field Extraction ──
    const extractionUseCase = new RunFieldExtractionProcess(
      documentIntakeRepo, extractedFieldSetRepo, auditTraceService
    );
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      document_number_if_exists: 'GADS-2026-0891',
      issue_date: '2026-03-20',
      supplier_name_if_exists: 'Google Ads',
      supplier_id_if_exists: '514901265',
      gross_amount_if_exists: 5850.0,
      vat_amount_if_exists: 850.0,
      net_amount_if_exists: 5000.0,
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
    const extractedSetId = extractionResult.extracted_set_ids[0];

    // ── STEP 4: Classification ──
    const classificationUseCase = new RunClassificationProcess(
      extractedFieldSetRepo, classificationResultRepo, auditTraceService
    );
    const classificationResult = classificationUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });

    expect(classificationResult.is_success).toBe(true);
    expect(classificationResult.classifications_created).toBe(1);
    const classificationId = classificationResult.classification_result_ids[0];
    const persistedClassification = classificationResultRepo.getById(classificationId);

    // CRITICAL: Classification NEVER produces VERIFIED directly
    expect(persistedClassification!.classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);
    expect(persistedClassification!.proposed_accounting_component).toBe('COMPONENT_MARKETING_EXPENSES');

    // ── STEP 5: Review Resolution ──
    const resolutionUseCase = new RunReviewResolutionProcess(
      classificationResultRepo, resolutionResultRepo, auditTraceService
    );
    const resolutionResult = resolutionUseCase.execute({
      actor_id: ACTOR,
      decisions: [{
        classification_result_id: classificationId,
        action: 'APPROVE',
        reason: 'Google Ads invoice cross-checked against credit card statement.',
        reviewer_actor_id: ACTOR,
        rule_assisted: false
      }]
    });

    expect(resolutionResult.is_success).toBe(true);
    expect(resolutionResult.resolutions_created).toBe(1);
    const resolutionId = resolutionResult.resolution_result_ids[0];
    const persistedResolution = resolutionResultRepo.getById(resolutionId);
    expect(persistedResolution!.final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);

    // ── STEP 6: Client Case Mapping ──
    const mappingUseCase = new RunClientCaseMappingProcess(
      resolutionResultRepo, clientCaseMappingRepo, auditTraceService
    );
    const mappingResult = mappingUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      resolution_result_ids: [resolutionId]
    });

    expect(mappingResult.is_success).toBe(true);
    expect(mappingResult.mappings_created).toBe(1);
    const mappingId = mappingResult.mapping_ids[0];
    const persistedMapping = clientCaseMappingRepo.getById(mappingId);
    expect(persistedMapping!.mapping_status).toBe(MappingStatus.LINKED);

    // ── STEP 7: Derived Analytics ──
    const analyticsUseCase = new RunDerivedAnalyticsProcess(
      clientCaseMappingRepo, derivedViewRepo, auditTraceService
    );
    const analyticsResult = analyticsUseCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      derived_view_type: 'expense_composition_view'
    });

    expect(analyticsResult.is_success).toBe(true);
    expect(analyticsResult.view_generated).toBe(true);
    expect(analyticsResult.derived_view_id).toBeTruthy();
    expect(analyticsResult.source_records_used).toBe(1);

    const persistedView = derivedViewRepo.getById(analyticsResult.derived_view_id!);
    expect(persistedView).toBeDefined();
    expect(persistedView!.derived_view_status).toBe(DerivedViewStatus.GENERATED);
    expect(persistedView!.client_id).toBe(CLIENT_ID);

    // ── STEP 8: Record Audit Trace ──
    const auditTraceUseCase = new RecordAuditTraceProcess(
      auditTraceService, auditTraceRepo
    );
    const auditResult = auditTraceUseCase.execute({
      actor_id: ACTOR,
      trace_payload: {
        actor_id: ACTOR,
        service_name: 'ManualAuditEntry',
        target_object_type: 'Pipeline',
        target_object_id: 'STAGE3_COMPLETE',
        new_state: 'PIPELINE_VERIFIED',
        reason: 'Full 8-step pipeline run completed and verified by CPA.',
        related_client_if_any: CLIENT_ID,
        related_accounting_period_if_any: PERIOD_ID
      }
    });

    expect(auditResult.is_success).toBe(true);
    expect(auditResult.trace_id).toBeTruthy();
    expect(auditResult.trace_status).toBe(AuditTraceStatus.RECORDED);

    // Verify the trace was persisted to the repository
    const persistedTrace = auditTraceRepo.getById(auditResult.trace_id!);
    expect(persistedTrace).toBeDefined();
    expect(persistedTrace!.actor_id).toBe(ACTOR);

    // ── AUDIT TRAIL TOTALS ──
    const totalTraces = auditTraceService.getTraceCount();
    // At minimum: 1 batch + 1 sync record + 1 intake + 1 extraction + 1 classification
    //           + 1 resolution + 1 mapping + 1 analytics + 1 explicit = 9
    expect(totalTraces).toBeGreaterThanOrEqual(9);

    const actorTraces = auditTraceService.getTracesByActor(ACTOR);
    expect(actorTraces.length).toBe(totalTraces);
  });

  // ──────────────────────────────────────────────
  // NEGATIVE: Mapping blocked without VERIFIED
  // ──────────────────────────────────────────────
  it('should block mapping when resolution is BLOCKED, not VERIFIED', () => {
    const ACTOR = 'eldad-negative-stage3';
    const CLIENT_ID = 'client-neg-stage3';
    const PERIOD_ID = '2026-Q1';

    // Run steps 1-4 quickly
    const syncResult = new RunFolderSyncProcess(
      folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
    ).execute({
      actor_id: ACTOR, source_machine_reference: 'NEG-TEST',
      root_path: 'C:/neg', client_folder_path: 'C:/neg/client',
      files: [{ filename: 'invoice-neg.pdf', absolutePath: 'C:/neg/client/invoice-neg.pdf', fileSizeBytes: 5000 }],
      existing_global_hashes: new Set<string>()
    });
    const syncedId = syncedFileRecordRepo.listByBatch(syncResult.batch!.id)[0].id;

    const intakeResult = new RunDocumentIntakeProcess(
      syncedFileRecordRepo, documentIntakeRepo, auditTraceService
    ).execute({ actor_id: ACTOR, synced_file_record_ids: [syncedId] });
    const intakeId = intakeResult.intake_ids[0];

    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeId, {
      supplier_name_if_exists: 'Unknown Corp', supplier_id_if_exists: '999999999',
      gross_amount_if_exists: 100.0, vat_amount_if_exists: 14.53, net_amount_if_exists: 85.47, currency: 'ILS'
    });
    const extractionResult = new RunFieldExtractionProcess(
      documentIntakeRepo, extractedFieldSetRepo, auditTraceService
    ).execute({ actor_id: ACTOR, document_intake_ids: [intakeId], simulated_ocr_payloads: ocrPayloads });
    const extractedSetId = extractionResult.extracted_set_ids[0];

    const classificationResult = new RunClassificationProcess(
      extractedFieldSetRepo, classificationResultRepo, auditTraceService
    ).execute({
      actor_id: ACTOR, client_id: CLIENT_ID, accounting_period_id: PERIOD_ID,
      extracted_field_set_ids: [extractedSetId]
    });
    const classificationId = classificationResult.classification_result_ids[0];

    // REJECT the classification
    const resolutionResult = new RunReviewResolutionProcess(
      classificationResultRepo, resolutionResultRepo, auditTraceService
    ).execute({
      actor_id: ACTOR,
      decisions: [{
        classification_result_id: classificationId, action: 'REJECT',
        reason: 'Vendor unverified.', reviewer_actor_id: ACTOR, rule_assisted: false
      }]
    });

    expect(resolutionResult.is_success).toBe(true);
    const rejectedResolutionId = resolutionResult.resolution_result_ids[0];
    expect(resolutionResultRepo.getById(rejectedResolutionId)!.final_resolution_status).toBe(ResolutionStatus.BLOCKED);

    // Mapping must reject the BLOCKED resolution
    const mappingResult = new RunClientCaseMappingProcess(
      resolutionResultRepo, clientCaseMappingRepo, auditTraceService
    ).execute({
      actor_id: ACTOR, client_id: CLIENT_ID, accounting_period_id: PERIOD_ID,
      resolution_result_ids: [rejectedResolutionId]
    });

    expect(mappingResult.is_success).toBe(true);
    expect(mappingResult.mappings_created).toBe(0);
    expect(mappingResult.resolutions_rejected).toBe(1);
  });

  // ──────────────────────────────────────────────
  // NEGATIVE: Analytics does not overwrite truth
  // ──────────────────────────────────────────────
  it('should produce analytics without modifying upstream accounting data', () => {
    const ACTOR = 'eldad-analytics-verify';
    const CLIENT_ID = 'client-analytics-test';
    const PERIOD_ID = '2026-Q1';

    // Analytics on empty period — should succeed with no view
    const analyticsResult = new RunDerivedAnalyticsProcess(
      clientCaseMappingRepo, derivedViewRepo, auditTraceService
    ).execute({
      actor_id: ACTOR, client_id: CLIENT_ID, accounting_period_id: PERIOD_ID,
      derived_view_type: 'vat_oriented_analytical_view'
    });

    expect(analyticsResult.is_success).toBe(true);
    expect(analyticsResult.view_generated).toBe(false);
    expect(analyticsResult.derived_view_id).toBeNull();

    // Verify no upstream repos were mutated
    expect(classificationResultRepo.listByClient(CLIENT_ID)).toHaveLength(0);
    expect(clientCaseMappingRepo.listByClient(CLIENT_ID)).toHaveLength(0);
  });

  // ──────────────────────────────────────────────
  // NEGATIVE: Audit trace rejects missing actor_id
  // ──────────────────────────────────────────────
  it('should reject audit trace recording with missing actor_id', () => {
    const auditTraceUseCase = new RecordAuditTraceProcess(
      auditTraceService, auditTraceRepo
    );

    const result = auditTraceUseCase.execute({
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
