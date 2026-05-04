/* ==== FILE: src/work-spine/knowledge-inventory/brain-knowledge-inventory-types.ts ==== */

// #region Constants
/** Safety marker for static Brain knowledge inventory records. */
export const BRAIN_KNOWLEDGE_INVENTORY_SAFETY_STATUS = 'static_inventory_only';

/** Domains represented in the Phase 1 Brain knowledge inventory. */
export const KNOWLEDGE_DOMAINS = [
  'brain_governance',
  'manual_workbench',
  'vat_evidence',
  'scanned_intake',
  'case_work',
  'wage_rights',
  'payroll_attendance',
  'business_planning',
  'war_compensation',
] as const;

/** Static source categories for Brain knowledge inventory records. */
export const KNOWLEDGE_SOURCE_TYPES = [
  'commit_chain',
  'static_seed',
  'route',
  'case_context',
  'business_plan_context',
  'known_project_context',
  'static_artifact',
] as const;

/**
 * Evidence maturity levels for inventory records.
 *
 * committed_static means a static historical summary was committed to inventory;
 * it is not approved or binding professional knowledge.
 * partial_static means incomplete static context only.
 * known_context_only means non-evidence, non-authoritative context only.
 */
export const EVIDENCE_STATUSES = ['committed_static', 'partial_static', 'known_context_only'] as const;

/** Confidence levels for inventory records. */
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;

/** Safe next uses for inventory records. */
export const NEXT_SAFE_USES = [
  'preview_reference_only',
  'manual_workbench_hint',
  'approval_gate_context',
  'learning_queue_candidate',
] as const;

/** Actions that remain blocked by the static inventory boundary. */
export const BLOCKED_ACTIONS = [
  'execute',
  'submit',
  'send',
  'post',
  'file',
  'create_operational_record',
  'create_work_item',
  'create_matter',
  'create_document_ref',
  'persist',
  'provider_action',
  'file_operation',
  'rag_write',
  'knowledge_binding',
  'agent_autonomy',
] as const;
// #endregion

// #region Types
/** Domain represented by a Brain knowledge inventory record. */
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

/** Static source category for a Brain knowledge inventory record. */
export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];

/** Evidence maturity level for a Brain knowledge inventory record. */
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

/** Confidence level for a Brain knowledge inventory record. */
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

/** Safe next use for a Brain knowledge inventory record. */
export type NextSafeUse = (typeof NEXT_SAFE_USES)[number];

/** Blocked action marker for a Brain knowledge inventory record. */
export type BlockedAction = (typeof BLOCKED_ACTIONS)[number];

/** Safety status assigned to static Brain knowledge inventory records. */
export type BrainKnowledgeInventorySafetyStatus = typeof BRAIN_KNOWLEDGE_INVENTORY_SAFETY_STATUS;
// #endregion

// #region Interfaces
/** A static inventory record describing knowledge already known to the Brain. */
export interface BrainKnowledgeInventoryRecord {
  /** Stable knowledge identifier. */
  knowledgeId: string;
  /** Human-readable knowledge title. */
  title: string;
  /** Professional or governance domain. */
  domain: KnowledgeDomain;
  /** Project or case label when known. */
  projectOrMatter: string | null;
  /** Static source category. */
  sourceType: KnowledgeSourceType;
  /** Static source location label. */
  sourceLocation: string;
  /** Concise summary of what was learned. */
  whatWasLearned: string;
  /** Safe preview uses for this knowledge. */
  usableFor: readonly string[];
  /** Marker proving the record is preview-only. */
  previewOnly: true;
  /** Marker proving the record comes from static inventory only. */
  staticOnly: true;
  /** Marker proving this record is not binding knowledge. */
  bindingKnowledge: false;
  /** Marker proving this record cannot execute anything. */
  canExecute: false;
  /** Marker proving this record cannot persist anything. */
  canPersist: false;
  /** Evidence maturity status. */
  evidenceStatus: EvidenceStatus;
  /** Confidence level for this inventory entry. */
  confidence: ConfidenceLevel;
  /** Next safe use without live action. */
  nextSafeUse: NextSafeUse;
  /** Actions still blocked for this knowledge. */
  blockedActions: readonly BlockedAction[];
  /** Related committed anchors when available. */
  relatedCommits: readonly string[];
  /** Related local routes when available. */
  relatedRoutes: readonly string[];
  /** Static trace for why this record exists. */
  sourceTrace: string;
  /** Safety marker proving this is inventory only. */
  safetyStatus: BrainKnowledgeInventorySafetyStatus;
}
// #endregion
