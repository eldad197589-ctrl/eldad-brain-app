/* ==== FILE: src/work-spine/build-progress/brain-build-progress-console-types.ts ==== */

// #region Constants
/** Safety marker for the Brain Build Progress Console. */
export const BRAIN_BUILD_PROGRESS_SAFETY_STATUS = 'static_progress_console_only';

/** Current status values for static build checkpoints. */
export const BRAIN_BUILD_PROGRESS_STATUSES = [
  'built_and_visible',
  'built_not_visible',
  'blocked',
  'planned',
] as const;

/** Proof status values for static build checkpoints. */
export const BRAIN_BUILD_PROOF_STATUSES = [
  'static_reference_recorded',
  'visible_static_preview',
  'not_visible_as_screen',
  'blocked_by_design',
] as const;

/** Layers represented by the Brain Build Progress Console. */
export const BRAIN_BUILD_PROGRESS_LAYERS = [
  'manual_workbench',
  'static_evidence',
  'scanned_intake',
  'approval_gate',
  'knowledge_inventory',
  'proof_inventory',
  'surface_inventory',
] as const;

/** Domains represented by static build progress records. */
export const BRAIN_BUILD_PROGRESS_DOMAINS = [
  'vat',
  'scanned_evidence',
  'approval',
  'knowledge',
  'proof',
  'intake',
  'visual_surface',
] as const;

/** Surface classification labels copied as static progress context only. */
export const BRAIN_BUILD_SURFACE_CLASSIFICATIONS = [
  'static_visual',
  'preview_only',
  'live_mutation_capable',
  'unknown_needs_audit',
] as const;

/** Blocked action labels shown by the static progress console. */
export const BRAIN_BUILD_BLOCKED_ACTIONS = [
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
  'external_connection',
  'source_content_read',
  'agent_autonomy',
] as const;
// #endregion

// #region Types
/** Current status for a static build checkpoint. */
export type BrainBuildProgressStatus = (typeof BRAIN_BUILD_PROGRESS_STATUSES)[number];

/** Proof status for a static build checkpoint. */
export type BrainBuildProofStatus = (typeof BRAIN_BUILD_PROOF_STATUSES)[number];

/** Layer represented by a static build checkpoint. */
export type BrainBuildProgressLayer = (typeof BRAIN_BUILD_PROGRESS_LAYERS)[number];

/** Domain represented by a static build checkpoint. */
export type BrainBuildProgressDomain = (typeof BRAIN_BUILD_PROGRESS_DOMAINS)[number];

/** Surface classification copied into a static build checkpoint. */
export type BrainBuildSurfaceClassification = (typeof BRAIN_BUILD_SURFACE_CLASSIFICATIONS)[number];

/** Blocked action shown by the Brain Build Progress Console. */
export type BrainBuildBlockedAction = (typeof BRAIN_BUILD_BLOCKED_ACTIONS)[number];

/** Safety status assigned to static build progress records. */
export type BrainBuildProgressSafetyStatus = typeof BRAIN_BUILD_PROGRESS_SAFETY_STATUS;
// #endregion

// #region Interfaces
/** Static proof scenario for one build checkpoint. */
export interface BrainBuildProofScenario {
  /** Manual input, route, or static proof anchor. */
  input: string;
  /** Expected visible result, without claiming execution. */
  expectedVisibleResult: string;
}

/** Static record describing one build checkpoint in Eldad Brain. */
export interface BrainBuildProgressItem {
  /** Stable checkpoint identifier. */
  progressItemId: string;
  /** Human-readable checkpoint title. */
  title: string;
  /** Professional or build domain. */
  domain: BrainBuildProgressDomain;
  /** Build layer for grouping. */
  layer: BrainBuildProgressLayer;
  /** Static commit anchor. */
  relatedCommit: string;
  /** Route where Eldad can see proof, when available. */
  visibleRoute: string | null;
  /** Static proof scenario for this checkpoint. */
  proofScenario: BrainBuildProofScenario;
  /** Current static build status. */
  currentStatus: BrainBuildProgressStatus;
  /** Static proof status. */
  proofStatus: BrainBuildProofStatus;
  /** Static visual surface classification. */
  surfaceClassification: BrainBuildSurfaceClassification;
  /** What was added to the project. */
  whatWasBuilt: string;
  /** What Eldad can see on screen or in static references. */
  whatEldadCanSee: string;
  /** Boundaries still blocked for this checkpoint. */
  whatIsStillBlocked: readonly string[];
  /** Next safe step without live action. */
  nextSafeStep: string;
  /** Agent label responsible for this checkpoint. */
  responsibleAgent: string;
  /** Static safety marker. */
  safetyStatus: BrainBuildProgressSafetyStatus;
  /** Actions blocked by this progress record. */
  blockedActions: readonly BrainBuildBlockedAction[];
}
// #endregion
