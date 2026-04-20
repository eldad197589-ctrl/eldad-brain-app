// ==========================================
// FILE: in-memory-document-intake-repository.ts
// PURPOSE: In-memory persistence adapter for DocumentIntakeEntity.
// ==========================================

import { DocumentIntakeEntity } from '../types/accounting-core-types';
import { IDocumentIntakeRepository } from './repository-interfaces';

export class InMemoryDocumentIntakeRepository implements IDocumentIntakeRepository {
  private store = new Map<string, DocumentIntakeEntity>();

  public create(entity: DocumentIntakeEntity): void {
    if (this.store.has(entity.id)) {
      throw new Error(`DocumentIntakeEntity with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): DocumentIntakeEntity | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }
}
