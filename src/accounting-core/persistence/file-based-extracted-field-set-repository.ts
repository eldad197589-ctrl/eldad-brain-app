// ==========================================
// FILE: file-based-extracted-field-set-repository.ts
// PURPOSE: Local durable persistence for ExtractedFieldSet.
// ==========================================

import { ExtractedFieldSet } from '../types/accounting-core-types';
import { IExtractedFieldSetRepository } from '../repositories/repository-interfaces';
import { LocalStorageBaseRepository } from './local-storage-base-repository';
import { EntityTypes } from './local-persistence-paths';

export class FileBasedExtractedFieldSetRepository
  extends LocalStorageBaseRepository<ExtractedFieldSet>
  implements IExtractedFieldSetRepository {

  constructor() {
    super(EntityTypes.EXTRACTED_FIELD_SET);
  }
}
