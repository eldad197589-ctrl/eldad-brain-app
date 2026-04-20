// ==========================================
// FILE: accounting-core-runtime-factory.ts
// PURPOSE: Factory assembling the full accounting core runtime with file-based persistence.
// DEPENDENCIES: All persistence, services, and use-case modules.
// ==========================================

import { AccountingCoreRuntime } from './accounting-core-runtime';

// ── File-Based Repositories (default durable runtime) ──
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

/**
 * Creates a fully-wired AccountingCoreRuntime using file-based (localStorage) persistence.
 * This is the default production assembly. For tests, use in-memory repos directly.
 */
export function createAccountingCoreRuntime(): AccountingCoreRuntime {

  // 1. Instantiate repositories
  const folderSyncBatchRepo = new FileBasedFolderSyncBatchRepository();
  const syncedFileRecordRepo = new FileBasedSyncedFileRecordRepository();
  const documentIntakeRepo = new FileBasedDocumentIntakeRepository();
  const extractedFieldSetRepo = new FileBasedExtractedFieldSetRepository();
  const classificationResultRepo = new FileBasedClassificationResultRepository();
  const resolutionResultRepo = new FileBasedResolutionResultRepository();
  const clientCaseMappingRepo = new FileBasedClientCaseMappingRepository();
  const derivedViewRepo = new FileBasedDerivedViewRepository();
  const auditTraceRepo = new FileBasedAuditTraceRepository();

  // 2. Instantiate shared services
  const auditTraceService = new AuditTraceService();

  // 3. Wire use-cases with their repository dependencies
  const runFolderSync = new RunFolderSyncProcess(
    folderSyncBatchRepo, syncedFileRecordRepo, auditTraceService
  );

  const runDocumentIntake = new RunDocumentIntakeProcess(
    syncedFileRecordRepo, documentIntakeRepo, auditTraceService
  );

  const runFieldExtraction = new RunFieldExtractionProcess(
    documentIntakeRepo, extractedFieldSetRepo, auditTraceService
  );

  const runClassification = new RunClassificationProcess(
    extractedFieldSetRepo, classificationResultRepo, auditTraceService
  );

  const runReviewResolution = new RunReviewResolutionProcess(
    classificationResultRepo, resolutionResultRepo, auditTraceService
  );

  const runClientCaseMapping = new RunClientCaseMappingProcess(
    resolutionResultRepo, clientCaseMappingRepo, auditTraceService
  );

  const runDerivedAnalytics = new RunDerivedAnalyticsProcess(
    clientCaseMappingRepo, derivedViewRepo, auditTraceService
  );

  const recordAuditTrace = new RecordAuditTraceProcess(
    auditTraceService, auditTraceRepo
  );

  // 4. Return assembled runtime
  return {
    repositories: {
      folderSyncBatch: folderSyncBatchRepo,
      syncedFileRecord: syncedFileRecordRepo,
      documentIntake: documentIntakeRepo,
      extractedFieldSet: extractedFieldSetRepo,
      classificationResult: classificationResultRepo,
      resolutionResult: resolutionResultRepo,
      clientCaseMapping: clientCaseMappingRepo,
      derivedView: derivedViewRepo,
      auditTrace: auditTraceRepo
    },
    services: {
      auditTrace: auditTraceService
    },
    useCases: {
      runFolderSync,
      runDocumentIntake,
      runFieldExtraction,
      runClassification,
      runReviewResolution,
      runClientCaseMapping,
      runDerivedAnalytics,
      recordAuditTrace
    }
  };
}
