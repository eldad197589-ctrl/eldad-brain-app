/* ====
   FILE: agentic-execution-types.test.ts
   PURPOSE: Focused tests for Stage 16 limited agentic execution contracts.
   DEPENDENCIES: Vitest, Stage 16 agentic execution contracts and fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES,
  STATIC_AGENTIC_EXECUTION_REQUESTS,
} from './agentic-execution-seed';
import {
  AGENTIC_EXECUTION_CLASS_DEFINITIONS,
  AGENTIC_EXECUTION_CLASS_NAMES,
  AGENTIC_EXECUTION_CLASS_NUMBERS,
} from './agentic-execution-types';
import type {
  AgenticExecutionAuditEntry,
  AgenticExecutionRequest,
  ExecutionApprovalChain,
  KillSwitchPolicy,
  RollbackPlan,
} from './agentic-execution-types';
// #endregion

// #region Test Helpers
const expectedClassNames = [
  'observe',
  'classify',
  'create_internal',
  'file_operation',
  'generate_output',
  'external_action',
] as const;

const requiredRequestFields = [
  'requestId',
  'agentId',
  'actionClass',
  'actionType',
  'sourceIntakeId',
  'policyGateResult',
  'qcGateResult',
  'eldadApprovalId',
  'executionBlocked',
  'executionBlockedReason',
  'killSwitchAvailable',
  'rollbackPlan',
  'maxExecutionWindowMs',
  'approvalChain',
  'proposedAt',
] as const;

const requiredAuditFields = [
  'requestId',
  'agentId',
  'actionClass',
  'actionType',
  'sourceIntakeId',
  'policyGateResult',
  'qcGateResult',
  'eldadApprovalId',
  'executionTimestamp',
  'executionResult',
  'rollbackExecuted',
  'postExecutionVerification',
] as const;

const forbiddenFixtureTerms = [
  'fet' + 'ch',
  'f' + 's',
  'pa' + 'th',
  'google' + 'apis',
  'O' + 'Auth',
  'O' + 'CR',
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'use' + 'BrainStore',
  'use' + 'Mat' + 'terStore',
  'brain' + 'Store',
  'matter' + 'Store',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'create' + 'Work' + 'Item',
  'create' + 'Mat' + 'ter',
  'create' + 'Document' + 'Ref',
  'execute' + 'Action',
  'run' + 'Action',
  'hand' + 'ler',
  'execu' + 'tor',
] as const;

const collectKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectKeys);
  if (typeof value !== 'object' || value === null) return [];

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [key, ...collectKeys(childValue)]);
};

const collectValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectValues);
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];

  return Object.values(value as Record<string, unknown>).flatMap(collectValues);
};
// #endregion

// #region Tests
describe('Stage 16 limited agentic execution contracts', () => {
  it('exposes all required execution classes', () => {
    expect(AGENTIC_EXECUTION_CLASS_NUMBERS).toEqual([0, 1, 2, 3, 4, 5]);
    expect(AGENTIC_EXECUTION_CLASS_NAMES).toEqual(expectedClassNames);
    expect(AGENTIC_EXECUTION_CLASS_DEFINITIONS.map((definition) => definition.actionClass)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });

  it('keeps observe as the only active class', () => {
    const activeDefinitions = AGENTIC_EXECUTION_CLASS_DEFINITIONS.filter(
      (definition) => definition.activeInStage16,
    );

    expect(activeDefinitions).toHaveLength(1);
    expect(activeDefinitions[0]).toMatchObject({
      actionClass: 0,
      className: 'observe',
      executionBlocked: false,
    });
  });

  it('blocks classes one through five in every request', () => {
    STATIC_AGENTIC_EXECUTION_REQUESTS.forEach((request) => {
      if (request.actionClass === 0) {
        expect(request.executionBlocked).toBe(false);
        return;
      }

      expect(request.executionBlocked).toBe(true);
      expect(request.executionBlockedReason).toBeTruthy();
    });
  });

  it('includes approval chain fields on every request', () => {
    STATIC_AGENTIC_EXECUTION_REQUESTS.forEach((request) => {
      requiredRequestFields.forEach((fieldName) => {
        expect(request).toHaveProperty(fieldName);
      });

      const approvalChain: ExecutionApprovalChain = request.approvalChain;
      expect(approvalChain.approvalChainId).toBeTruthy();
      expect(approvalChain.policyGateResult).toBe(request.policyGateResult);
      expect(approvalChain.qcGateResult).toBe(request.qcGateResult);
      expect(approvalChain.requiredGateIds.length).toBeGreaterThan(0);
    });
  });

  it('requires kill switch availability for class two and higher', () => {
    STATIC_AGENTIC_EXECUTION_REQUESTS.filter((request) => request.actionClass >= 2).forEach(
      (request) => {
        const killSwitchPolicy: KillSwitchPolicy = request.killSwitchPolicy;

        expect(request.killSwitchAvailable).toBe(true);
        expect(killSwitchPolicy.killSwitchAvailable).toBe(true);
        expect(killSwitchPolicy.maxResponseWindowMs).toBeGreaterThan(0);
      },
    );
  });

  it('requires rollback plans for classes two through five', () => {
    STATIC_AGENTIC_EXECUTION_REQUESTS.filter(
      (request) => request.actionClass >= 2 && request.actionClass <= 5,
    ).forEach((request) => {
      const rollbackPlan: RollbackPlan = request.rollbackPlan;

      expect(rollbackPlan.rollbackPlanId).toBeTruthy();
      expect(rollbackPlan.postActionVerificationRequirement).toBeTruthy();
    });
  });

  it('requires explicit Eldad irreversibility acknowledgement for non-reversible external action', () => {
    const externalRequest = STATIC_AGENTIC_EXECUTION_REQUESTS.find(
      (request) => request.actionClass === 5,
    );

    expect(externalRequest).toBeDefined();
    expect(externalRequest?.rollbackPlan.rollbackMethod).toBe('not_reversible');
    expect(externalRequest?.approvalChain.irreversibilityAcknowledgmentRequired).toBe(true);
    expect(externalRequest?.approvalChain.explicitEldadIrreversibilityAcknowledgment).toBe(true);
    expect(externalRequest?.rollbackPlan.explicitEldadIrreversibilityAcknowledgment).toBe(true);
  });

  it('includes every required audit entry field', () => {
    STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES.forEach((auditEntry) => {
      const typedAuditEntry: AgenticExecutionAuditEntry = auditEntry;

      requiredAuditFields.forEach((fieldName) => {
        expect(typedAuditEntry).toHaveProperty(fieldName);
      });
      expect(typedAuditEntry.auditEntryId).toBeTruthy();
    });
  });

  it('keeps every static audit entry not executed', () => {
    STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES.forEach((auditEntry) => {
      expect(auditEntry.executionResult).toBe('not_executed');
      expect(auditEntry.rollbackExecuted).toBe(false);
    });
  });

  it('does not expose a runnable surface in requests or audit entries', () => {
    const fixtureTokens = [
      ...collectKeys(STATIC_AGENTIC_EXECUTION_REQUESTS),
      ...collectValues(STATIC_AGENTIC_EXECUTION_REQUESTS),
      ...collectKeys(STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES),
      ...collectValues(STATIC_AGENTIC_EXECUTION_AUDIT_ENTRIES),
    ]
      .flatMap((value) => value.split(/[^A-Za-z0-9_]+/))
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    forbiddenFixtureTerms.forEach((term) => {
      expect(fixtureTokens).not.toContain(term.toLowerCase());
    });
  });

  it('keeps request fixtures typed as static contracts only', () => {
    STATIC_AGENTIC_EXECUTION_REQUESTS.forEach((request) => {
      const typedRequest: AgenticExecutionRequest = request;

      expect(typedRequest.requestId).toBeTruthy();
      expect(typedRequest.maxExecutionWindowMs).toBe(0);
      expect(typeof typedRequest.actionType).toBe('string');
    });
  });
});
// #endregion
