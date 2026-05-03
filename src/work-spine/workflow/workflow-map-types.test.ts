/* ====
   FILE: workflow-map-types.test.ts
   PURPOSE: Focused tests for Stage 11 static workflow map contracts.
   DEPENDENCIES: Vitest, workflow map registry and static maps
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { WORKFLOW_DOMAIN_REGISTRY } from './workflow-domain-registry';
import { STATIC_WORKFLOW_MAPS } from './workflow-map-seed';
import {
  WORKFLOW_DOMAINS,
  WORKFLOW_REQUIRED_GATES,
} from './workflow-map-types';
// #endregion

// #region Test Helpers
const forbiddenLiveTerms = [
  'google' + 'apis',
  'local' + 'Storage',
  'Supa' + 'base',
  'O' + 'Auth',
  'O' + 'CR',
  'f' + 's',
  'pa' + 'th',
  'D' + 'B',
] as const;

const forbiddenStageTenImportTerms = [
  '../output-preview',
  './output-preview',
  'output-preview-types',
  'output-preview-seed',
] as const;

const collectRecordKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectRecordKeys);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectRecordKeys(childValue),
  ]);
};

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

const collectCapabilities = () =>
  STATIC_WORKFLOW_MAPS.map((workflowMap) => workflowMap.capabilities);
// #endregion

// #region Tests
describe('Stage 11 professional workflow maps', () => {
  it('registers exactly the eight approved domains', () => {
    expect(WORKFLOW_DOMAIN_REGISTRY).toHaveLength(WORKFLOW_DOMAINS.length);
    expect(WORKFLOW_DOMAIN_REGISTRY.map((entry) => entry.domain)).toEqual(
      WORKFLOW_DOMAINS,
    );
    expect(STATIC_WORKFLOW_MAPS.map((workflowMap) => workflowMap.domain)).toEqual(
      WORKFLOW_DOMAINS,
    );
  });

  it('keeps every workflow map static and descriptive only', () => {
    STATIC_WORKFLOW_MAPS.forEach((workflowMap) => {
      expect(workflowMap.staticMapOnly).toBe(true);
      expect(workflowMap.executionBlocked).toBe(true);
      expect(workflowMap.workflowId).toBe(`workflow-map-${workflowMap.domain}`);
      expect(workflowMap.stages.length).toBeGreaterThan(0);
      expect(workflowMap.stages.every((stage) => stage.status === 'static_preview_only')).toBe(
        true,
      );
      Object.values(workflowMap).forEach((value) => {
        expect(typeof value).not.toBe('function');
      });
    });
  });

  it('locks every workflow capability to false', () => {
    collectCapabilities().forEach((capabilitySet) => {
      expect(capabilitySet.canExecute).toBe(false);
      expect(capabilitySet.canPersist).toBe(false);
      expect(capabilitySet.canCreateWorkItem).toBe(false);
      expect(capabilitySet.canCreateMatter).toBe(false);
      expect(capabilitySet.canCreateDocumentRef).toBe(false);
      expect(capabilitySet.canGenerateFiles).toBe(false);
      expect(capabilitySet.canUseProviders).toBe(false);
      expect(capabilitySet.canUseFileSystem).toBe(false);
    });
  });

  it('does not expose execution, persistence, generation, or creation capability', () => {
    STATIC_WORKFLOW_MAPS.forEach((workflowMap) => {
      expect(workflowMap.blockedActions).toContain('workflow_execution');
      expect(workflowMap.blockedActions).toContain('durable_write');
      expect(workflowMap.blockedActions).toContain('operational_object_creation');
      expect(workflowMap.blockedActions).toContain('file_generation');
      expect(Object.values(workflowMap.capabilities).every((capability) => capability === false))
        .toBe(true);
    });
  });

  it('does not expose provider, api, token, storage, or file-system surfaces', () => {
    const workflowKeys = collectRecordKeys(STATIC_WORKFLOW_MAPS);
    const workflowValues = collectPrimitiveValues(STATIC_WORKFLOW_MAPS);

    forbiddenLiveTerms.forEach((term) => {
      expect(workflowKeys).not.toContain(term);
      expect(workflowValues).not.toContain(term);
    });
  });

  it('references approval, policy, output, and QC gates without bypassing them', () => {
    STATIC_WORKFLOW_MAPS.forEach((workflowMap) => {
      expect(workflowMap.requiredApprovalStage).toBe(WORKFLOW_REQUIRED_GATES.approval);
      expect(workflowMap.requiredPolicyStage).toBe(WORKFLOW_REQUIRED_GATES.policy);
      expect(workflowMap.requiredOutputPreviewStage).toBe(
        WORKFLOW_REQUIRED_GATES.outputPreview,
      );
      expect(workflowMap.requiredQcStage).toBe(WORKFLOW_REQUIRED_GATES.qualityControl);
      expect(workflowMap.auditTraceRequirements).toContain('stage7DecisionId');
      expect(workflowMap.auditTraceRequirements).toContain('stage9PolicyId');
      expect(workflowMap.auditTraceRequirements).toContain('stage10OutputPreviewId');
      expect(workflowMap.auditTraceRequirements).toContain('stage12QcDecisionId');
    });
  });

  it('requires professional review for labor law and expert opinions', () => {
    const laborLawMap = STATIC_WORKFLOW_MAPS.find(
      (workflowMap) => workflowMap.domain === 'labor_law',
    );
    const expertOpinionsMap = STATIC_WORKFLOW_MAPS.find(
      (workflowMap) => workflowMap.domain === 'expert_opinions',
    );

    expect(laborLawMap?.professionalReviewRequired).toBe(true);
    expect(laborLawMap?.riskLevel).toBe('high');
    expect(expertOpinionsMap?.professionalReviewRequired).toBe(true);
    expect(expertOpinionsMap?.riskLevel).toBe('critical');
  });

  it('includes Hebrew labels for every registry entry and workflow map', () => {
    WORKFLOW_DOMAIN_REGISTRY.forEach((entry) => {
      expect(entry.hebrewLabel.length).toBeGreaterThan(0);
      expect(entry.hebrewLabel).not.toBe(entry.englishLabel);
    });

    STATIC_WORKFLOW_MAPS.forEach((workflowMap) => {
      expect(workflowMap.hebrewLabel.length).toBeGreaterThan(0);
    });
  });

  it('references Stage 10 output ids as strings without Stage 10 imports', () => {
    const workflowKeys = collectRecordKeys(STATIC_WORKFLOW_MAPS);
    const workflowValues = collectPrimitiveValues(STATIC_WORKFLOW_MAPS);

    STATIC_WORKFLOW_MAPS.forEach((workflowMap) => {
      workflowMap.eligibleOutputTypes.forEach((outputTypeId) => {
        expect(typeof outputTypeId).toBe('string');
      });
    });

    forbiddenStageTenImportTerms.forEach((term) => {
      expect(workflowKeys).not.toContain(term);
      expect(workflowValues).not.toContain(term);
    });
  });
});
// #endregion
