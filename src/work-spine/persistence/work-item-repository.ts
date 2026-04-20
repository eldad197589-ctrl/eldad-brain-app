// ==========================================
// FILE: work-item-repository.ts
// PURPOSE: Interface for WorkItem persistence.
// ==========================================

import { WorkItemRecord, WorkItemStatus, WorkItemId } from '../types/work-spine-types';

export interface IWorkItemRepository {
  create(item: WorkItemRecord): void;
  getById(id: WorkItemId): WorkItemRecord | undefined;
  listAll(): WorkItemRecord[];
  update(item: WorkItemRecord): void;
  listByStatus(status: WorkItemStatus): WorkItemRecord[];
}
