/* ============================================
   FILE: learning-types.test.ts
   PURPOSE: Static contract tests for Brain Learning System type boundaries.
   DEPENDENCIES: Vitest, fs, learning-types, learning-static-seed
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_DOMAINS, LEARNING_STATUSES } from './learning-types';
import { LEARNING_STATIC_SEED } from './learning-static-seed';
import type { EldadDecisionLogEntry, LearningCandidate, LearningSourceEvidence } from './learning-types';
// #endregion

// #region Constants
const typeSourceText = readFileSync(new URL('./learning-types.ts', import.meta.url), 'utf8');
const seedSourceText = readFileSync(new URL('./learning-static-seed.ts', import.meta.url), 'utf8');
const combinedSourceText = `${typeSourceText}\n${seedSourceText}`;

const forbiddenSourceStrings = [
  'zustand',
  'brainStore',
  'KnowledgeSearch',
  'BrainLearnedBlock',
  'supabase',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'createStore',
  'persist(',
];
// #endregion

// #region Fixtures
const approvedEvidence: LearningSourceEvidence = {
  evidenceId: 'learning-evidence-approved-mock-001',
  sourceKind: 'static_mock_seed',
  sourceLabel: 'Approved mock evidence',
  sourceReference: 'static-test:approved-evidence',
  capturedAt: '2026-05-03T00:00:00.000Z',
  containsPrivateMaterial: false,
  allowedAccess: 'metadata_only',
  reviewStatus: 'eldad_confirmed',
};

const approvedDecision: EldadDecisionLogEntry = {
  decisionId: 'learning-decision-approved-mock-001',
  decision: 'approve',
  what: 'Approve the mock learning candidate for binding use.',
  why: 'The mock evidence has a source reference and Eldad approval metadata.',
  source: approvedEvidence.sourceReference,
  approvedAt: '2026-05-03T00:10:00.000Z',
  appliesTo: ['מע"מ'],
  decidedBy: 'Eldad',
};

const mockApprovedCandidate: LearningCandidate = {
  candidateId: 'learning-candidate-approved-mock-001',
  title: 'Approved mock VAT learning candidate',
  domain: 'מע"מ',
  status: 'approved_by_eldad',
  hypothesis: 'Approved mock learning candidate for type contract verification.',
  sourceEvidence: [approvedEvidence],
  decisionLog: [approvedDecision],
  approvalBoundary: {
    boundary: 'eldad_approved_binding',
    canBindKnowledge: true,
    requiresEldadApproval: false,
    approvedByEldad: true,
    approvedAt: approvedDecision.approvedAt,
    approvalDecisionId: approvedDecision.decisionId,
  },
  bindingUse: 'binding_knowledge',
  createdAt: '2026-05-03T00:00:00.000Z',
  updatedAt: '2026-05-03T00:10:00.000Z',
  notes: 'Test fixture only; not part of exported static seed.',
};
// #endregion

// #region Helpers
const hasRequiredEvidence = (candidate: LearningCandidate): boolean =>
  candidate.sourceEvidence.length > 0 &&
  candidate.sourceEvidence.every(evidence => evidence.sourceReference.length > 0 && evidence.sourceLabel.length > 0);

const hasApprovalMetadata = (candidate: LearningCandidate): boolean =>
  candidate.approvalBoundary.boundary === 'eldad_approved_binding' &&
  candidate.approvalBoundary.approvedByEldad &&
  candidate.approvalBoundary.approvedAt.length > 0 &&
  candidate.approvalBoundary.approvalDecisionId.length > 0 &&
  candidate.decisionLog.some(entry => entry.decision === 'approve' && entry.approvedAt !== null);
// #endregion

// #region Tests
describe('Brain Learning System type contracts', () => {
  it('models the approved learning statuses and professional domains', () => {
    expect(LEARNING_STATUSES).toEqual([
      'draft',
      'needs_source',
      'pending_eldad_review',
      'approved_by_eldad',
      'rejected',
      'obsolete',
    ]);

    expect(KNOWLEDGE_DOMAINS).toEqual([
      'מע"מ',
      'חוות דעת',
      'דיני עבודה',
      'שכר',
      'פיצויי מלחמה',
      'הנהלת חשבונות',
      'הצהרות הון',
      'החזרי מס',
      'מכתבים',
      'ניהול לקוחות',
      'רוביום',
    ]);
  });

  it('does not allow approved candidates without source evidence', () => {
    const approvedCandidates = [mockApprovedCandidate, ...LEARNING_STATIC_SEED].filter(
      candidate => candidate.status === 'approved_by_eldad',
    );

    expect(approvedCandidates).toHaveLength(1);
    expect(approvedCandidates.every(hasRequiredEvidence)).toBe(true);
  });

  it('does not bind knowledge without Eldad approval metadata', () => {
    const bindingCandidates = [mockApprovedCandidate, ...LEARNING_STATIC_SEED].filter(
      candidate => candidate.bindingUse === 'binding_knowledge',
    );

    expect(bindingCandidates).toHaveLength(1);
    expect(bindingCandidates.every(hasApprovalMetadata)).toBe(true);
    expect(LEARNING_STATIC_SEED.every(candidate => candidate.bindingUse !== 'binding_knowledge')).toBe(true);
  });

  it('requires source evidence for every static learning seed item', () => {
    expect(LEARNING_STATIC_SEED.length).toBeGreaterThan(0);
    expect(LEARNING_STATIC_SEED.every(hasRequiredEvidence)).toBe(true);
    expect(LEARNING_STATIC_SEED.every(candidate => candidate.approvalBoundary.canBindKnowledge === false)).toBe(true);
    expect(LEARNING_STATIC_SEED.every(candidate => candidate.status !== 'approved_by_eldad')).toBe(true);
  });

  it('records decision log entries with what, why, source, approvedAt, and appliesTo fields', () => {
    expect(Object.keys(approvedDecision)).toEqual(
      expect.arrayContaining(['what', 'why', 'source', 'approvedAt', 'appliesTo']),
    );
    expect(approvedDecision.what).toContain('Approve');
    expect(approvedDecision.why).toContain('mock evidence');
    expect(approvedDecision.source).toBe(approvedEvidence.sourceReference);
    expect(approvedDecision.approvedAt).toBe('2026-05-03T00:10:00.000Z');
    expect(approvedDecision.appliesTo).toEqual(['מע"מ']);
  });

  it('keeps learning contracts free of store, UI, and persistence imports', () => {
    for (const forbidden of forbiddenSourceStrings) {
      expect(combinedSourceText).not.toContain(forbidden);
    }

    expect(combinedSourceText).not.toContain("from '../../store");
    expect(combinedSourceText).not.toContain("from '../store");
    expect(combinedSourceText).not.toContain("from './brainStore");
    expect(combinedSourceText).not.toContain("from '../BrainLearnedBlock");
    expect(combinedSourceText).not.toContain("from '../KnowledgeSearch");
  });
});
// #endregion
