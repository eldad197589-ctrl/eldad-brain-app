// ==========================================
// FILE: work-spine-types.ts
// PURPOSE: Core domain models for the Today Work Spine.
// ==========================================

export type WorkItemId = string;
export type WorkDomainType = 'ACCOUNTING_CORE' | 'WAR_COMPENSATION' | 'ONBOARDING' | 'PERSONAL' | 'GENERAL';

export enum WorkItemStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  WAITING_INTERNAL = 'WAITING_INTERNAL',
  WAITING_EXTERNAL = 'WAITING_EXTERNAL',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export type SourceChannel = 'email' | 'drive' | 'whatsapp' | 'scan' | 'manual' | 'portal' | 'local_folder';

export type SourceKind = 'person' | 'client' | 'authority' | 'lawyer' | 'supplier' | 'bank' | 'internal' | 'unknown';

export type RequestType = 'task' | 'work_item' | 'case_document' | 'review_request' | 'agreement_review' | 'evidence' | 'archive' | 'unknown' | 'client_onboarding';


export interface WorkItemRecord {
  id: WorkItemId;
  domain_type: WorkDomainType;
  client_id?: string;
  subject_id?: string;
  case_id?: string;
  title: string;
  next_action_description: string;
  status: WorkItemStatus;
  created_at: string;
  updated_at: string;
  /** URL מקור חיצוני (Gmail, Drive, או מערכת אחרת) — לשימוש עתידי */
  source_url?: string;
  senderName?: string;
  sourceLabel?: string;
  sourceKind?: SourceKind;
  requestType?: RequestType;
  linkedDocumentId?: string;
}

export interface WorkItemTransitionPayload {
  work_item_id: WorkItemId;
  new_status: WorkItemStatus;
  reason_for_transition: string;
  actor_id: string;
}

export interface WorkItemUpdateNextActionPayload {
  work_item_id: WorkItemId;
  next_action_description: string;
  reason_for_update: string;
  actor_id: string;
}
