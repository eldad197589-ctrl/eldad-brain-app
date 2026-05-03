/* ====
   FILE: robium-salary-clients-types.test.ts
   PURPOSE: Focused tests for Stage 18 static Robium salary client contracts.
   DEPENDENCIES: Vitest, Stage 18 Robium salary client fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  CLIENT_OPERATION_DOMAIN_MAPS,
  PAYROLL_OPERATION_PREVIEW_LOCK,
  ROBIUM_PROTOCOL_SOURCE_PREVIEWS,
  ROBIUM_SAFETY_POLICY_BUNDLE,
  SALARY_BUREAU_WORKFLOW_MAPS,
} from './robium-salary-clients-seed';
import {
  PAYROLL_OPERATION_KEYS,
  ROBIUM_STAGE18_CAPABILITY_LOCKS,
  SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES,
} from './robium-salary-clients-types';
import type {
  ClientOperationDomainMap,
  PayrollOperationPreviewLock,
  RobiumProtocolSourcePreview,
  RobiumSafetyPolicyBundle,
  SalaryBureauWorkflowMap,
} from './robium-salary-clients-types';
// #endregion

// #region Test Helpers
const allCapabilityContainers = [
  ...SALARY_BUREAU_WORKFLOW_MAPS.map((workflow) => workflow.capabilities),
  ...CLIENT_OPERATION_DOMAIN_MAPS.map((domainMap) => domainMap.capabilities),
] as const;

const forbiddenSurfaceTerms = [
  'salary_' + 'normative_' + 'registry_' + 'seed',
  'payroll service',
  'client store',
  'protocol ' + 'api',
  'brain' + 'Store',
  'mat' + 'ter' + 'Store',
  'pro' + 'viders',
  'file' + 'system',
  'persist' + 'ence',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
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

const hasHebrewText = (value: string): boolean => /[\u0590-\u05FF]/.test(value);
// #endregion

// #region Tests
describe('Stage 18 Robium salary client static contracts', () => {
  it('exposes all required contract types through fixtures', () => {
    const protocolPreview: RobiumProtocolSourcePreview = ROBIUM_PROTOCOL_SOURCE_PREVIEWS[0]!;
    const salaryWorkflow: SalaryBureauWorkflowMap = SALARY_BUREAU_WORKFLOW_MAPS[0]!;
    const clientDomain: ClientOperationDomainMap = CLIENT_OPERATION_DOMAIN_MAPS[0]!;
    const payrollLock: PayrollOperationPreviewLock = PAYROLL_OPERATION_PREVIEW_LOCK;
    const safetyBundle: RobiumSafetyPolicyBundle = ROBIUM_SAFETY_POLICY_BUNDLE;

    expect(protocolPreview.previewId).toBeTruthy();
    expect(salaryWorkflow.domain).toBe('payroll');
    expect(clientDomain.domainId).toBeTruthy();
    expect(payrollLock.domain).toBe('payroll');
    expect(safetyBundle.bundleId).toBeTruthy();
  });

  it('includes Hebrew display labels for all domain maps', () => {
    SALARY_BUREAU_WORKFLOW_MAPS.forEach((workflow) => {
      expect(hasHebrewText(workflow.hebrewLabel)).toBe(true);
    });

    CLIENT_OPERATION_DOMAIN_MAPS.forEach((domainMap) => {
      expect(hasHebrewText(domainMap.hebrewLabel)).toBe(true);
    });

    expect(hasHebrewText(ROBIUM_SAFETY_POLICY_BUNDLE.hebrewLabel)).toBe(true);
  });

  it('blocks Robium protocol task, calendar, and automatic actions', () => {
    ROBIUM_PROTOCOL_SOURCE_PREVIEWS.forEach((preview) => {
      expect(preview.taskExtractionBlocked).toBe(true);
      expect(preview.calendarCreationBlocked).toBe(true);
      expect(preview.autoActionBlocked).toBe(true);
      expect(preview.boundaryFlags).toContain('metadata_preview_only');
    });
  });

  it('keeps Salary Bureau workflow maps high-risk and blocked', () => {
    SALARY_BUREAU_WORKFLOW_MAPS.forEach((workflow) => {
      expect(workflow.eligibleSourceTypes).toEqual(SALARY_BUREAU_ELIGIBLE_SOURCE_TYPES);
      expect(workflow.riskLevel).toBe('high');
      expect(workflow.professionalReviewRequired).toBe(true);
      expect(workflow.calculationExecutionBlocked).toBe(true);
      expect(workflow.submissionBlocked).toBe(true);
    });
  });

  it('keeps client operation maps blocked and evidence-traced', () => {
    CLIENT_OPERATION_DOMAIN_MAPS.forEach((domainMap) => {
      expect(domainMap.clientDataAccessBlocked).toBe(true);
      expect(domainMap.communicationBlocked).toBe(true);
      expect(domainMap.evidenceTraceRequired).toBe(true);
      expect(['high', 'critical']).toContain(domainMap.operationRiskClassification);
    });
  });

  it('blocks every payroll operation in the preview lock', () => {
    expect(PAYROLL_OPERATION_PREVIEW_LOCK.allOperationsBlocked).toBe(true);
    expect(PAYROLL_OPERATION_PREVIEW_LOCK.unlockRequires).toBe('dedicated_stage_gate');
    expect(PAYROLL_OPERATION_PREVIEW_LOCK.professionalLiabilityAcknowledged).toBe(false);

    PAYROLL_OPERATION_KEYS.forEach((operationKey) => {
      expect(PAYROLL_OPERATION_PREVIEW_LOCK.operations[operationKey]).toBe('blocked');
    });
  });

  it('locks every capability to false', () => {
    expect(ROBIUM_STAGE18_CAPABILITY_LOCKS).toEqual({
      canReadLiveSource: false,
      canWriteState: false,
      canRunCalculation: false,
      canSubmit: false,
      canGenerateOutput: false,
      canCommunicate: false,
      canCreateOperationalRecord: false,
    });

    allCapabilityContainers.forEach((capabilities) => {
      Object.values(capabilities).forEach((capabilityValue) => {
        expect(capabilityValue).toBe(false);
      });
    });
  });

  it('keeps every operation across all three domains blocked', () => {
    expect(ROBIUM_PROTOCOL_SOURCE_PREVIEWS.every((preview) => preview.autoActionBlocked)).toBe(true);
    expect(SALARY_BUREAU_WORKFLOW_MAPS.every((workflow) => workflow.submissionBlocked)).toBe(true);
    expect(CLIENT_OPERATION_DOMAIN_MAPS.every((domainMap) => domainMap.communicationBlocked)).toBe(
      true,
    );
  });

  it('locks the safety policy bundle against live and operational boundaries', () => {
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.liveRobiumLinkBlocked).toBe(true);
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.protocolConnectionBlocked).toBe(true);
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.payrollExecutionBlocked).toBe(true);
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.salaryCalculationBlocked).toBe(true);
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.clientRecordMutationBlocked).toBe(true);
    expect(ROBIUM_SAFETY_POLICY_BUNDLE.outputGenerationBlocked).toBe(true);
  });

  it('does not expose forbidden implementation surfaces', () => {
    const fixtureCollections = [
      ROBIUM_PROTOCOL_SOURCE_PREVIEWS,
      SALARY_BUREAU_WORKFLOW_MAPS,
      CLIENT_OPERATION_DOMAIN_MAPS,
      PAYROLL_OPERATION_PREVIEW_LOCK,
      ROBIUM_SAFETY_POLICY_BUNDLE,
    ] as const;
    const searchableText = [
      ...collectRecordKeys(fixtureCollections),
      ...collectPrimitiveValues(fixtureCollections),
    ].join(' ');

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm);
    });
  });
});
// #endregion
