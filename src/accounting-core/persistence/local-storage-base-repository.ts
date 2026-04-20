// ==========================================
// FILE: local-storage-base-repository.ts
// PURPOSE: Shared base for all file-based (localStorage) repository implementations.
// DEPENDENCIES: local-persistence-paths.ts
// ==========================================

import { entityKey, indexKey } from './local-persistence-paths';

/**
 * Generic base repository using localStorage as a durable JSON store.
 * Each entity is stored as a separate JSON string keyed by type+ID.
 * A separate index key tracks all IDs for a given entity type.
 *
 * Rules:
 * - No delete. No destructive overwrite.
 * - create() refuses duplicates.
 * - All reads return deep copies (JSON parse produces independent objects).
 */
export class LocalStorageBaseRepository<T extends { id: string }> {

  constructor(protected readonly entityType: string) {}

  /** Append a new entity. Throws if ID already exists. */
  public create(entity: T): void {
    const key = entityKey(this.entityType, entity.id);

    if (localStorage.getItem(key) !== null) {
      throw new Error(`${this.entityType} with ID ${entity.id} already exists. No overwrite allowed.`);
    }

    localStorage.setItem(key, JSON.stringify(entity));
    this.addToIndex(entity.id);
  }

  /** Retrieve by ID. Returns undefined if not found. */
  public getById(id: string): T | undefined {
    const key = entityKey(this.entityType, id);
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  }

  /** Load all entities matching a predicate. */
  protected listWhere(predicate: (entity: T) => boolean): T[] {
    const ids = this.getIndex();
    const results: T[] = [];
    for (const id of ids) {
      const entity = this.getById(id);
      if (entity && predicate(entity)) {
        results.push(entity);
      }
    }
    return results;
  }

  /** Load all stored entities. */
  protected listAll(): T[] {
    const ids = this.getIndex();
    const results: T[] = [];
    for (const id of ids) {
      const entity = this.getById(id);
      if (entity) results.push(entity);
    }
    return results;
  }

  /** Add an ID to the index. */
  private addToIndex(id: string): void {
    const ids = this.getIndex();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(indexKey(this.entityType), JSON.stringify(ids));
    }
  }

  /** Get all tracked IDs for this entity type. */
  private getIndex(): string[] {
    const raw = localStorage.getItem(indexKey(this.entityType));
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  }
}
