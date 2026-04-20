// ==========================================
// FILE: accounting-core-pipeline.integration.test.ts
// PURPOSE: Structural integration proof running a full mocked pipeline across all 8 accounting-core services.
// DEPENDENCIES: index.ts (Accounting Core Module)
// ==========================================

import { describe, it, expect } from 'vitest';

import {
  FolderSyncIngestionService,
  SyncFileInput,
  DocumentIntakeService,
  FieldExtractionService,
  RawOcrSimulatedInput,
  ClassificationService,
  ReviewResolutionService,
  ReviewerDecision,
  ClientCaseMappingService,
  DerivedAnalyticsService,
  DerivedViewType,
  AuditTraceService,
  SyncStatus,
  IntakeStatus,
  ExtractionStatus,
  ClassificationStatus,
  ResolutionStatus,
  MappingStatus,
  DerivedViewStatus,
  AuditTraceStatus
} from '../index';

describe('Accounting Core Full Pipeline Integration', () => {
  it('successfully executes one mocked document through all 8 services', () => {
    // Setup Services
    const folderSyncService = new FolderSyncIngestionService('TEST_MACHINE_001');
    const intakeService = new DocumentIntakeService();
    const extractionService = new FieldExtractionService();
    const classificationService = new ClassificationService();
    const resolutionService = new ReviewResolutionService();
    const mappingService = new ClientCaseMappingService();
    const analyticsService = new DerivedAnalyticsService();
    const auditService = new AuditTraceService();

    const CLIENT_ID = 'CLIENT_ELDAD_G_001';
    const PERIOD_ID = '2026_02';

    // ---------------------------------------------------------
    // Phase 1: Folder Sync Ingestion
    // ---------------------------------------------------------
    const mockFiles: SyncFileInput[] = [{
      filename: 'invoice-pelephone.pdf',
      absolutePath: '/mock/local/client/invoice-pelephone.pdf',
      fileSizeBytes: 1024
    }];
    
    const syncResult = folderSyncService.processClientFolder(
      '/mock/local/root',
      '/mock/local/root/client',
      mockFiles,
      new Set<string>() // empty global hashes
    );

    expect(syncResult.records.length).toBe(1);
    expect(syncResult.records[0].sync_status).toBe(SyncStatus.SYNCED);

    auditService.record({
      actor_id: 'SYSTEM_SYNC_DAEMON',
      service_name: 'FolderSyncIngestionService',
      target_object_type: 'SyncedFileRecord',
      target_object_id: syncResult.records[0].id,
      new_state: SyncStatus.SYNCED,
      reason: 'Initial file sync detected cleanly',
      related_client_if_any: CLIENT_ID,
      related_batch_or_run_id_if_any: syncResult.batch.id
    });

    // ---------------------------------------------------------
    // Phase 2: Document Intake
    // ---------------------------------------------------------
    const intakeResult = intakeService.processSyncedFiles(syncResult.records);
    expect(intakeResult.accepted_intakes.length).toBe(1);
    expect(intakeResult.accepted_intakes[0].intake_status).toBe(IntakeStatus.DOCUMENT_IDENTIFIED);

    const intakeEntity = intakeResult.accepted_intakes[0];

    // ---------------------------------------------------------
    // Phase 3: Field Extraction
    // ---------------------------------------------------------
    const ocrPayloads = new Map<string, RawOcrSimulatedInput>();
    ocrPayloads.set(intakeEntity.id, {
      supplier_name_if_exists: 'Pelephone Ltd',
      supplier_id_if_exists: '520044078',
      gross_amount_if_exists: 117,
      net_amount_if_exists: 100,
      vat_amount_if_exists: 17,
      currency: 'ILS'
    });

    const extractionResult = extractionService.extractFields(intakeResult.accepted_intakes, ocrPayloads);
    expect(extractionResult.extracted_fields.length).toBe(1);
    expect(extractionResult.extracted_fields[0].extraction_status).toBe(ExtractionStatus.EXTRACTED);

    const extractedField = extractionResult.extracted_fields[0];

    // ---------------------------------------------------------
    // Phase 4: Classification
    // ---------------------------------------------------------
    const classificationResult = classificationService.classifyExtractions(
      extractionResult.extracted_fields,
      CLIENT_ID,
      PERIOD_ID
    );

    expect(classificationResult.classified_proposals.length).toBe(1);
    expect(classificationResult.classified_proposals[0].classification_status).toBe(ClassificationStatus.AUTO_CLASSIFIED);
    expect(classificationResult.classified_proposals[0].proposed_accounting_component).toBe('COMPONENT_COMMUNICATION_EXPENSES');

    const classifiedProposal = classificationResult.classified_proposals[0];

    // ---------------------------------------------------------
    // Phase 5: Review Resolution
    // ---------------------------------------------------------
    // Simulate explicit human review approval
    const decisions: ReviewerDecision[] = [{
      classification_result_id: classifiedProposal.id,
      action: 'APPROVE',
      reason: 'Confirmed communication expense for Pelephone',
      reviewer_actor_id: 'USER_ELDAD',
      rule_assisted: false
    }];

    const resolutionResult = resolutionService.resolveClassifications(
      classificationResult.classified_proposals,
      decisions
    );

    expect(resolutionResult.resolved.length).toBe(1);
    expect(resolutionResult.resolved[0].final_resolution_status).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);

    const resolvedEntity = resolutionResult.resolved[0];

    auditService.record({
      actor_id: 'USER_ELDAD',
      service_name: 'ReviewResolutionService',
      target_object_type: 'ResolutionResult',
      target_object_id: resolvedEntity.id,
      prior_state_if_any: ClassificationStatus.AUTO_CLASSIFIED,
      new_state: ResolutionStatus.VERIFIED_CLASSIFICATION,
      reason: 'Confirmed communication expense for Pelephone',
      related_client_if_any: CLIENT_ID,
      related_accounting_period_if_any: PERIOD_ID
    });

    // ---------------------------------------------------------
    // Phase 6: Client Case Mapping
    // ---------------------------------------------------------
    const mappedHashes = new Set<string>();
    const mappingResult = mappingService.mapVerifiedResults(
      resolutionResult.resolved,
      CLIENT_ID,
      PERIOD_ID,
      mappedHashes
    );

    expect(mappingResult.mapped.length).toBe(1);
    expect(mappingResult.mapped[0].mapping_status).toBe(MappingStatus.LINKED);

    const mappedEntity = mappingResult.mapped[0];

    // ---------------------------------------------------------
    // Phase 7: Derived Analytics
    // ---------------------------------------------------------
    const analyticsResult = analyticsService.generateView({
      mappings: mappingResult.mapped,
      viewType: 'expense_composition_view' as DerivedViewType,
      clientId: CLIENT_ID,
      accountingPeriodId: PERIOD_ID
    });

    expect(analyticsResult.view).not.toBeNull();
    expect(analyticsResult.view?.derived_view_status).toBe(DerivedViewStatus.GENERATED);
    expect(analyticsResult.view?.derived_summary_payload.total_records).toBe(1);

    // ---------------------------------------------------------
    // Phase 8: Audit Trace Validation
    // ---------------------------------------------------------
    const traces = auditService.getTracesForObject(resolvedEntity.id);
    expect(traces.length).toBeGreaterThan(0);
    expect(traces[0].trace_status).toBe(AuditTraceStatus.RECORDED);
    expect(traces[0].new_state).toBe(ResolutionStatus.VERIFIED_CLASSIFICATION);
  });
});
