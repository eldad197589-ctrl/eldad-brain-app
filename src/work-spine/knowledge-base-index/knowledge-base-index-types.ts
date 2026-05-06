/* ==== FILE: src/work-spine/knowledge-base-index/knowledge-base-index-types.ts ==== */

// #region Constants
/** Safety marker for Stage 18B label-only Knowledge_Base rows. */
export const KNOWLEDGE_BASE_INDEX_SAFETY_STATUS = 'knowledge_base_label_only_static_index';

/** Gate required before any use beyond label-only display. */
export const KNOWLEDGE_BASE_INDEX_REQUIRED_GATE = 'agent_a_gate_before_any_content_access';

/** Label-only domains represented by the Stage 18B Knowledge_Base skeleton. */
export const KNOWLEDGE_BASE_INDEX_DOMAINS = [
  'knowledge_base',
  'tax',
  'income_tax',
  'income_tax_section_102_102a',
  'vat',
  'vat_maven_reconciliation',
  'vat_maven_reconciliation_batch',
  'vat_maven_training',
] as const;

/** Actions blocked by the Stage 18B label-only boundary. */
export const KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS = [
  'runtime_folder_access_blocked',
  'content_use_blocked',
  'content_mining_blocked',
  'ocr_blocked',
  'provider_connection_blocked',
  'professional_conclusion_blocked',
  'client_evidence_use_blocked',
  'operational_object_creation_blocked',
  'state_write_blocked',
  'runtime_action_blocked',
] as const;
// #endregion

// #region Types
/** Label-only domain represented by a Knowledge_Base index row. */
export type KnowledgeBaseIndexDomain = (typeof KNOWLEDGE_BASE_INDEX_DOMAINS)[number];

/** Blocked action marker for a Knowledge_Base index row. */
export type KnowledgeBaseIndexBlockedAction = (typeof KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS)[number];

/** Safety status assigned to Stage 18B Knowledge_Base index rows. */
export type KnowledgeBaseIndexSafetyStatus = typeof KNOWLEDGE_BASE_INDEX_SAFETY_STATUS;

/** Gate marker required before non-label access to a Knowledge_Base source. */
export type KnowledgeBaseIndexRequiredGate = typeof KNOWLEDGE_BASE_INDEX_REQUIRED_GATE;
// #endregion

// #region Interfaces
/** Static label-only row describing one Knowledge_Base location. */
export interface KnowledgeBaseIndexRow {
  /** Stable source identifier. */
  sourceId: string;
  /** Display label copied from the folder name only. */
  label: string;
  /** Static location hint; not used for runtime access. */
  locationHint: string;
  /** Parent source row identifier, when the row is nested. */
  parentSourceId: string | null;
  /** Label-only domain bucket. */
  domain: KnowledgeBaseIndexDomain;
  /** Nesting depth from the Knowledge_Base root. */
  depth: number;
  /** Marker proving the row contains labels only. */
  labelOnly: true;
  /** Marker proving the row is static only. */
  staticOnly: true;
  /** Marker proving content was not read. */
  contentRead: false;
  /** Marker proving folders are not read at runtime. */
  folderRead: false;
  /** Marker proving content was not mined. */
  contentMined: false;
  /** Marker proving OCR was not performed. */
  ocrPerformed: false;
  /** Marker proving no provider was connected. */
  providerConnected: false;
  /** Marker proving no professional conclusion was made. */
  professionalConclusion: false;
  /** Marker proving this is not client evidence. */
  clientEvidence: false;
  /** Marker proving the source is not verified. */
  sourceVerified: false;
  /** Marker proving no work item can be created. */
  canCreateWorkItem: false;
  /** Marker proving no matter can be created. */
  canCreateMatter: false;
  /** Marker proving no document reference can be created. */
  canCreateDocumentRef: false;
  /** Marker proving the row cannot persist. */
  canPersist: false;
  /** Marker proving the row cannot act. */
  canAct: false;
  /** Actions blocked for this label-only source row. */
  blockedActions: readonly KnowledgeBaseIndexBlockedAction[];
  /** Gate required before any access beyond label display. */
  requiredGateBeforeAccess: KnowledgeBaseIndexRequiredGate;
  /** Safety marker proving this is a static index only. */
  safetyStatus: KnowledgeBaseIndexSafetyStatus;
}
// #endregion
