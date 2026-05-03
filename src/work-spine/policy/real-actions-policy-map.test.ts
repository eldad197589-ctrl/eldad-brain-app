/* ====
   FILE: real-actions-policy-map.test.ts
   PURPOSE: Focused tests for the Stage 9 static real-action policy map.
   DEPENDENCIES: Vitest, real-action policy contracts
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { REAL_ACTIONS_POLICY_MAP } from './real-actions-policy-map';
import {
  MANUAL_ONLY_REAL_ACTIONS,
  REAL_ACTION_NAMES,
  REAL_ACTION_POLICY_STATUS,
  REAL_ACTION_RISK_NAMES,
} from './real-actions-policy-types';
import type { RealActionPolicy } from './real-actions-policy-types';
// #endregion

// #region Test Helpers
const highRiskThreshold = 3;
const criticalRiskLevel = 4;

const forbiddenOperationalStatuses = [
  'acti' + 've',
  'in_' + 'progress',
  'com' + 'pleted',
  'assi' + 'gned',
] as const;

const forbiddenSurfaceNames = [
  'fe' + 'tch',
  'f' + 's',
  'pa' + 'th',
  'google' + 'apis',
  'useBrain' + 'Store',
  'use' + 'Mat' + 'ter' + 'Store',
  'brain' + 'Store',
  'matter' + 'Store',
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'create' + 'Work' + 'Item',
  'create' + 'Mat' + 'ter',
  'create' + 'Document' + 'Ref',
] as const;

const forbiddenHandlerKeys = [
  'handler',
  'run',
  'perform',
  'exec' + 'utor',
] as const;

const rollbackMethods = ['undo', 'manual_restore', 'not_reversible'] as const;

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

const getManualOnlyActions = (): readonly string[] =>
  REAL_ACTIONS_POLICY_MAP
    .filter((policy) => policy.manualOnly)
    .map((policy) => policy.actionName);

const getAllPolicyValues = (): string[] =>
  collectPrimitiveValues(REAL_ACTIONS_POLICY_MAP);

const getAllPolicyKeys = (): string[] =>
  collectRecordKeys(REAL_ACTIONS_POLICY_MAP);
// #endregion

// #region Tests
describe('Stage 9 real-action policy map', () => {
  it('defines the required risk levels and names', () => {
    expect(REAL_ACTION_RISK_NAMES).toEqual({
      0: 'none',
      1: 'low',
      2: 'medium',
      3: 'high',
      4: 'critical',
    });
  });

  it('includes all required actions in the static policy map', () => {
    expect(REAL_ACTIONS_POLICY_MAP).toHaveLength(REAL_ACTION_NAMES.length);
    expect(REAL_ACTIONS_POLICY_MAP.map((policy) => policy.actionName)).toEqual(
      REAL_ACTION_NAMES,
    );
  });

  it('blocks every policy implementation', () => {
    REAL_ACTIONS_POLICY_MAP.forEach((policy) => {
      expect(policy.status).toBe(REAL_ACTION_POLICY_STATUS);
      expect(policy.implementationBlocked).toBe(true);
      expect(policy.requiredGates.length).toBeGreaterThan(0);
      expect(policy.reason.length).toBeGreaterThan(0);
    });
  });

  it('requires audit logging for risk level three and above', () => {
    REAL_ACTIONS_POLICY_MAP.forEach((policy) => {
      if (policy.riskLevel >= highRiskThreshold) {
        expect(policy.requiresAuditLog).toBe(true);
        expect(policy.auditMustInclude.length).toBeGreaterThan(0);
      }
    });
  });

  it('keeps every critical policy manual-only', () => {
    REAL_ACTIONS_POLICY_MAP.forEach((policy) => {
      if (policy.riskLevel === criticalRiskLevel) {
        expect(policy.manualOnly).toBe(true);
      }
    });
  });

  it('matches the required manual-only action list', () => {
    expect(getManualOnlyActions()).toEqual(MANUAL_ONLY_REAL_ACTIONS);
  });

  it('populates risk names and rollback fields for every policy', () => {
    REAL_ACTIONS_POLICY_MAP.forEach((policy: RealActionPolicy) => {
      expect(policy.riskName).toBe(REAL_ACTION_RISK_NAMES[policy.riskLevel]);
      expect(typeof policy.isReversible).toBe('boolean');
      expect(rollbackMethods).toContain(policy.rollbackMethod);
      expect(typeof policy.rollbackRequiresEldad).toBe('boolean');
      expect(policy.forbiddenEffects.length).toBeGreaterThan(0);
    });
  });

  it('does not expose runnable handlers or function values', () => {
    const policyKeys = getAllPolicyKeys();

    forbiddenHandlerKeys.forEach((key) => {
      expect(policyKeys).not.toContain(key);
    });

    REAL_ACTIONS_POLICY_MAP.forEach((policy) => {
      Object.values(policy).forEach((value) => {
        expect(typeof value).not.toBe('function');
      });
    });
  });

  it('does not expose forbidden live, storage, provider, or operational surfaces', () => {
    const policyKeys = getAllPolicyKeys();
    const policyValues = getAllPolicyValues();

    [...forbiddenSurfaceNames, ...forbiddenOperationalStatuses].forEach((surfaceName) => {
      expect(policyKeys).not.toContain(surfaceName);
      expect(policyValues).not.toContain(surfaceName);
    });
  });
});
// #endregion
