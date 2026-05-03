/* ====
   FILE: multi-agent-ops-types.test.ts
   PURPOSE: Focused tests for Stage 19 static multi-agent operations contracts.
   DEPENDENCIES: Vitest, Stage 19 multi-agent operations fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  STAGE19_AGENT_AUDIT_TRACES,
  STAGE19_AGENT_CAPABILITY_BOUNDARIES,
  STAGE19_AGENT_WORK_ASSIGNMENTS,
  STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT,
} from './multi-agent-ops-seed';
import {
  MULTI_AGENT_OPERATION_ROLES,
  MULTI_AGENT_TASK_MODES,
  STAGE19_STRUCTURALLY_BLOCKED_TASK_MODES,
} from './multi-agent-ops-types';
// #endregion

// #region Test Helpers
const requiredGateApproval = 'AGENT_A_STAGE19_MULTI_AGENT_OPS_APPROVED';

const blockedSurfaceTerms = [
  'set' + 'Interval',
  'set' + 'Timeout',
  'sched' + 'uler',
  'work' + 'er',
  'qu' + 'eue',
  'local' + 'Storage',
  'Supa' + 'base',
  'fet' + 'ch',
  'google' + 'apis',
  'O' + 'CR',
  'O' + 'Auth',
  'CEO' + ' Bureau',
] as const;

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectPrimitiveValues);
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};
// #endregion

// #region Tests
describe('Stage 19 multi-agent operations static contracts', () => {
  it('includes all required agent roles', () => {
    expect(STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.agentRoles).toEqual(MULTI_AGENT_OPERATION_ROLES);
  });

  it('includes all required task modes', () => {
    expect(STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.taskModes).toEqual(MULTI_AGENT_TASK_MODES);
  });

  it('keeps live execution structurally blocked', () => {
    expect(STAGE19_STRUCTURALLY_BLOCKED_TASK_MODES).toEqual(['live_execution']);
    expect(STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.structurallyBlockedModes).toContain(
      'live_execution',
    );
    expect(STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.liveOperationAllowed).toBe(false);
  });

  it('defines explicit capability boundaries for every role', () => {
    const boundaryRoles = STAGE19_AGENT_CAPABILITY_BOUNDARIES.map((boundary) => boundary.agentId);

    expect(boundaryRoles).toEqual(MULTI_AGENT_OPERATION_ROLES);
    STAGE19_AGENT_CAPABILITY_BOUNDARIES.forEach((boundary) => {
      expect(typeof boundary.canPrepareStaticContracts).toBe('boolean');
      expect(typeof boundary.canPrepareStaticFixtures).toBe('boolean');
      expect(typeof boundary.canPrepareTests).toBe('boolean');
      expect(typeof boundary.canReviewDiffs).toBe('boolean');
      expect(typeof boundary.canApproveGates).toBe('boolean');
      expect(boundary.liveExecutionBlocked).toBe(true);
      expect(boundary.structuralSurfacesBlocked).toBe(true);
    });
  });

  it('requires every fixture audit trace to reference the approved gate', () => {
    STAGE19_AGENT_AUDIT_TRACES.forEach((trace) => {
      expect(trace.gateApprovalRef).toBe(requiredGateApproval);
      expect(trace.traceId).toBeTruthy();
      expect(trace.agentId).toBeTruthy();
      expect(trace.taskId).toBeTruthy();
      expect(trace.stageId).toBe(19);
      expect(trace.timestamp).toBeTruthy();
      expect(['completed', 'blocked', 'handed_off', 'cancelled']).toContain(trace.outcome);
    });
  });

  it('enforces single-file ownership in the collision policy', () => {
    const policy = STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.collisionPolicy;

    expect(policy.singleFileOwnershipRequired).toBe(true);
    expect(policy.overlappingWriteScopesBlocked).toBe(true);
    expect(policy.declaredOwnershipRequired).toBe(true);
    expect(policy.handoffRequiredOnConflict).toBe(true);
  });

  it('blocks mixed unrelated staging in the staging policy', () => {
    const policy = STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT.stagingIsolationPolicy;

    expect(policy.approvedFilesOnly).toBe(true);
    expect(policy.mixedUnrelatedStagingBlocked).toBe(true);
    expect(policy.stagedPathsMustMatchOwnership).toBe(true);
    expect(policy.unrelatedDirtyFilesUntouched).toBe(true);
  });

  it('does not expose blocked runtime surfaces', () => {
    const searchableText = collectPrimitiveValues(STAGE19_MULTI_AGENT_OPERATION_SNAPSHOT).join(' ');

    blockedSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm);
    });
  });

  it('has no real agent execution path in assignments or traces', () => {
    STAGE19_AGENT_WORK_ASSIGNMENTS.forEach((assignment) => {
      expect(assignment.staticOnly).toBe(true);
      expect(assignment.liveExecutionBlocked).toBe(true);
    });

    STAGE19_AGENT_AUDIT_TRACES.forEach((trace) => {
      if (trace.mode === 'live_execution') {
        expect(trace.outcome).toBe('blocked');
        expect(trace.filesModified).toEqual([]);
      }
    });
  });
});
// #endregion
