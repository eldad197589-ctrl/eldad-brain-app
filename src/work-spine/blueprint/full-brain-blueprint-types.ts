/* ====
   FILE: full-brain-blueprint-types.ts
   PURPOSE: Static Stage 20 full operational brain blueprint contracts.
   DEPENDENCIES: None
   EXPORTS: Blueprint constants and interfaces
   ==== */

// #region Constants
/** Required Stage 20 blueprint layer names. */
export const BRAIN_BLUEPRINT_LAYERS = [
  'Intake',
  'Routing',
  'Approval',
  'Operational',
  'Policy',
  'Output',
  'Workflow',
  'QC',
  'Evidence',
  'Learning',
  'CEO View',
  'Execution',
  'Daily Ops',
  'Domains',
  'Agents',
] as const;

/** Implementation level allowed for completed Stage 20 capabilities. */
export const STATIC_PREVIEW_IMPLEMENTATION_LEVEL = 'static_preview_only';

/** Required blocked capabilities that cannot become live in Stage 20. */
export const BLOCKED_CAPABILITY_NAMES = [
  'Live provider connections',
  'Persistent state',
  'Operational record creation',
  'File operations',
  'External actions',
  'Autonomous agent execution',
] as const;

/** Future live gates required before blocked capabilities can be revisited. */
export const FUTURE_LIVE_GATE_NAMES = [
  'Live Gmail Read-Only',
  'Live Drive Read-Only',
  'Live Scan Manifest',
  'Store Persistence',
  'File Operations',
  'Output Generation',
  'External Actions',
  'Agent Autonomy',
] as const;

/** Safe completed stage refs represented by the Stage 20 blueprint. */
export const COMPLETED_SAFE_STAGE_REFS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
// #endregion

// #region Types
/** Required Stage 20 blueprint layer name. */
export type BrainLayerName = (typeof BRAIN_BLUEPRINT_LAYERS)[number];

/** Stage refs represented in the Stage 20 blueprint. */
export type BrainStageRef = (typeof COMPLETED_SAFE_STAGE_REFS)[number] | 20;

/** Static preview implementation level. */
export type BrainImplementationLevel = typeof STATIC_PREVIEW_IMPLEMENTATION_LEVEL;

/** Required blocked capability name. */
export type BlockedCapabilityName = (typeof BLOCKED_CAPABILITY_NAMES)[number];

/** Future live gate name. */
export type FutureLiveGateName = (typeof FUTURE_LIVE_GATE_NAMES)[number];

/** Static capability entry for a completed safe brain capability. */
export interface BrainCapabilityEntry {
  /** Stable capability id. */
  capabilityId: string;
  /** Layer that owns the capability. */
  layer: BrainLayerName;
  /** Human-readable capability label. */
  label: string;
  /** Stage refs that produced the static capability. */
  stageRefs: readonly BrainStageRef[];
  /** Completed capabilities remain static previews only. */
  implementationLevel: BrainImplementationLevel;
  /** Whether this capability is complete as a safe static preview. */
  completed: true;
  /** Whether the capability is blocked from live use. */
  liveUseBlocked: true;
}

/** Map of completed safe static capabilities by layer. */
export interface BrainCapabilityMap {
  /** Stable map id. */
  mapId: string;
  /** Completed static capability entries. */
  capabilities: readonly BrainCapabilityEntry[];
}

/** Static layer entry with stage references. */
export interface BrainLayerEntry {
  /** Required layer name. */
  layer: BrainLayerName;
  /** Source stage refs for this layer. */
  stageRefs: readonly BrainStageRef[];
  /** Static layer status. */
  status: 'covered_static_preview';
  /** Implementation level for this layer. */
  implementationLevel: BrainImplementationLevel;
}

/** Map of all Stage 20 blueprint layers. */
export interface BrainLayerMap {
  /** Stable layer map id. */
  mapId: string;
  /** Required layer entries. */
  layers: readonly BrainLayerEntry[];
}

/** Static completion entry for safe stage work. */
export interface BrainStageCompletionEntry {
  /** Stage ref. */
  stageRef: BrainStageRef;
  /** Human-readable stage label. */
  label: string;
  /** Completion state. */
  completionState: 'completed_safe_static' | 'current_blueprint_static';
  /** Implementation level for completed safe stage outputs. */
  implementationLevel: BrainImplementationLevel;
}

