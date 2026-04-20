// ==========================================
// FILE: local-persistence-paths.ts
// PURPOSE: Path helpers and storage key conventions for local durable persistence.
// DEPENDENCIES: None (pure utility)
// ==========================================

/**
 * Storage key namespace for the accounting core persistence layer.
 * All keys follow the pattern: accore/{entity_type}/{id}
 * Collection indexes use: accore/{entity_type}/__index__
 *
 * This module provides a unified key convention for any local storage backend
 * (localStorage, IndexedDB, or future file-system adapters).
 */

const NAMESPACE = 'accore';

/** @returns Storage key for a single entity by type and ID */
export function entityKey(entityType: string, id: string): string {
  return `${NAMESPACE}/${entityType}/${id}`;
}

/** @returns Storage key for the entity index (list of all IDs for a type) */
export function indexKey(entityType: string): string {
  return `${NAMESPACE}/${entityType}/__index__`;
}

/**
 * All entity type constants used as storage sub-namespaces.
 */
export const EntityTypes = {
  FOLDER_SYNC_BATCH: 'folder_sync_batch',
  SYNCED_FILE_RECORD: 'synced_file_record',
  DOCUMENT_INTAKE: 'document_intake',
  EXTRACTED_FIELD_SET: 'extracted_field_set',
  CLASSIFICATION_RESULT: 'classification_result',
  RESOLUTION_RESULT: 'resolution_result',
  CLIENT_CASE_MAPPING: 'client_case_mapping',
  DERIVED_VIEW: 'derived_view',
  AUDIT_TRACE: 'audit_trace'
} as const;
