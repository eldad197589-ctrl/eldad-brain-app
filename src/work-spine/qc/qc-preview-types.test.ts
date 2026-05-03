/* ====
   FILE: qc-preview-types.test.ts
   PURPOSE: Focused tests for Stage 12 static QC preview contracts.
   DEPENDENCIES: Vitest, QC preview static contracts and fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  QC_APPROVAL_DECISION_PREVIEWS,
  QC_APPROVAL_REQUIREMENTS,
  QC_BLOCKING_ISSUES,
  QC_CHECKLIST_ITEMS,
  QC_CHECKLISTS,
  QC_FINDINGS,
  QC_POLICY_COVERAGE_MAPS,
  QC_PREVIEW_RESULTS,
  QC_PREVIEW_SUBJECTS,
  QC_REVIEW_CONTEXTS,
} from './qc-preview-seed';
import {
  QC_BLOCKED_BOUNDARY_KEYS,
  QC_PREVIEW_STATUSES,
  QC_PREVIEW_SUBJECT_TYPES,
  QC_SCOPE_ACKNOWLEDGEMENT,
  QC_STATIC_FIXTURE_SOURCE,
} from './qc-preview-types';
import type {
  QCApprovalDecisionPreview,
  QCApprovalRequirement,
  QCBlockingIssue,
  QCChecklist,
  QCChecklistItem,
  QCFinding,
  QCPolicyCoverageMap,
  QCPreviewResult,
  QCPreviewSubject,
  QCReviewContext,
} from './qc-preview-types';
// #endregion

// #region Test Helpers
const expectedStatusValues = [
  'not_started',
  'ready_for_qc',
  'in_review',
  'passed',
  'passed_with_warnings',
  'needs_changes',
  'blocked',
  'rejected',
  'approved_for_next_stage_preview_only',
] as const;

const forbiddenStatusNames = [
  'fi' + 'nal',
  'exec' + 'uted',
  'persist' + 'ed',
  'sub' + 'mitted',
] as const;

const forbiddenSurfaceTerms = [
  'sto' + 're',
  'persist' + 'ence',
  'local' + 'Storage',
  'Supa' + 'base',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'pro' + 'vider',
  'A' + 'PI',
  'O' + 'Auth',
  'f' + 's',
  'O' + 'CR',
  'dash' + 'board',
  'CEO' + ' Bureau',
  'Brain' + ' Router',
  'Set' + 'tings',
] as const;

const allFixtureCollections = [
  QC_PREVIEW_SUBJECTS,
  QC_CHECKLIST_ITEMS,
  QC_CHECKLISTS,
  QC_FINDINGS,
  QC_BLOCKING_ISSUES,
  QC_APPROVAL_REQUIREMENTS,
  QC_APPROVAL_DECISION_PREVIEWS,
  QC_REVIEW_CONTEXTS,
  QC_POLICY_COVERAGE_MAPS,
  QC_PREVIEW_RESULTS,
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

const getAllStatusValues = (): string[] => [
  ...QC_CHECKLIST_ITEMS.map((item) => item.status),
  ...QC_CHECKLISTS.map((checklist) => checklist.status),
  ...QC_FINDINGS.map((finding) => finding.status),
  ...QC_APPROVAL_DECISION_PREVIEWS.map((decision) => decision.decisionStatus),
  ...QC_PREVIEW_RESULTS.map((result) => result.status),
];
// #endregion

// #region Tests
describe('Stage 12 static QC preview contracts', () => {
  it('exposes every required QC object contract', () => {
    const subjectContract: QCPreviewSubject = QC_PREVIEW_SUBJECTS[0]!;
    const itemContract: QCChecklistItem = QC_CHECKLIST_ITEMS[0]!;
    const checklistContract: QCChecklist = QC_CHECKLISTS[0]!;
    const findingContract: QCFinding = QC_FINDINGS[0]!;
    const blockContract: QCBlockingIssue = QC_BLOCKING_ISSUES[0]!;
    const requirementContract: QCApprovalRequirement = QC_APPROVAL_REQUIREMENTS[0]!;
    const decisionContract: QCApprovalDecisionPreview = QC_APPROVAL_DECISION_PREVIEWS[0]!;
    const contextContract: QCReviewContext = QC_REVIEW_CONTEXTS[0]!;
    const coverageContract: QCPolicyCoverageMap = QC_POLICY_COVERAGE_MAPS[0]!;
    const resultContract: QCPreviewResult = QC_PREVIEW_RESULTS[0]!;

    expect(subjectContract.previewOnly).toBe(true);
    expect(itemContract.fixtureSource).toBe(QC_STATIC_FIXTURE_SOURCE);
    expect(checklistContract.previewOnly).toBe(true);
    expect(findingContract.previewOnly).toBe(true);
    expect(blockContract.blocksApproval).toBe(true);
    expect(requirementContract.requiresEldad).toBe(true);
    expect(decisionContract.scopeAcknowledgement).toBe(QC_SCOPE_ACKNOWLEDGEMENT);
    expect(contextContract.createsRealApprovalState).toBe(false);
    expect(coverageContract.blockedBoundaryKeys).toEqual(QC_BLOCKED_BOUNDARY_KEYS);
    expect(resultContract.previewOnly).toBe(true);
  });

  it('covers every required QC preview surface', () => {
    expect(QC_PREVIEW_SUBJECTS.map((subject) => subject.subjectType)).toEqual(
      QC_PREVIEW_SUBJECT_TYPES,
    );

    const coverage = QC_POLICY_COVERAGE_MAPS[0]!;
    expect(coverage.coversIntakePreviews).toBe(true);
    expect(coverage.coversOperationalPreviews).toBe(true);
    expect(coverage.coversProfessionalOutputPreviews).toBe(true);
    expect(coverage.coversWorkflowMaps).toBe(true);
    expect(coverage.coversFutureRealActionPolicyDecisions).toBe(true);
  });

  it('uses only the Stage 12 status allowlist', () => {
    const allowedStatuses = new Set<string>(QC_PREVIEW_STATUSES);

    expect(QC_PREVIEW_STATUSES).toEqual(expectedStatusValues);
    getAllStatusValues().forEach((status) => {
      expect(allowedStatuses.has(status)).toBe(true);
    });
  });

  it('never exposes forbidden status names', () => {
    const statusValues = [...QC_PREVIEW_STATUSES, ...getAllStatusValues()];

    forbiddenStatusNames.forEach((statusName) => {
      expect(statusValues).not.toContain(statusName);
    });
  });

  it('requires all approval decision preview fields', () => {
    const requiredApprovalFields = [
      'approvalId',
      'subjectId',
      'subjectType',
      'reviewerId',
      'reviewerLabel',
      'decision',
      'decisionStatus',
      'timestamp',
      'rationale',
      'requiredChecklistIds',
      'passedChecklistIds',
      'blockingIssueIds',
      'warnings',
      'scopeAcknowledgement',
      'forbiddenActionsAcknowledged',
      'previewOnly',
      'canFinalizeOutput',
      'canExecuteAction',
      'canPersistDecision',
    ] as const;

    QC_APPROVAL_DECISION_PREVIEWS.forEach((decision) => {
      const decisionRecord = decision as unknown as Record<string, unknown>;
      requiredApprovalFields.forEach((fieldName) => {
        expect(fieldName in decisionRecord).toBe(true);
      });
      expect(Boolean(decision.validUntil ?? decision.expiresAt)).toBe(true);
    });
  });

  it('locks every approval preview and QC result as preview-only', () => {
    QC_APPROVAL_DECISION_PREVIEWS.forEach((decision) => {
      expect(decision.previewOnly).toBe(true);
      expect(decision.scopeAcknowledgement).toBe(QC_SCOPE_ACKNOWLEDGEMENT);
      expect(decision.forbiddenActionsAcknowledged).toBe(true);
    });

    QC_PREVIEW_RESULTS.forEach((result) => {
      expect(result.previewOnly).toBe(true);
      expect(result.fixtureSource).toBe(QC_STATIC_FIXTURE_SOURCE);
    });
  });

  it('blocks finalization, action execution, and decision persistence', () => {
    [...QC_APPROVAL_DECISION_PREVIEWS, ...QC_PREVIEW_RESULTS].forEach((preview) => {
      expect(preview.canFinalizeOutput).toBe(false);
      expect(preview.canExecuteAction).toBe(false);
      expect(preview.canPersistDecision).toBe(false);
    });
  });

  it('evaluates preview objects without creating real approval state', () => {
    QC_REVIEW_CONTEXTS.forEach((context) => {
      expect(context.createsRealApprovalState).toBe(false);
      expect(context.previewOnly).toBe(true);
    });

    QC_APPROVAL_DECISION_PREVIEWS.forEach((decision) => {
      expect(decision.canPersistDecision).toBe(false);
      expect(decision.previewOnly).toBe(true);
      expect(decision.scopeAcknowledgement).toBe(QC_SCOPE_ACKNOWLEDGEMENT);
    });
  });

  it('does not expose forbidden live, storage, object, file, or routing surfaces', () => {
    const fixtureKeys = collectRecordKeys(allFixtureCollections);
    const fixtureValues = collectPrimitiveValues(allFixtureCollections);
    const searchableText = [...fixtureKeys, ...fixtureValues].join(' ').toLowerCase();

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm.toLowerCase());
    });
  });

  it('does not expose a QC approval journal or final approval state', () => {
    const fixtureKeys = collectRecordKeys(allFixtureCollections);
    const fixtureValues = collectPrimitiveValues(allFixtureCollections);
    const searchableText = [...fixtureKeys, ...fixtureValues].join(' ');

    expect(searchableText).not.toContain('led' + 'ger');
    expect(searchableText).not.toContain('fi' + 'nalApprovalState');
    expect(searchableText).not.toContain('realApprovalStateId');
  });
});
// #endregion
