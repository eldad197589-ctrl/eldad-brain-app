// ==========================================
// FILE: in-memory-resolution-result-repository.ts
// PURPOSE: In-memory persistence adapter for ResolutionResult.
// ==========================================

import { ResolutionResult } from '../types/accounting-core-types';
import { IResolutionResultRepository } from './repository-interfaces';

export class InMemoryResolutionResultRepository implements IResolutionResultRepository {
  private store = new Map<string, ResolutionResult>();

  public create(entity: ResolutionResult): void {
    if (this.store.has(entity.id)) {
      throw new Error(`ResolutionResult with ID ${entity.id} already exists.`);
    }
    this.store.set(entity.id, { ...entity });
  }

  public getById(id: string): ResolutionResult | undefined {
    const item = this.store.get(id);
    return item ? { ...item } : undefined;
  }
}
