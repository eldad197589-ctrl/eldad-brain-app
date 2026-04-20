// ==========================================
// FILE: file-based-work-item-repository.ts
// PURPOSE: LocalStorage implementation simulating file-based persistence for WorkItems.
// ==========================================

import { IWorkItemRepository } from './work-item-repository';
import { WorkItemRecord, WorkItemId, WorkItemStatus } from '../types/work-spine-types';

const PREFIX = 'work_spine/work_item/';
const INDEX_KEY = 'work_spine/work_item/__index__';

export class FileBasedWorkItemRepository implements IWorkItemRepository {
  public create(item: WorkItemRecord): void {
    const key = `${PREFIX}${item.id}`;
    if (localStorage.getItem(key)) {
      throw new Error(`WorkItem with ID ${item.id} already exists.`);
    }
    
    // Validate required fields
    if (!item.id || !item.domain_type || !item.title || !item.status) {
      throw new Error('Cannot create WorkItem: missing required fundamental fields.');
    }

    localStorage.setItem(key, JSON.stringify(item));
    
    const index = this.getIndex();
    if (!index.includes(item.id)) {
      index.push(item.id);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    }
  }

  public getById(id: WorkItemId): WorkItemRecord | undefined {
    const key = `${PREFIX}${id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as WorkItemRecord;
  }

  public listAll(): WorkItemRecord[] {
    return this.getIndex()
      .map(id => this.getById(id))
      .filter((item): item is WorkItemRecord => item !== undefined);
  }

  public update(item: WorkItemRecord): void {
    const key = `${PREFIX}${item.id}`;
    if (!localStorage.getItem(key)) {
      throw new Error(`WorkItem with ID ${item.id} not found.`);
    }
    localStorage.setItem(key, JSON.stringify(item));
  }

  public listByStatus(status: WorkItemStatus): WorkItemRecord[] {
    return this.listAll().filter(item => item.status === status);
  }

  private getIndex(): string[] {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
