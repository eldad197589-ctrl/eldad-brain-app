// ==========================================
// FILE: in-memory-extracted-field-set-repository.ts
// PURPOSE: In-memory persistence adapter for ExtractedFieldSet.
// ==========================================

import { ExtractedFieldSet } from '../types/accounting-core-types';
import { IExtractedFieldSetRepository } from './repository-interfaces';

export class InMemoryExtractedFieldSetRepository implements IExtractedFieldSetRepository {
  private store = new Map<string, ExtractedFieldSet>();

  public create(entity: ExtractedFieldSet): void {
    if (this.store.has(entity.id)) {
      throw new Error(`ExtractedFieldSet with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): ExtractedFieldSet | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }
}
