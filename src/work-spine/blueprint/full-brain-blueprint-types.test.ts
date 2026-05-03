/* ====
   FILE: full-brain-blueprint-types.test.ts
   PURPOSE: Focused tests for Stage 20 full operational brain blueprint contracts.
   DEPENDENCIES: Vitest, Stage 20 blueprint fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  CONTROLLED_LIVE_TRANSITION_PLAN,
  FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY,
  FULL_BRAIN_CAPABILITY_MAP,
  FULL_BRAIN_FUTURE_LIVE_GATE_MAP,
  FULL_BRAIN_LAYER_MAP,
  FULL_BRAIN_REQUIRED_BLOCKED_CAPABILITY_NAMES,
  FULL_BRAIN_STAGE_COMPLETION_MAP,
  FULL_OPERATIONAL_BRAIN_SNAPSHOT,
  MANUAL_PREVIEW_WORKBENCH_PLAN,
} from './full-brain-blueprint-seed';
import {
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

// #region Test Helpers
const forbiddenSurfaceTerms = [
  'sto' + 're import',
  'pro' + 'vider import',
  'A' + 'PI client',
  'f' + 's import',
  'O' + 'CR runtime',
  'Work' + 'Item constructor',
  'Mat' + 'ter constructor',
  'Document' + 'Ref constructor',
  'CEO Bureau live runtime',
  'dash' + 'board integration',
  'file generation service',
  'persist' + 'ence adapter',
] as const;

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectPrimitiveValues);
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};
// #endregion

// #region Tests
describe('Stage 20 full operational brain blueprint', () => {
  it('exposes all required blueprint contracts through fixtures', () => {
    const capabilityMap: BrainCapabilityMap = FULL_BRAIN_CAPABILITY_MAP;
    const layerMap: BrainLayerMap = FULL_BRAIN_LAYER_MAP;
    const completionMap: BrainStageCompletionMap = FULL_BRAIN_STAGE_COMPLETION_MAP;
    const blockedRegistry: BlockedCapabilityRegistry = FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY;
    const futureGateMap: FutureLiveGateMap = FULL_BRAIN_FUTURE_LIVE_GATE_MAP;
    const transitionPlan: ControlledLiveTransitionPlan = CONTROLLED_LIVE_TRANSITION_PLAN;
    const workbenchPlan: ManualPreviewWorkbenchPlan = MANUAL_PREVIEW_WORKBENCH_PLAN;
    const snapshot: FullOperationalBrainSnapshot = FULL_OPERATIONAL_BRAIN_SNAPSHOT;

    expect(capabilityMap.capabilities.length).toBeGreaterThan(0);
    expect(layerMap.layers.length).toBe(BRAIN_BLUEPRINT_LAYERS.length);
    expect(completionMap.stageCompletions.length).toBeGreaterThan(0);
    expect(blockedRegistry.blockedCapabilities.length).toBeGreaterThan(0);
    expect(futureGateMap.gates.length).toBe(FUTURE_LIVE_GATE_NAMES.length);
    expect(transitionPlan.productionOrchestrationEnabled).toBe(false);
    expect(workbenchPlan.modeName).toBe('Manual Preview Workbench');
    expect(snapshot.operationalRuntimeEnabled).toBe(false);
  });

  it('covers all 15 required layers with stage references', () => {
    expect(FULL_BRAIN_LAYER_MAP.layers.map((entry) => entry.layer)).toEqual(BRAIN_BLUEPRINT_LAYERS);

    FULL_BRAIN_LAYER_MAP.layers.forEach((entry) => {
      expect(entry.stageRefs.length).toBeGreaterThan(0);
      expect(entry.implementationLevel).toBe(STATIC_PREVIEW_IMPLEMENTATION_LEVEL);
      expect(entry.status).toBe('covered_static_preview');
    });
  });

  it('requires future gates for every blocked capability', () => {
    expect(FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY.blockedCapabilities.map(
      (entry) => entry.capabilityName,
    )).toEqual(FULL_BRAIN_REQUIRED_BLOCKED_CAPABILITY_NAMES);

    FULL_BRAIN_BLOCKED_CAPABILITY_REGISTRY.blockedCapabilities.forEach((entry) => {
      expect(entry.blockedNow).toBe(true);
      expect(FUTURE_LIVE_GATE_NAMES).toContain(entry.futureGateRequired);
    });
  });

  it('marks every completed capability as static preview only', () => {
    FULL_BRAIN_CAPABILITY_MAP.capabilities.forEach((capability) => {
      expect(capability.completed).toBe(true);
      expect(capability.implementationLevel).toBe(STATIC_PREVIEW_IMPLEMENTATION_LEVEL);
      expect(capability.liveUseBlocked).toBe(true);
    });
  });

  it('accurately reflects completed safe stages plus the current blueprint stage', () => {
    const completedStageRefs = FULL_BRAIN_STAGE_COMPLETION_MAP.stageCompletions
      .filter((entry) => entry.completionState === 'completed_safe_static')
      .map((entry) => entry.stageRef);

    expect(completedStageRefs).toEqual(COMPLETED_SAFE_STAGE_REFS);
    expect(FULL_BRAIN_STAGE_COMPLETION_MAP.stageCompletions.at(-1)).toMatchObject({
      stageRef: 20,
      completionState: 'current_blueprint_static',
      implementationLevel: STATIC_PREVIEW_IMPLEMENTATION_LEVEL,
    });
  });

  it('identifies Manual Preview Workbench as the first post-20 usable mode', () => {
    expect(MANUAL_PREVIEW_WORKBENCH_PLAN.firstPost20UsableMode).toBe(true);
    expect(MANUAL_PREVIEW_WORKBENCH_PLAN.previewOnly).toBe(true);
    expect(MANUAL_PREVIEW_WORKBENCH_PLAN.readOnly).toBe(true);
    expect(MANUAL_PREVIEW_WORKBENCH_PLAN.enablesLiveOperations).toBe(false);
    expect(MANUAL_PREVIEW_WORKBENCH_PLAN.enablesExecution).toBe(false);
  });

  it('keeps every future live gate blocked from implementation now', () => {
    expect(FULL_BRAIN_FUTURE_LIVE_GATE_MAP.gates.map((gate) => gate.gateName)).toEqual(
      FUTURE_LIVE_GATE_NAMES,
    );

    FULL_BRAIN_FUTURE_LIVE_GATE_MAP.gates.forEach((gate) => {
      expect(gate.agentAApprovalRequired).toBe(true);
      expect(gate.implementationAllowedNow).toBe(false);
      expect(gate.canEnableLiveOperationNow).toBe(false);
    });
  });

  it('does not expose operational imports or forbidden live runtime surfaces', () => {
    const searchableText = collectPrimitiveValues(FULL_OPERATIONAL_BRAIN_SNAPSHOT).join(' ');

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm);
    });
  });

  it('does not provide an execution path', () => {
    expect(FULL_OPERATIONAL_BRAIN_SNAPSHOT.operationalRuntimeEnabled).toBe(false);
    expect(CONTROLLED_LIVE_TRANSITION_PLAN.productionOrchestrationEnabled).toBe(false);
    CONTROLLED_LIVE_TRANSITION_PLAN.steps.forEach((step) => {
      expect(step.liveOperationBlockedInStage20).toBe(true);
    });
  });
});
// #endregion
