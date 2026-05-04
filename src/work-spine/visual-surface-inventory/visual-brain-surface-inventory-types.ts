/* ==== FILE: src/work-spine/visual-surface-inventory/visual-brain-surface-inventory-types.ts ==== */

// #region Constants
/** Hebrew label for the Visual Brain Surface Inventory. */
export const VISUAL_BRAIN_SURFACE_INVENTORY_LABEL = 'מלאי משטחי מוח חזותיים';

/** Classifications for visual/code surface records. */
export const VISUAL_SURFACE_CLASSIFICATIONS = [
  'static_visual',
  'preview_only',
  'live_mutation_capable',
  'unknown_needs_audit',
] as const;

/** Surface categories represented by the visual inventory. */
export const VISUAL_SURFACE_TYPES = [
  'dashboard_surface',
  'router_surface',
  'flow_surface',
  'business_visual_surface',
  'internal_preview_surface',
  'ops_surface',
  'navigation_surface',
  'case_surface',
  'tool_surface',
  'board_surface',
  'settings_surface',
  'workspace_surface',
] as const;

/** Audit states for visual inventory records. */
export const VISUAL_SURFACE_AUDIT_STATUSES = [
  'not_audited',
  'visual_presence_mapped',
  'requires_targeted_audit',
] as const;

/** Proof states for visual inventory records. */
export const VISUAL_SURFACE_PROOF_STATUSES = [
  'visual_presence_only',
  'preview_presence_only',
  'needs_visual_proof',
] as const;

/** Actions blocked by the visual inventory boundary. */
export const VISUAL_SURFACE_BLOCKED_ACTIONS = [
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
/** Classification assigned to a visual/code surface. */
export type VisualSurfaceClassification = (typeof VISUAL_SURFACE_CLASSIFICATIONS)[number];

/** Category assigned to a visual/code surface. */
export type VisualSurfaceType = (typeof VISUAL_SURFACE_TYPES)[number];

/** Audit status assigned to a visual/code surface. */
export type VisualSurfaceAuditStatus = (typeof VISUAL_SURFACE_AUDIT_STATUSES)[number];

/** Proof status assigned to a visual/code surface. */
export type VisualSurfaceProofOfLifeStatus = (typeof VISUAL_SURFACE_PROOF_STATUSES)[number];

/** Blocked action marker for a visual/code surface. */
export type VisualSurfaceBlockedAction = (typeof VISUAL_SURFACE_BLOCKED_ACTIONS)[number];
// #endregion

// #region Interfaces
/** Static record describing the visual presence of one Brain surface. */
export interface VisualBrainSurfaceInventoryRecord {
  /** Stable surface identifier. */
  surfaceId: string;
  /** Human-readable surface label. */
  label: string;
  /** Static route or code location pointer. */
  routeOrPath: string;
  /** Category of visual/code surface. */
  surfaceType: VisualSurfaceType;
  /** Marker proving this record maps visual presence only. */
  visualPresenceOnly: true;
  /** Conservative classification for this visual/code surface. */
  classification: VisualSurfaceClassification;
  /** Why the classification was assigned. */
  classificationReason: string;
  /** Whether the surface has been audited. */
  audited: boolean;
  /** Current audit status. */
  auditStatus: VisualSurfaceAuditStatus;
  /** Current proof-of-life status. */
  proofOfLifeStatus: VisualSurfaceProofOfLifeStatus;
  /** Whether the surface may change local app state. */
  mutationCapable: boolean;
  /** Whether the surface may expose live connector behavior. */
  liveProviderCapable: boolean;
  /** Whether the surface may retain user/app state. */
  persistenceCapable: boolean;
  /** Whether the surface may expose document or export behavior. */
  fileOperationCapable: boolean;
  /** Whether the surface may expose object-creation behavior. */
  operationalCreationCapable: boolean;
  /** Actions blocked by this static inventory record. */
  blockedActions: readonly VisualSurfaceBlockedAction[];
  /** Whether a targeted audit is required before use beyond visual inventory. */
  requiredAuditBeforeUse: boolean;
  /** Known risks from visual/code presence only. */
  knownRisks: readonly string[];
  /** Inferences that must not be made from this visual inventory record. */
  mustNotInfer: readonly string[];
}
// #endregion
