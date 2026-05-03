/* ====
   FILE: approval-decision-types.test.ts
   PURPOSE: Focused tests for Stage 7A static Approval Gate decisions.
   DEPENDENCIES: Vitest, Approval Gate static contracts
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { INTAKE_SOURCE_TYPES } from '../intake/unified-intake-source-types';
import { STATIC_APPROVAL_DECISIONS } from './approval-decision-seed';
import {
  APPROVAL_BLOCKED_OPERATIONAL_EFFECTS,
  APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP,
  APPROVAL_DECISION_SCOPE,
  APPROVAL_DECISION_STATUSES,
  APPROVAL_NO_NEXT_STEP,
  allowsOnlyCandidatePreview,
  hasOnlyBlockedOperationalEffects,
  isApprovalDecisionStatus,
  isMetadataPreviewApprovalDecision,
} from './approval-decision-types';
import type { ApprovalDecision } from './approval-decision-types';
// #endregion

// #region Test Helpers
const operationalBlockerKeys = [
  'canCreateWorkItem',
  'canCreateMatter',
  'canCreateDocumentRef',
  'canPersist',
  'canRoute',
  'canExecuteProviderAction',
  'canCreateTask',
  'canCreateCalendarItem',
  'canCreateWorkflowItem',
] as const;

const forbiddenSurfaceNames = [
  'useBrain' + 'Store',
  'useMatter' + 'Store',
  'brain' + 'Store',
  'matter' + 'Store',
  'local' + 'Storage',
  'Supa' + 'base',
  'google' + 'apis',
  'O' + 'Auth',
  'O' + 'CR',
] as const;

const collectKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectKeys);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectKeys(childValue),
  ]);
};

const getApprovedDecisions = (): ApprovalDecision[] =>
  STATIC_APPROVAL_DECISIONS.filter(
    (decision) => decision.status === 'approved_for_candidate_preview',
  );

const getNonApprovedDecisions = (): ApprovalDecision[] =>
  STATIC_APPROVAL_DECISIONS.filter(
    (decision) => decision.status !== 'approved_for_candidate_preview',
  );
// #endregion

// #region Tests
describe('Stage 7A Approval Gate static contract', () => {
  it('uses only allowed statuses and known source types', () => {
    const allowedStatusSet = new Set<string>(APPROVAL_DECISION_STATUSES);
    const allowedSourceTypeSet = new Set<string>(INTAKE_SOURCE_TYPES);

    STATIC_APPROVAL_DECISIONS.forEach((decision) => {
      expect(allowedStatusSet.has(decision.status)).toBe(true);
      expect(isApprovalDecisionStatus(decision.status)).toBe(true);
      expect(allowedSourceTypeSet.has(decision.sourceType)).toBe(true);
    });
  });

  it('keeps every decision scoped to metadata preview only', () => {
    STATIC_APPROVAL_DECISIONS.forEach((decision) => {
      expect(decision.approvalScope).toBe(APPROVAL_DECISION_SCOPE);
      expect(isMetadataPreviewApprovalDecision(decision)).toBe(true);
      expect(decision.safetyFlags.metadataPreviewOnly).toBe(true);
      expect(decision.safetyFlags.staticMockOnly).toBe(true);
    });
  });

  it('allows approved decisions to proceed only to later candidate preview', () => {
    const approvedDecisions = getApprovedDecisions();

    expect(approvedDecisions).toHaveLength(1);

    approvedDecisions.forEach((decision) => {
      expect(decision.allowedNextStep).toBe(APPROVAL_CANDIDATE_PREVIEW_NEXT_STEP);
      expect(allowsOnlyCandidatePreview(decision)).toBe(true);
    });
  });

  it('keeps rejected, blocked, and needs-evidence decisions non-operational', () => {
    const nonApprovedDecisions = getNonApprovedDecisions();

    nonApprovedDecisions.forEach((decision) => {
      expect(decision.allowedNextStep).toBe(APPROVAL_NO_NEXT_STEP);
      expect(allowsOnlyCandidatePreview(decision)).toBe(false);
      expect(hasOnlyBlockedOperationalEffects(decision)).toBe(true);
    });
  });

  it('explicitly blocks every operational effect', () => {
    expect(Object.keys(APPROVAL_BLOCKED_OPERATIONAL_EFFECTS)).toEqual(
      operationalBlockerKeys,
    );

    STATIC_APPROVAL_DECISIONS.forEach((decision) => {
      operationalBlockerKeys.forEach((blockerKey) => {
        expect(decision.blockedOperationalEffects[blockerKey]).toBe(false);
      });
      expect(decision.safetyFlags.operationalCreationBlocked).toBe(true);
      expect(decision.safetyFlags.providerActionBlocked).toBe(true);
      expect(decision.safetyFlags.persistenceBlocked).toBe(true);
      expect(decision.safetyFlags.requiresEldadReview).toBe(true);
    });
  });

  it('does not expose forbidden live connector or store surfaces', () => {
    const decisionKeys = collectKeys(STATIC_APPROVAL_DECISIONS);

    forbiddenSurfaceNames.forEach((surfaceName) => {
      expect(decisionKeys).not.toContain(surfaceName);
    });
  });
});
// #endregion
