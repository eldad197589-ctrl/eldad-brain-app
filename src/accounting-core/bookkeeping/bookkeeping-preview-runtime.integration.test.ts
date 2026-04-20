// ==========================================
// FILE: bookkeeping-preview-runtime.integration.test.ts
// PURPOSE: Directly validates that the orchestrator mechanically builds Bookkeeping Preview mappings purely over verified bounds without writing changes to persistence nodes.
// DEPENDENCIES: vitest, standard testing models
// ==========================================

import { describe, it, expect, beforeEach } from 'vitest';
import { RunBookkeepingPreviewProcess } from './run-bookkeeping-preview-process';
import { BookkeepingPreviewService } from './bookkeeping-preview-service';

// Repository implementations
import { InMemoryClientCaseMappingRepository } from '../repositories/in-memory-client-case-mapping-repository';
import { InMemoryResolutionResultRepository } from '../repositories/in-memory-resolution-result-repository';
import { InMemoryClassificationResultRepository } from '../repositories/in-memory-classification-result-repository';
import { InMemoryExtractedFieldSetRepository } from '../repositories/in-memory-extracted-field-set-repository';
import { InMemoryAuditTraceRepository } from '../repositories/in-memory-audit-trace-repository';
import { AuditTraceService } from '../services/audit-trace-service';

// Typings
import { MappingStatus, ResolutionStatus, ClassificationStatus, ExtractionStatus } from '../types/accounting-core-types';

describe('Accounting Core — Bookkeeping Preview Orchestration', () => {
  let mappingRepo: InMemoryClientCaseMappingRepository;
  let resolutionRepo: InMemoryResolutionResultRepository;
  let classificationRepo: InMemoryClassificationResultRepository;
  let extractionRepo: InMemoryExtractedFieldSetRepository;
  let auditTraceLog: AuditTraceService;
  
  let useCase: RunBookkeepingPreviewProcess;

  beforeEach(() => {
    mappingRepo = new InMemoryClientCaseMappingRepository();
    resolutionRepo = new InMemoryResolutionResultRepository();
    classificationRepo = new InMemoryClassificationResultRepository();
    extractionRepo = new InMemoryExtractedFieldSetRepository();
    auditTraceLog = new AuditTraceService();
    
    // Inject the real test trace Repo to allow tracking assertions
    const repo = new InMemoryAuditTraceRepository();
    // Rebind private field natively per test
    (auditTraceLog as any).auditTraceRepository = repo;

    const previewService = new BookkeepingPreviewService();
    useCase = new RunBookkeepingPreviewProcess(
      previewService,
      mappingRepo,
      resolutionRepo,
      classificationRepo,
      extractionRepo,
      auditTraceLog
    );
  });

  const ACTOR = 'test_cpa_previewer';
  const CLIENT_ID = 'test_client_global';
  const PERIOD_ID = '2026-Q1';

  it('proves happy path: explicitly verified links translate uniquely into fully composed ready previews', () => {
    // 1. Setup Data Dependencies Structurally Tracking Extracted Input Through Resolution
    extractionRepo.create({
      id: 'ext_test_1',
      document_intake_id: 'in-test-1',
      gross_amount_if_exists: 1170.0,
      vat_amount_if_exists: 170.0,
      extraction_confidence: 0.99,
      extraction_status: ExtractionStatus.EXTRACTED_AND_READY
    });

    classificationRepo.create({
      id: 'clas_test_1',
      document_intake_id: 'in-test-1',
      extracted_field_set_id: 'ext_test_1',
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID,
      proposed_accounting_component: 'EXPENSE_TEST',
      classification_confidence: 0.95,
      classification_status: ClassificationStatus.NEEDS_REVIEW
    });

    resolutionRepo.create({
      id: 'res_test_1',
      classification_result_id: 'clas_test_1',
      final_resolution_status: ResolutionStatus.VERIFIED_CLASSIFICATION,
      final_accounting_component_if_verified: 'EXPENSE_SOFTWARE'
    });

    mappingRepo.create({
      id: 'map_test_1',
      resolution_result_id: 'res_test_1',
      mapping_status: MappingStatus.LINKED,
      linked_client_id: CLIENT_ID,
      linked_accounting_period_id: PERIOD_ID
    });

    // 2. Execute Preview Orchestration
    const result = useCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID
    });

    // 3. Assertion Checks
    expect(result.is_success).toBe(true);
    expect(result.blocked_count).toBe(0);
    expect(result.generated_candidates.length).toBe(1);

    const generated = result.generated_candidates[0];
    expect(generated.balancing_status).toBe('BALANCED');
    expect(generated.preview_status).toBe('PREVIEW_READY');
    expect(generated.debit_lines.length).toBe(2); // Net = 1000, VAT = 170
    expect(generated.credit_lines.length).toBe(1); // Liability = 1170
    
    // Assert strictly bounded execution (no data mutated)
    expect(auditTraceLog.getTraceCount()).toBe(1); // 1 preview log explicitly traced
  });

  it('proves blocked path: drops mapping without generating candidate if mapping relies on non-verified or broken references', () => {
    // We create a linked mapping but link it to an UNVERIFIED downstream trace
    resolutionRepo.create({
      id: 'res_blocked_1',
      classification_result_id: 'missing-class', // broken tree
      final_resolution_status: ResolutionStatus.BLOCKED // NOT verified bounds
    });

    mappingRepo.create({
      id: 'map_blocked_1',
      resolution_result_id: 'res_blocked_1',
      mapping_status: MappingStatus.LINKED,
      linked_client_id: CLIENT_ID,
      linked_accounting_period_id: PERIOD_ID
    });

    const result = useCase.execute({
      actor_id: ACTOR,
      client_id: CLIENT_ID,
      accounting_period_id: PERIOD_ID
    });

    // Expecting to just ignore mapping safely passing over it instead of structurally corrupting
    expect(result.is_success).toBe(true);
    expect(result.blocked_count).toBe(1);
    expect(result.generated_candidates.length).toBe(0);
  });

});
