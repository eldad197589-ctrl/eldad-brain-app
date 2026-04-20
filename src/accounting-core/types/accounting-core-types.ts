// ==========================================
// FILE: accounting-core-types.ts
// PURPOSE: Shared Domain Types & Interfaces for the Accounting Core Backend.
// DEPENDENCIES: Standalone (Service-agnostic)
// ==========================================

// ------------------------------------------
// 1. Shared Enum Groups
// ------------------------------------------

export enum SyncStatus {
  SYNCED = 'SYNCED',
  DUPLICATE_SUSPECT = 'DUPLICATE_SUSPECT',
  UNREADABLE = 'UNREADABLE',
  BLOCKED = 'BLOCKED',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export enum IntakeStatus {
  RECEIVED = 'RECEIVED',
  DOCUMENT_IDENTIFIED = 'DOCUMENT_IDENTIFIED',
  SOURCE_LINKED = 'SOURCE_LINKED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum ExtractionStatus {
  NOT_STARTED = 'NOT_STARTED',
  PARTIAL = 'PARTIAL',
  EXTRACTED = 'EXTRACTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  UNREADABLE = 'UNREADABLE'
}

export enum ClassificationStatus {
  NOT_CLASSIFIED = 'NOT_CLASSIFIED',
  AUTO_CLASSIFIED = 'AUTO_CLASSIFIED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum ResolutionStatus {
  VERIFIED_CLASSIFICATION = 'VERIFIED_CLASSIFICATION',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum MappingStatus {
  LINKED = 'LINKED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum DerivedViewStatus {
  GENERATED = 'GENERATED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum AuditTraceStatus {
  RECORDED = 'RECORDED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  BLOCKED = 'BLOCKED'
}

export enum DocumentTypeHint {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  STATEMENT = 'STATEMENT',
  MIXED = 'MIXED',
  UNKNOWN = 'UNKNOWN'
}

// ------------------------------------------
// 2. Core Shared Entities / Interfaces
// ------------------------------------------

export interface FolderSyncBatch {
  id: string;
  source_machine_reference: string;
  root_path: string;
  client_folder_path: string;
  timestamp: string;
}

export interface SyncedFileRecord {
  id: string;
  sync_batch_id: string;
  file_hash: string;
  source_path: string;
  detected_client_hint?: string;
  detected_period_hint?: string;
  sync_status: SyncStatus;
}

export interface DocumentIntakeEntity {
  id: string;
  synced_file_record_id: string; // source trace linkage
  detected_document_type: DocumentTypeHint;
  document_identification_confidence: number;
  source_link_candidate?: string;
  intake_status: IntakeStatus;
  review_reason_if_needed?: string;
}

export interface ExtractedFieldSet {
  id: string;
  document_intake_id: string; // source trace linkage
  document_number_if_exists?: string;
  issue_date?: string;
  supplier_name_if_exists?: string;
  supplier_id_if_exists?: string;
  customer_name_if_exists?: string;
  customer_id_if_exists?: string;
  gross_amount_if_exists?: number;
  vat_amount_if_exists?: number;
  net_amount_if_exists?: number;
  currency?: string;
  period_hint_if_exists?: string;
  document_type?: DocumentTypeHint;
  extraction_confidence: number;
  extraction_status: ExtractionStatus;
  contradiction_flags_if_any?: string[];
  unreadable_reason_if_any?: string;
}

export interface ClassificationResult {
  id: string;
  document_intake_id: string; // source trace linkage
  extracted_field_set_id: string;
  client_id: string;
  accounting_period_id: string;
  proposed_accounting_component: string;
  classification_confidence: number;
  classification_status: ClassificationStatus;
  review_reason_if_needed?: string;
  contradiction_flags_if_any?: string[];
}

export interface ResolutionResult {
  id: string;
  classification_result_id: string; // source trace linkage
  final_resolution_status: ResolutionStatus;
  final_accounting_component_if_verified?: string;
  override_applied_yes_no: boolean;
  reusable_rule_participated_yes_no: boolean;
  audit_trace_id: string; // audit trace linkage
  resolution_reason?: string;
}

export interface ClientCaseMapping {
  id: string;
  resolution_result_id: string; // source trace linkage
  mapping_status: MappingStatus;
  linked_client_id: string;
  linked_accounting_period_id: string;
  linked_verified_document_id: string;
  linked_verified_classification_id: string;
  linked_accounting_component_id: string;
  mapping_reason_if_needed?: string;
}

export interface DerivedView {
  id: string;
  derived_view_type: string;
  source_record_count: number;
  derived_summary_payload: Record<string, unknown>; // analytical data container only
  derived_view_status: DerivedViewStatus;
  traceability_index_reference: string; // traceback
  client_id: string;
  accounting_period_id: string;
}

export interface ImmutableAuditTraceRecord {
  id: string; // globally unique trace ID
  actor_id: string;
  service_name: string;
  target_object_type: string;
  target_object_id: string;
  prior_state_if_any?: string;
  new_state: string;
  reason: string;
  timestamp: string;
  related_client_if_any?: string;
  related_accounting_period_if_any?: string;
  related_batch_or_run_id_if_any?: string; // batch trace linkage
  trace_status: AuditTraceStatus;
  trace_link_reference?: string;
}
