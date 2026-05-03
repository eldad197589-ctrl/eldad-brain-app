/* ====
   FILE: full-brain-blueprint-seed.ts
   PURPOSE: Static Stage 20 full operational brain blueprint fixtures.
   DEPENDENCIES: Stage 20 full brain blueprint contracts
   EXPORTS: Stage 20 blueprint fixture objects
   ==== */

// #region Imports
import {
  BLOCKED_CAPABILITY_NAMES,
  BRAIN_BLUEPRINT_LAYERS,
  COMPLETED_SAFE_STAGE_REFS,
  FUTURE_LIVE_GATE_NAMES,
  STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
} from './full-brain-blueprint-types';
import type {
  BlockedCapabilityRegistry,
  BrainCapabilityMap,
  BrainLayerMap,
  BrainStageCompletionMap,
  ControlledLiveTransitionPlan,
  FullOperationalBrainSnapshot,
  FutureLiveGateMap,
  ManualPreviewWorkbenchPlan,
} from './full-brain-blueprint-types';
// #endregion

// #region Layer And Capability Maps
/** Static Stage 20 layer map covering every required brain layer. */
export const FULL_BRAIN_LAYER_MAP: BrainLayerMap = {
  mapId: 'stage20-full-brain-layer-map',
  layers: [
    { layer: 'Intake', stageRefs: [6], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Routing', stageRefs: [6, 7], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Approval', stageRefs: [7, 12], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Operational', stageRefs: [8], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Policy', stageRefs: [9], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Output', stageRefs: [10], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Workflow', stageRefs: [11], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'QC', stageRefs: [12], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Evidence', stageRefs: [13], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Learning', stageRefs: [14], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'CEO View', stageRefs: [15], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Execution', stageRefs: [16], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Daily Ops', stageRefs: [17], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Domains', stageRefs: [18], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
    { layer: 'Agents', stageRefs: [16, 20], status: 'covered_static_preview', implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL },
  ],
};

/** Static Stage 20 capability map for completed safe preview capabilities. */
export const FULL_BRAIN_CAPABILITY_MAP: BrainCapabilityMap = {
  mapId: 'stage20-full-brain-capability-map',
  capabilities: BRAIN_BLUEPRINT_LAYERS.map((layer) => ({
    capabilityId: `stage20-capability-${layer.toLowerCase().replace(/ /g, '-')}`,
    layer,
    label: `${layer} static preview capability`,
    stageRefs: FULL_BRAIN_LAYER_MAP.layers.find((entry) => entry.layer === layer)?.stageRefs ?? [20],
    implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
    completed: true,
    liveUseBlocked: true,
  })),
};
// #endregion

// #region Completion And Blocked Maps
/** Static safe stage completion map represented by the Stage 20 blueprint. */
export const FULL_BRAIN_STAGE_COMPLETION_MAP: BrainStageCompletionMap = {
  mapId: 'stage20-safe-stage-completion-map',
  stageCompletions: [
    ...COMPLETED_SAFE_STAGE_REFS.map((stageRef) => ({
      stageRef,
      label: `Stage ${stageRef} safe static preview`,
      completionState: 'completed_safe_static' as const,
      implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
    })),
    {
      stageRef: 20,
      label: 'Stage 20 full operational brain blueprint',
      completionState: 'current_blueprint_static',
      implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
    },
  ],
};

/** Static blocked capability registry for Stage 20. */
export const FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY: BlockedCapabilityRegistry = {
  registryId: 'stage20-blocked-capability-registry',
  blockedCapabilities: [
    { capabilityName: 'Live provider connections', futureGateRequired: 'Live Gmail Read-Only', relatedFutureGates: ['Live Drive Read-Only', 'Live Scan Manifest'], blockedNow: true },
    { capabilityName: 'Persistent state', futureGateRequired: 'Store Persistence', relatedFutureGates: [], blockedNow: true },
    { capabilityName: 'Operational record creation', futureGateRequired: 'Store Persistence', relatedFutureGates: ['External Actions'], blockedNow: true },
    { capabilityName: 'File operations', futureGateRequired: 'File Operations', relatedFutureGates: [], blockedNow: true },
    { capabilityName: 'External actions', futureGateRequired: 'External Actions', relatedFutureGates: ['Output Generation'], blockedNow: true },
    { capabilityName: 'Autonomous agent execution', futureGateRequired: 'Agent Autonomy', relatedFutureGates: ['External Actions'], blockedNow: true },
  ],
};

/** Static future live gate map for Stage 20. */
export const FULL_BRAIN_FUTURE_LIVE_GATE_MAP: FutureLiveGateMap = {
  mapId: 'stage20-future-live-gate-map',
  gates: FUTURE_LIVE_GATE_NAMES.map((gateName) => ({
    gateName,
    agentAApprovalRequired: true,
    implementationAllowedNow: false,
    canEnableLiveOperationNow: false,
  })),
};
// #endregion

// #region Transition And Workbench Plans
/** Static controlled live transition plan for future gates only. */
export const CONTROLLED_LIVE_TRANSITION_PLAN: ControlledLiveTransitionPlan = {
  planId: 'stage20-controlled-live-transition-plan',
  steps: [
    { stepId: 'manual-preview-workbench-first', label: 'Manual Preview Workbench', requiredFutureGates: [], liveOperationBlockedInStage20: true },
    { stepId: 'read-only-provider-metadata', label: 'Read-only provider metadata review', requiredFutureGates: ['Live Gmail Read-Only', 'Live Drive Read-Only', 'Live Scan Manifest'], liveOperationBlockedInStage20: true },
    { stepId: 'controlled-live-writes-later', label: 'Controlled live writes after gates', requiredFutureGates: ['Store Persistence', 'File Operations', 'External Actions', 'Agent Autonomy'], liveOperationBlockedInStage20: true },
  ],
  productionOrchestrationEnabled: false,
};

/** Static Manual Preview Workbench plan for first post-20 usable mode. */
export const MANUAL_PREVIEW_WORKBENCH_PLAN: ManualPreviewWorkbenchPlan = {
  planId: 'stage20-manual-preview-workbench-plan',
  modeName: 'Manual Preview Workbench',
  firstPost20UsableMode: true,
  previewOnly: true,
  readOnly: true,
  enablesLiveOperations: false,
  enablesExecution: false,
};
// #endregion

// #region Snapshot
/** Static full operational brain snapshot for Stage 20. */
export const FULL_OPERATIONAL_BRAIN_SNAPSHOT: FullOperationalBrainSnapshot = {
  snapshotId: 'stage20-full-operational-brain-snapshot',
  generatedAt: '2026-05-04T00:00:00.000Z',
  blueprintVersion: 'stage20-static-blueprint-v1',
  layerMap: FULL_BRAIN_LAYER_MAP,
  capabilityMap: FULL_BRAIN_CAPABILITY_MAP,
  stageCompletionMap: FULL_BRAIN_STAGE_COMPLETION_MAP,
  blockedCapabilityRegistry: FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY,
  futureLiveGateMap: FULL_BRAIN_FUTURE_LIVE_GATE_MAP,
  controlledLiveTransitionPlan: CONTROLLED_LIVE_TRANSITION_PLAN,
  manualPreviewWorkbenchPlan: MANUAL_PREVIEW_WORKBENCH_PLAN,
  implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
  operationalRuntimeEnabled: false,
};

/** Required Stage 20 blocked capability names for direct fixture validation. */
export const FULL_BRAIN_REQUIRED_BLOCKED_CAPABILITY_NAMES = BLOCKED_CAPABILITY_NAMES;
// #endregion
