/* ==== FILE: src/work-spine/scanned-evidence/scanned-evidence-static-batch.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  STATIC_SCANNED_EVIDENCE_BATCH,
  STATIC_SCANNED_EVIDENCE_BATCHES,
} from './scanned-evidence-static-batch';
import {
  CONFIDENCE_LEVELS,
  DOCUMENT_KINDS,
  DUPLICATE_RISK_LEVELS,
  PROFESSIONAL_DOMAINS,
  SCANNED_EVIDENCE_SAFETY_STATUS,
  SUGGESTED_ACTION_PREVIEWS,
} from './scanned-evidence-types';
import type { MissingField, ScannedEvidenceCandidate } from './scanned-evidence-types';
// #endregion

// #region Test Constants
const REQUIRED_CANDIDATE_FIELDS = [
  'evidenceId',
  'batchId',
  'sourceFileName',
  'sourceFolderLabel',
  'documentKind',
  'professionalDomain',
  'clientOrMatterGuess',
  'counterparty',
  'supplier',
  'authority',
  'employee',
  'documentDate',
  'periodDescription',
  'amountIfKnown',
  'vatIfRelevant',
  'deadlineIfRelevant',
  'externalSystemStatusIfKnown',
  'duplicateRisk',
  'suggestedActionPreview',
  'missingFields',
  'sourceTrace',
  'confidence',
  'safetyStatus',
] as const;

const NULL_FIELD_TO_MISSING_FIELD = {
  clientOrMatterGuess: 'client_or_matter',
  counterparty: 'counterparty',
  supplier: 'supplier',
  authority: 'authority',
  employee: 'employee',
  documentDate: 'document_date',
  periodDescription: 'period',
  amountIfKnown: 'amount',
  vatIfRelevant: 'vat',
  deadlineIfRelevant: 'deadline',
  externalSystemStatusIfKnown: 'external_status',
} as const satisfies Record<string, MissingField>;

const BLOCKED_RUNTIME_WORDS = [
  'f' + 's',
  'pa' + 'th',
  'xl' + 'sx',
  'O' + 'CR',
  'pro' + 'vider',
  'Gma' + 'il',
  'Dri' + 've',
  'Mav' + 'en',
  'fet' + 'ch',
  'Supa' + 'base',
  'sto' + 're',
] as const;

const BLOCKED_OUTPUT_WORDS = [
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'post' + 'ing',
  'create ' + 'task',
  'se' + 'nd',
  'sub' + 'mit',
] as const;
// #endregion

// #region Helpers
/**
 * Return every static scanned evidence candidate.
 * @returns Flattened static scanned evidence candidates.
 */
const allCandidates = (): readonly ScannedEvidenceCandidate[] =>
  STATIC_SCANNED_EVIDENCE_BATCHES.flatMap((batch) => batch.candidates);

/**
 * Return scalar values from a static candidate.
 * @param candidate - Static candidate to inspect.
 * @returns Candidate scalar values only.
 */
const candidateScalarValues = (candidate: ScannedEvidenceCandidate): readonly string[] =>
  Object.values(candidate).filter((value): value is string => typeof value === 'string');
// #endregion

// #region Tests
describe('STATIC_SCANNED_EVIDENCE_BATCHES', () => {
  it('exports at least one static batch', () => {
    expect(STATIC_SCANNED_EVIDENCE_BATCHES.length).toBeGreaterThan(0);
    expect(STATIC_SCANNED_EVIDENCE_BATCH.candidates.length).toBe(9);
  });

  it('marks the source channel and creation source as static snapshot seed values', () => {
    for (const batch of STATIC_SCANNED_EVIDENCE_BATCHES) {
      expect(batch.sourceChannel).toBe('scans_folder_static_snapshot');
      expect(batch.createdFrom).toBe('static_manual_seed');
    }
  });

  it('keeps every candidate in static preview safety mode', () => {
    for (const candidate of allCandidates()) {
      expect(candidate.safetyStatus).toBe(SCANNED_EVIDENCE_SAFETY_STATUS);
    }
  });

  it('keeps every required candidate field present', () => {
    for (const candidate of allCandidates()) {
      for (const fieldName of REQUIRED_CANDIDATE_FIELDS) {
        expect(fieldName in candidate).toBe(true);
      }
    }
  });

  it('represents null values in missing fields', () => {
    for (const candidate of allCandidates()) {
      for (const [fieldName, missingField] of Object.entries(NULL_FIELD_TO_MISSING_FIELD)) {
        const candidateField = fieldName as keyof typeof NULL_FIELD_TO_MISSING_FIELD;

        if (candidate[candidateField] === null) {
          expect(candidate.missingFields).toContain(missingField);
        }
      }
    }
  });

  it('uses only allowed classification and risk values', () => {
    for (const candidate of allCandidates()) {
      expect(DOCUMENT_KINDS).toContain(candidate.documentKind);
      expect(PROFESSIONAL_DOMAINS).toContain(candidate.professionalDomain);
      expect(CONFIDENCE_LEVELS).toContain(candidate.confidence);
      expect(DUPLICATE_RISK_LEVELS).toContain(candidate.duplicateRisk);
      expect(SUGGESTED_ACTION_PREVIEWS).toContain(candidate.suggestedActionPreview);
    }
  });

  it('does not expose blocked integration words in static values', () => {
    const serializedValues = allCandidates()
      .flatMap((candidate) => candidateScalarValues(candidate))
      .join(' ');

    for (const blockedWord of BLOCKED_RUNTIME_WORDS) {
      expect(serializedValues).not.toContain(blockedWord);
    }
  });

  it('does not expose execution wording in static values', () => {
    const serializedValues = allCandidates()
      .flatMap((candidate) => candidateScalarValues(candidate))
      .join(' ');

    for (const blockedWord of BLOCKED_OUTPUT_WORDS) {
      expect(serializedValues).not.toContain(blockedWord);
    }
  });
});
// #endregion
