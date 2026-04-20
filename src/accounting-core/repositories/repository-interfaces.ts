// ==========================================
// FILE: repository-interfaces.ts
// PURPOSE: Unified contracts for all 9 accounting core repositories ensuring compliance with the persistence blueprint.
// DEPENDENCIES: ../types/accounting-core-types.ts
// ==========================================

import {
  FolderSyncBatch, SyncedFileRecord, DocumentIntakeEntity, ExtractedFieldSet,
  ClassificationResult, ResolutionResult, ClientCaseMapping, DerivedView,
  ImmutableAuditTraceRecord
} from '../types/accounting-core-types';

export interface IFolderSyncBatchRepository {
  create(entity: FolderSyncBatch): void;
  getById(id: string): FolderSyncBatch | undefined;
}

export interface ISyncedFileRecordRepository {
  create(entity: SyncedFileRecord): void;
  getById(id: string): SyncedFileRecord | undefined;
  listByBatch(batchId: string): SyncedFileRecord[];
}

export interface IDocumentIntakeRepository {
  create(entity: DocumentIntakeEntity): void;
  getById(id: string): DocumentIntakeEntity | undefined;
}

export interface IExtractedFieldSetRepository {
  create(entity: ExtractedFieldSet): void;
  getById(id: string): ExtractedFieldSet | undefined;
}

export interface IClassificationResultRepository {
  create(entity: ClassificationResult): void;
  getById(id: string): ClassificationResult | undefined;
  listByClient(clientId: string): ClassificationResult[];
  listByPeriod(clientId: string, periodId: string): ClassificationResult[];
}

export interface IResolutionResultRepository {
  create(entity: ResolutionResult): void;
  getById(id: string): ResolutionResult | undefined;
}

export interface IClientCaseMappingRepository {
  create(entity: ClientCaseMapping): void;
  getById(id: string): ClientCaseMapping | undefined;
  listByClient(clientId: string): ClientCaseMapping[];
  listByPeriod(clientId: string, periodId: string): ClientCaseMapping[];
}

export interface IDerivedViewRepository {
  create(entity: DerivedView): void;
  getById(id: string): DerivedView | undefined;
  listByClient(clientId: string): DerivedView[];
  listByPeriod(clientId: string, periodId: string): DerivedView[];
}

export interface IAuditTraceRepository {
  create(entity: ImmutableAuditTraceRecord): void;
  getById(id: string): ImmutableAuditTraceRecord | undefined;
  listByClient(clientId: string): ImmutableAuditTraceRecord[];
  listByPeriod(clientId: string, periodId: string): ImmutableAuditTraceRecord[];
  listByBatch(batchId: string): ImmutableAuditTraceRecord[];
}
