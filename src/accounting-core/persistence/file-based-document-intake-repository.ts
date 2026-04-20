// ==========================================
// FILE: file-based-document-intake-repository.ts
// PURPOSE: Local durable persistence for DocumentIntakeEntity.
// ==========================================

import { DocumentIntakeEntity } from '../types/accounting-core-types';
import { IDocumentIntakeRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedDocumentIntakeRepository
  extends LocalStorageBaseRepository<DocumentIntakeEntity>
  implements IDocumentIntakeRepository {

  constructor() {
    super(EntityTypes.DOCUMENT_INTAKE);
  }
}
