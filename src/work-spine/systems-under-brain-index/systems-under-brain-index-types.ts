/* ==== FILE: src/work-spine/systems-under-brain-index/systems-under-brain-index-types.ts ==== */

// #region Constants
/** Safety marker for Stage 18E label-only systems-under-brain rows. */
export const SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS = 'systems_under_brain_label_only_static_index';

/** Gate required before any use beyond label-only display. */
export const SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE = 'agent_a_gate_before_system_area_access';

/** Label-only system areas represented by the Stage 18E skeleton. */
export const SYSTEMS_UNDER_BRAIN_INDEX_AREAS = [
  'work_spine_providers',
  'work_spine_intake',
  'work_spine_projection',
  'work_spine_read_model',
  'work_spine_runtime',
  'work_spine_use_cases',
  'accounting_core',
  'services',
  'store',
] as const;

/** Actions blocked by the Stage 18E label-only boundary. */
export const SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS = [
  'code_body_access_blocked',
  'runtime_invocation_blocked',
  'provider_access_blocked',
  'store_access_blocked',
  'database_access_blocked',
  'ui_integration_blocked',
  'operational_object_blocked',
  'state_write_blocked',
  'stage_19_behavior_blocked',
] as const;
// #endregion

// #region Types
/** Label-only system area represented by a systems-under-brain index row. */
export type SystemsUnderBrainIndexArea = (typeof SYSTEMS_UNDER_BRAIN_INDEX_AREAS)[number];

/** Blocked action marker for a systems-under-brain index row. */
export type SystemsUnderBrainIndexBlockedAction = (typeof SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS)[number];

/** Safety status assigned to Stage 18E systems-under-brain index rows. */
export type SystemsUnderBrainIndexSafetyStatus = typeof SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS;

/** Gate marker required before non-label access to a system area. */
export type SystemsUnderBrainIndexRequiredGate = typeof SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE;
// #endregion

// #region Interfaces
/** Static label-only row describing one system area under the Brain. */
export interface SystemsUnderBrainIndexRow {
  /** Stable source identifier. */
  sourceId: string;
  /** Display label copied from known folder names only. */
  label: string;
  /** Static location hint; not used for runtime access. */
  locationHint: string;
  /** Label-only system area bucket. */
  systemArea: SystemsUnderBrainIndexArea;
  /** Marker proving the row contains labels only. */
  labelOnly: true;
  /** Marker proving the row is static only. */
  staticOnly: true;
  /** Marker proving the row is an index only. */
  indexOnly: true;
  /** Marker proving only file or folder names are represented. */
  fileNamesOnly: true;
  /** Marker proving contents were not read. */
  contentRead: false;
  /** Marker proving no runtime was invoked. */
  runtimeInvoked: false;
  /** Marker proving no provider was connected. */
  providerConnected: false;
  /** Marker proving the system area is not operationally ready. */
  operationalReady: false;
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
  /** Actions blocked for this label-only system row. */
  blockedActions: readonly SystemsUnderBrainIndexBlockedAction[];
  /** Gate required before any use beyond label display. */
  requiredGateBeforeUse: SystemsUnderBrainIndexRequiredGate;
  /** Safety marker proving this is a static index only. */
  safetyStatus: SystemsUnderBrainIndexSafetyStatus;
}
// #endregion