/** Completion map for safe preview stages represented by Stage 20. */
export interface BrainStageCompletionMap {
  /** Stable completion map id. */
  mapId: string;
  /** Static stage completion entries. */
  stageCompletions: readonly BrainStageCompletionEntry[];
}

/** Blocked capability with its required future gate. */
export interface BlockedCapabilityEntry {
  /** Required blocked capability name. */
  capabilityName: BlockedCapabilityName;
  /** Future gate that must exist before this capability can be revisited. */
  futureGateRequired: FutureLiveGateName;
  /** Additional related future gates. */
  relatedFutureGates: readonly FutureLiveGateName[];
  /** Whether the capability remains blocked now. */
  blockedNow: true;
}

/** Registry of capabilities blocked from live use. */
export interface BlockedCapabilityRegistry {
  /** Stable registry id. */
  registryId: string;
  /** Required blocked capabilities. */
  blockedCapabilities: readonly BlockedCapabilityEntry[];
}

/** Future gate entry for live transition planning. */
export interface FutureLiveGateEntry {
  /** Required future live gate name. */
  gateName: FutureLiveGateName;
  /** Required Agent A approval label. */
  agentAApprovalRequired: true;
  /** Whether Stage 20 may implement this gate now. */
  implementationAllowedNow: false;
  /** Whether this gate can enable live operation now. */
  canEnableLiveOperationNow: false;
}

/** Map of future gates that remain blocked after Stage 20. */
export interface FutureLiveGateMap {
  /** Stable future gate map id. */
  mapId: string;
  /** Future gate entries. */
  gates: readonly FutureLiveGateEntry[];
}

/** Static transition step for a later controlled-live path. */
export interface ControlledLiveTransitionStep {
  /** Stable transition step id. */
  stepId: string;
  /** Human-readable step label. */
  label: string;
  /** Required future gate refs. */
  requiredFutureGates: readonly FutureLiveGateName[];
  /** Whether live operation remains blocked in this blueprint. */
  liveOperationBlockedInStage20: true;
}

/** Static plan for controlled live transition after Stage 20. */
export interface ControlledLiveTransitionPlan {
  /** Stable transition plan id. */
  planId: string;
  /** Static transition steps. */
  steps: readonly ControlledLiveTransitionStep[];
  /** Whether production orchestration is enabled now. */
  productionOrchestrationEnabled: false;
}

/** Manual Preview Workbench plan for first post-20 usable mode. */
export interface ManualPreviewWorkbenchPlan {
  /** Stable workbench plan id. */
  planId: string;
  /** Required label. */
  modeName: 'Manual Preview Workbench';
  /** Must be the first post-20 usable mode. */
  firstPost20UsableMode: true;
  /** Workbench remains preview-only. */
  previewOnly: true;
  /** Workbench remains read-only. */
  readOnly: true;
  /** Workbench cannot enable live operations. */
  enablesLiveOperations: false;
  /** Workbench cannot execute tasks. */
  enablesExecution: false;
}

/** Static full operational brain snapshot for Stage 20 review. */
export interface FullOperationalBrainSnapshot {
  /** Stable snapshot id. */
  snapshotId: string;
  /** Blueprint generated timestamp metadata. */
  generatedAt: string;
  /** Static blueprint version label. */
  blueprintVersion: string;
  /** Layer map. */
  layerMap: BrainLayerMap;
  /** Capability map. */
  capabilityMap: BrainCapabilityMap;
  /** Safe stage completion map. */
  stageCompletionMap: BrainStageCompletionMap;
  /** Blocked capability registry. */
  blockedCapabilityRegistry: BlockedCapabilityRegistry;
  /** Future live gate map. */
  futureLiveGateMap: FutureLiveGateMap;
  /** Controlled live transition plan. */
  controlledLiveTransitionPlan: ControlledLiveTransitionPlan;
  /** Manual Preview Workbench plan. */
  manualPreviewWorkbenchPlan: ManualPreviewWorkbenchPlan;
  /** Snapshot remains static preview only. */
  implementationLevel: BrainImplementationLevel;
  /** Snapshot cannot run operationally. */
  operationalRuntimeEnabled: false;
}
// #endregion
