/* ==== FILE: src/work-spine/gravity-source-index/gravity-source-index-types.ts ==== */

// #region Constants
/** Safety marker for Stage 18C label-only Gravity source rows. */
export const GRAVITY_SOURCE_INDEX_SAFETY_STATUS = 'gravity_source_label_only_static_index';

/** Gate required before any use beyond label-only display. */
export const GRAVITY_SOURCE_INDEX_REQUIRED_GATE = 'agent_a_gate_before_gravity_source_access';

/** Label-only source classes represented by the Stage 18C Gravity source skeleton. */
export const GRAVITY_SOURCE_INDEX_CLASSES = [
  'ingestion_vault',
  'ingestion_queue',
  'processing_queue',
  'generated_output',
  'generated_output_archive',
  'legacy_generated',
  'case_package_area',
  'case_artifact_area',
  'source_folder_label',
  'static_code_artifact',
  'legacy_build_area',
  'screenshot_artifact_area',
  'document_label_area',
  'document_batch_label',
] as const;

/** Actions blocked by the Stage 18C label-only boundary. */
export const GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS = [
  'runtime_folder_access_blocked',
  'content_access_blocked',
  'document_body_use_blocked',
  'ocr_blocked',
  'provider_access_blocked',
  'final_use_blocked',
  'evidence_use_blocked',
  'operational_object_blocked',
  'state_write_blocked',
  'runtime_action_blocked',
  'stage_19_behavior_blocked',
] as const;
// #endregion

// #region Types
/** Label-only source class represented by a Gravity source index row. */
export type GravitySourceIndexClass = (typeof GRAVITY_SOURCE_INDEX_CLASSES)[number];

/** Blocked action marker for a Gravity source index row. */
export type GravitySourceIndexBlockedAction = (typeof GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS)[number];

/** Safety status assigned to Stage 18C Gravity source index rows. */
export type GravitySourceIndexSafetyStatus = typeof GRAVITY_SOURCE_INDEX_SAFETY_STATUS;

/** Gate marker required before non-label access to a Gravity source. */
export type GravitySourceIndexRequiredGate = typeof GRAVITY_SOURCE_INDEX_REQUIRED_GATE;
// #endregion

// #region Interfaces
/** Static label-only row describing one Gravity-related source area. */
export interface GravitySourceIndexRow {
  /** Stable source identifier. */
  sourceId: string;
  /** Display label copied from known folder or area names only. */
  label: string;
  /** Static location hint; not used for runtime access. */
  locationHint: string;
  /** Parent source row identifier, when the row is nested. */
  parentSourceId: string | null;
  /** Label-only source class bucket. */
  sourceClass: GravitySourceIndexClass;
  /** Marker proving the row contains labels only. */
  labelOnly: true;
  /** Marker proving the row is static only. */
  staticOnly: true;
  /** Marker proving the row is an index only. */
  indexOnly: true;
  /** Marker proving a source audit is required before use. */
  sourceAuditRequired: true;
  /** Marker proving the row cannot be used operationally. */
  nonOperational: true;
  /** Marker proving source contents cannot be used. */
  contentUseAllowed: false;
  /** Marker proving source contents cannot be accessed through this index. */
  contentAccessAllowed: false;
  /** Marker proving OCR is not allowed. */
  ocrAllowed: false;
  /** Marker proving providers cannot be accessed. */
  providerAccessAllowed: false;
  /** Marker proving the row has no final-use authority. */
  finalUseAllowed: false;
  /** Marker proving the row has no evidence-use authority. */
  evidenceUseAllowed: false;
  /** Marker proving no operational object use is allowed. */
  operationalObjectAllowed: false;
  /** Marker proving no state write is allowed. */
  stateWriteAllowed: false;
  /** Marker proving the row cannot act. */
  canAct: false;
  /** Actions blocked for this label-only source row. */
  blockedActions: readonly GravitySourceIndexBlockedAction[];
  /** Gate required before any access beyond label display. */
  requiredGateBeforeUse: GravitySourceIndexRequiredGate;
  /** Safety marker proving this is a static index only. */
  safetyStatus: GravitySourceIndexSafetyStatus;
}
// #endregion
