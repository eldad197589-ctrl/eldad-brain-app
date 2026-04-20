// ==========================================
// FILE: accounting-core-runtime.ts
// PURPOSE: Type definition for the assembled accounting core runtime.
// DEPENDENCIES: repository interfaces, services, use-cases
// ==========================================

import {
  IFolderSyncBatchRepository,
  ISyncedFileRecordRepository,
  IDocumentIntakeRepository,
  IExtractedFieldSetRepository,
  IClassificationResultRepository,
  IResolutionResultRepository,
  IClientCaseMappingRepository,
  IDerivedViewRepository,
  IAuditTraceRepository
} from '../repositories/repository-interfaces';

import { AuditTraceService } from '../services/audit-trace-service';

import { RunFolderSyncProcess } from '../use-cases/run-folder-sync-process';
import { RunDocumentIntakeProcess } from '../use-cases/run-document-intake-process';
import { RunFieldExtractionProcess } from '../use-cases/run-field-extraction-process';
import { RunClassificationProcess } from '../use-cases/run-classification-process';
import { RunReviewResolutionProcess } from '../use-cases/run-review-resolution-process';
import { RunClientCaseMappingProcess } from '../use-cases/run-client-case-mapping-process';
import { RunDerivedAnalyticsProcess } from '../use-cases/run-derived-analytics-process';
import { RecordAuditTraceProcess } from '../use-cases/record-audit-trace-process';

/**
 * The assembled shape of the Accounting Core runtime.
 * One object the rest of the app can import and call.
 */
export interface AccountingCoreRuntime {

  /** All 9 persistence repositories */
  repositories: {
    folderSyncBatch: IFolderSyncBatchRepository;
    syncedFileRecord: ISyncedFileRecordRepository;
    documentIntake: IDocumentIntakeRepository;
    extractedFieldSet: IExtractedFieldSetRepository;
    classificationResult: IClassificationResultRepository;
    resolutionResult: IResolutionResultRepository;
    clientCaseMapping: IClientCaseMappingRepository;
    derivedView: IDerivedViewRepository;
    auditTrace: IAuditTraceRepository;
  };

  /** Shared services */
  services: {
    auditTrace: AuditTraceService;
  };

  /** All 8 orchestration use-cases */
  useCases: {
    runFolderSync: RunFolderSyncProcess;
    runDocumentIntake: RunDocumentIntakeProcess;
    runFieldExtraction: RunFieldExtractionProcess;
    runClassification: RunClassificationProcess;
    runReviewResolution: RunReviewResolutionProcess;
    runClientCaseMapping: RunClientCaseMappingProcess;
    runDerivedAnalytics: RunDerivedAnalyticsProcess;
    recordAuditTrace: RecordAuditTraceProcess;
  };
}
