// ==========================================
// FILE: run-create-work-item.ts
// PURPOSE: Create a new WorkItem in the NEW state.
// ==========================================

import { IWorkItemRepository } from '../persistence/work-item-repository';
import { WorkItemRecord, WorkItemId, WorkDomainType, WorkItemStatus } from '../types/work-spine-types';

export interface RunCreateWorkItemInput {
  id: WorkItemId;
  domain_type: WorkDomainType;
  client_id?: string;
  case_id?: string;
  title: string;
  next_action_description: string;
}

export class RunCreateWorkItemProcess {
  constructor(private readonly repo: IWorkItemRepository) {}

  public execute(input: RunCreateWorkItemInput): WorkItemRecord {
    const now = new Date().toISOString();
    
    const item: WorkItemRecord = {
      id: input.id,
      domain_type: input.domain_type,
      client_id: input.client_id,
      case_id: input.case_id,
      title: input.title,
      next_action_description: input.next_action_description,
      status: WorkItemStatus.NEW,
      created_at: now,
      updated_at: now
    };

    this.repo.create(item);
    return item;
  }
}
