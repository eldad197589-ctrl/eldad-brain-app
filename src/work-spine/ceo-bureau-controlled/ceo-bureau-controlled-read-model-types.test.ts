/* ====
   FILE: ceo-bureau-controlled-read-model-types.test.ts
   PURPOSE: Focused tests for Stage 15 controlled read-model contracts.
   DEPENDENCIES: Vitest, Stage 15 controlled read-model contracts and fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  CEO_BUREAU_CONTROLLED_BLOCKED_ACTIONS,
  CEO_BUREAU_CONTROLLED_GATE_SUMMARY,
  CEO_BUREAU_CONTROLLED_OUTPUT_PREVIEW_SUMMARY,
  CEO_BUREAU_CONTROLLED_POLICY_SUMMARY,
  CEO_BUREAU_CONTROLLED_QC_SUMMARY,
  CEO_BUREAU_CONTROLLED_READ_MODELS,
  CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS,
  CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS,
  CEO_BUREAU_CONTROLLED_SOURCE_TRACE,
} from './ceo-bureau-controlled-read-model-seed';
import {
  CEO_BUREAU_CONTROLLED_CAPABILITY_LOCKS,
  CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE,
  CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_TYPES,
  CEO_BUREAU_CONTROLLED_STAGE_REFS,
} from './ceo-bureau-controlled-read-model-types';
import type {
  CeoBureauControlledBlockedAction,
  CeoBureauControlledGateSummary,
  CeoBureauControlledReadModel,
  CeoBureauControlledSourceObjectRef,
} from './ceo-bureau-controlled-read-model-types';
// #endregion

// #region Test Helpers
const blockedCapabilityValues = {
  canCreateWorkItem: false,
  canCreateMatter: false,
  canCreateDocumentRef: false,
  canPersist: false,
  canExecuteProviderAction: false,
  canMoveFiles: false,
  canFinalizeOutput: false,
  canBypassApproval: false,
} as const;

const allowedCapabilityFieldNames = Object.keys(blockedCapabilityValues);

const forbiddenSurfaceTerms = [
  'src/pa' + 'ges/ceo-' + 'office',
  'Dash' + 'board',
  'rou' + 'tes',
  'sto' + 'res',
  'persist' + 'ence',
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'api client',
  'api key',
  'api call',
  'O' + 'Auth',
  'O' + 'CR',
  'button',
  'handler',
  'body/content',
  'run' + 'time',
] as const;

const allFixtureCollections = [
  CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS,
  CEO_BUREAU_CONTROLLED_BLOCKED_ACTIONS,
  CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS,
  CEO_BUREAU_CONTROLLED_SOURCE_TRACE,
  CEO_BUREAU_CONTROLLED_READ_MODELS,
] as const;

const collectRecordKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectRecordKeys);
  if (typeof value !== 'object' || value === null) return [];

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectRecordKeys(childValue),
  ]);
};

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectPrimitiveValues);
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};

const getFlatSourceRefValues = (sourceRef: CeoBureauControlledSourceObjectRef): unknown[] =>
  Object.values(sourceRef).flatMap((value) => (Array.isArray(value) ? value : [value]));
// #endregion

// #region Tests
describe('Stage 15 controlled read-model contracts', () => {
  it('exposes the required read-model contract and fixture source', () => {
    const readModelContract: CeoBureauControlledReadModel = CEO_BUREAU_CONTROLLED_READ_MODELS[0]!;
    const sourceObjectContract: CeoBureauControlledSourceObjectRef =
      CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS[0]!;
    const gateSummaryContract: CeoBureauControlledGateSummary =
      CEO_BUREAU_CONTROLLED_GATE_SUMMARY;
    const blockedActionContract: CeoBureauControlledBlockedAction =
      CEO_BUREAU_CONTROLLED_BLOCKED_ACTIONS[0]!;

    expect(readModelContract.fixtureSource).toBe(CEO_BUREAU_CONTROLLED_FIXTURE_SOURCE);
    expect(sourceObjectContract.referenceOnly).toBe(true);
    expect(gateSummaryContract.agentAApprovalRequired).toBe(true);
    expect(blockedActionContract.statusBadge).toBe('blocked');
  });

  it('keeps every read-model fixture preview-only and read-only', () => {
    CEO_BUREAU_CONTROLLED_READ_MODELS.forEach((readModel) => {
      expect(readModel.previewOnly).toBe(true);
      expect(readModel.readOnly).toBe(true);
      expect(readModel.snapshotAt).toBeTruthy();
    });
  });

  it('locks every mutation capability to false', () => {
    expect(CEO_BUREAU_CONTROLLED_CAPABILITY_LOCKS).toEqual(blockedCapabilityValues);

    CEO_BUREAU_CONTROLLED_READ_MODELS.forEach((readModel) => {
      expect(readModel.safetyLocks).toEqual(blockedCapabilityValues);
      allowedCapabilityFieldNames.forEach((fieldName) => {
        expect((readModel as unknown as Record<string, unknown>)[fieldName]).toBe(false);
      });
    });
  });

  it('uses source objects as shallow display-only references', () => {
    const allowedSourceObjectTypes = new Set<string>(CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_TYPES);
    const allowedStageRefs = new Set<string>(CEO_BUREAU_CONTROLLED_STAGE_REFS);

    CEO_BUREAU_CONTROLLED_SOURCE_OBJECT_REFS.forEach((sourceRef) => {
      expect(allowedSourceObjectTypes.has(sourceRef.sourceObjectType)).toBe(true);
      expect(allowedStageRefs.has(sourceRef.stageRef)).toBe(true);
      expect(sourceRef.referenceOnly).toBe(true);
      expect(sourceRef.embeddedPayloadAllowed).toBe(false);
      getFlatSourceRefValues(sourceRef).forEach((value) => {
        expect(['string', 'boolean']).toContain(typeof value);
      });
    });
  });

  it('includes required approvals and gate summaries', () => {
    expect(CEO_BUREAU_CONTROLLED_GATE_SUMMARY.requiredGateRefs).toContain(
      'agent_a_ceo_bureau_integration_gate',
    );
    expect(CEO_BUREAU_CONTROLLED_GATE_SUMMARY.agentAApprovalRequired).toBe(true);
    expect(CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS.length).toBeGreaterThan(0);

    CEO_BUREAU_CONTROLLED_REQUIRED_APPROVALS.forEach((approval) => {
      expect(approval.requiredApprovalId).toBeTruthy();
      expect(approval.requiredGateRef).toBeTruthy();
      expect(approval.storedApprovalStateAllowed).toBe(false);
    });
  });

  it('keeps QC, policy, evidence, workflow, and output summaries metadata-only', () => {
    expect(CEO_BUREAU_CONTROLLED_QC_SUMMARY.qcResultIds).toEqual([
      'stage12-qc-result-preview-001',
    ]);
    expect(CEO_BUREAU_CONTROLLED_POLICY_SUMMARY.policyClassificationIds).toEqual([
      'stage9-policy-classification-001',
    ]);
    expect(CEO_BUREAU_CONTROLLED_OUTPUT_PREVIEW_SUMMARY.generationBlocked).toBe(true);

    CEO_BUREAU_CONTROLLED_READ_MODELS.forEach((readModel) => {
      expect(readModel.evidenceSummary.metadataOnly).toBe(true);
      expect(readModel.workflowSummary.workflowMapIds.length).toBeGreaterThan(0);
      expect(readModel.outputPreviewSummary.outputPreviewIds.length).toBeGreaterThan(0);
    });
  });

  it('does not expose forbidden integration surfaces in fixture metadata', () => {
    const fixtureKeys = collectRecordKeys(allFixtureCollections).filter(
      (key) => !allowedCapabilityFieldNames.includes(key),
    );
    const fixtureValues = collectPrimitiveValues(allFixtureCollections);
    const searchableText = [...fixtureKeys, ...fixtureValues].join(' ').toLowerCase();

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm.toLowerCase());
    });
  });

  it('does not expose command, execution, or completion paths', () => {
    const fixtureValues = collectPrimitiveValues(allFixtureCollections);
    const searchableText = fixtureValues.join(' ').toLowerCase();

    expect(searchableText).not.toContain('command');
    expect(searchableText).not.toContain('execute');
    expect(searchableText).not.toContain('live content');
    expect(searchableText).not.toContain('complete output now');
  });

  it('keeps source trace entries as string ids only', () => {
    CEO_BUREAU_CONTROLLED_SOURCE_TRACE.forEach((traceEntry) => {
      expect(traceEntry.sourceTraceId).toBeTruthy();
      expect(traceEntry.statusBadge).toBeTruthy();
      traceEntry.sourceObjectIds.forEach((sourceObjectId) => {
        expect(typeof sourceObjectId).toBe('string');
      });
    });
  });
});
// #endregion
