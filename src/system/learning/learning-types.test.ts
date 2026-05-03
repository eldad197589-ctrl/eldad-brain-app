/* ============================================
   FILE: learning-types.test.ts
   PURPOSE: Static contract tests for Brain Learning System type boundaries.
   DEPENDENCIES: Vitest, fs, learning-types, learning-static-seed
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  KNOWLEDGE_DOMAINS,
  LEARNING_ENTITY_TAGS,
  LEARNING_OUTPUT_TYPES,
  LEARNING_SOURCE_CHANNELS,
  LEARNING_STATUSES,
  LEARNING_WORKFLOWS,
} from './learning-types';
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
  'Supabase',
  'database',
  'DB',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'zustand',
  'Zustand',
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
  appliesToKnowledgeDomains: ['מע"מ'],
  appliesToWorkflows: ['דיווח מע"מ'],
  appliesToOutputTypes: ['דוח'],
  appliesToEntities: ['כללי / ללא לקוח'],
  appliesToSourceChannels: ['ידני'],
  decidedBy: 'Eldad',
};

const mockApprovedCandidate: LearningCandidate = {
  candidateId: 'learning-candidate-approved-mock-001',
  title: 'Approved mock VAT learning candidate',
  summary: 'Short mock summary for the approved candidate fixture.',
  knowledgeDomains: ['מע"מ'],
  workflows: ['דיווח מע"מ'],
  outputTypes: ['דוח'],
  entities: ['כללי / ללא לקוח'],
  sourceChannels: ['ידני'],
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

const hasFiveTaxonomyAxes = (candidate: LearningCandidate): boolean =>
  candidate.knowledgeDomains.length > 0 &&
  candidate.workflows.length > 0 &&
  candidate.outputTypes.length > 0 &&
  candidate.entities.length > 0 &&
  candidate.sourceChannels.length > 0;
// #endregion

// #region Tests
describe('Brain Learning System type contracts', () => {
  it('models the approved learning statuses and five taxonomy axes', () => {
    expect(LEARNING_STATUSES).toEqual([
      'draft',
      'needs_source',
      'pending_eldad_review',
      'approved_by_eldad',
      'rejected',
      'obsolete',
    ]);

    expect(KNOWLEDGE_DOMAINS).toEqual([
      'vat',
      'bookkeeping',
      'international_tax',
      'מע"מ',
      'מס הכנסה',
      'מיסוי',
      'דיני עבודה',
      'שכר',
      'פיצויי מלחמה',
      'הנהלת חשבונות',
    ]);

    expect(LEARNING_WORKFLOWS).toEqual([
      'monthly_vat_reconciliation',
      'document_ingestion',
      'invoice_classification',
      'expense_recognition',
      'דיווח מע"מ',
      'דוח כספי',
      'הצהרת הון',
      'החזר מס',
      'חוות דעת',
      'ביטול קנס',
      'מילוי טפסים',
    ]);

    expect(LEARNING_OUTPUT_TYPES).toEqual([
      'architectural_rule',
      'process_boundary',
      'tax_treatment_rule',
      'מכתב',
      'טופס',
      'דוח',
      'חישוב',
      'חוות דעת',
      'אקסל',
      'PDF',
      'הודעה ללקוח',
    ]);

    expect(LEARNING_ENTITY_TAGS).toEqual([
      'universal',
      'דימה',
      'צילה',
      'דוד אלדד',
      'רוביום',
      'בבילון',
      'א.א. עוגנים',
      'כללי / ללא לקוח',
    ]);

    expect(LEARNING_SOURCE_CHANNELS).toEqual(['eldad_decision_log', 'סריקה', 'Email', 'Drive', 'אזור אישי', 'ידני']);
  });

  it('requires every static candidate to carry all five taxonomy axes', () => {
    expect(LEARNING_STATIC_SEED.every(hasFiveTaxonomyAxes)).toBe(true);
    expect(
      LEARNING_STATIC_SEED.every(candidate => !Object.prototype.hasOwnProperty.call(candidate, 'domain')),
    ).toBe(true);
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

  it('adds the approved VAT insight candidates as metadata-only static seeds', () => {
    const vatInsightIds = [
      'learning-insight-2026-04-21-vat-ingestion-vs-claiming',
      'learning-insight-2026-04-28-google-play-vat-treatment',
    ];
    const vatInsightCandidates = LEARNING_STATIC_SEED.filter(candidate =>
      vatInsightIds.includes(candidate.candidateId),
    );

    expect(vatInsightCandidates.map(candidate => candidate.candidateId)).toEqual(vatInsightIds);
    expect(vatInsightCandidates.every(candidate => candidate.summary.length > 0)).toBe(true);
    expect(vatInsightCandidates.every(candidate => candidate.summary.includes('Metadata-only'))).toBe(true);
    expect(vatInsightCandidates.every(hasFiveTaxonomyAxes)).toBe(true);
    expect(vatInsightCandidates.every(candidate => candidate.approvalBoundary.approvedByEldad === false)).toBe(true);
    expect(vatInsightCandidates.every(candidate => candidate.bindingUse === 'none')).toBe(true);
    expect(vatInsightCandidates.every(candidate => ['pending_eldad_review', 'needs_source'].includes(candidate.status))).toBe(true);
  });

  it('keeps approved VAT insight seeds metadata-only without markdown body fields', () => {
    const vatInsightCandidates = LEARNING_STATIC_SEED.filter(candidate =>
      candidate.candidateId.startsWith('learning-insight-2026-04'),
    );
    const forbiddenBodyFields = ['body', 'content', 'markdown', 'markdownBody', 'rawContent'];

    expect(vatInsightCandidates).toHaveLength(2);
    expect(
      vatInsightCandidates.every(candidate =>
        candidate.sourceEvidence.every(
          evidence =>
            evidence.sourceReference.startsWith('insights/') &&
            evidence.allowedAccess === 'metadata_only' &&
            evidence.containsPrivateMaterial === false,
        ),
      ),
    ).toBe(true);

    for (const candidate of vatInsightCandidates) {
      for (const field of forbiddenBodyFields) {
        expect(Object.prototype.hasOwnProperty.call(candidate, field)).toBe(false);
      }
    }
  });

  it('records decision log entries with what, why, source, approvedAt, and appliesTo fields', () => {
    expect(Object.keys(approvedDecision)).toEqual(expect.arrayContaining(['what', 'why', 'source', 'approvedAt']));
    expect(approvedDecision.what).toContain('Approve');
    expect(approvedDecision.why).toContain('mock evidence');
    expect(approvedDecision.source).toBe(approvedEvidence.sourceReference);
    expect(approvedDecision.approvedAt).toBe('2026-05-03T00:10:00.000Z');
    expect(approvedDecision.appliesToKnowledgeDomains).toEqual(['מע"מ']);
    expect(approvedDecision.appliesToWorkflows).toEqual(['דיווח מע"מ']);
    expect(approvedDecision.appliesToOutputTypes).toEqual(['דוח']);
    expect(approvedDecision.appliesToEntities).toEqual(['כללי / ללא לקוח']);
    expect(approvedDecision.appliesToSourceChannels).toEqual(['ידני']);
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
