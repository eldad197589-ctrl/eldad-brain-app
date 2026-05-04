/* ==== FILE: src/work-spine/knowledge-inventory/brain-knowledge-inventory-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS } from './brain-knowledge-inventory-seed';
import {
  BLOCKED_ACTIONS,
  BRAIN_KNOWLEDGE_INVENTORY_SAFETY_STATUS,
  CONFIDENCE_LEVELS,
  EVIDENCE_STATUSES,
  KNOWLEDGE_DOMAINS,
  KNOWLEDGE_SOURCE_TYPES,
  NEXT_SAFE_USES,
} from './brain-knowledge-inventory-types';
import type { BrainKnowledgeInventoryRecord } from './brain-knowledge-inventory-types';
// #endregion

// #region Constants
const REQUIRED_RECORD_FIELDS = [
  'knowledgeId',
  'title',
  'domain',
  'projectOrMatter',
  'sourceType',
  'sourceLocation',
  'whatWasLearned',
  'usableFor',
  'previewOnly',
  'staticOnly',
  'bindingKnowledge',
  'canExecute',
  'canPersist',
  'evidenceStatus',
  'confidence',
  'nextSafeUse',
  'blockedActions',
  'relatedCommits',
  'relatedRoutes',
  'sourceTrace',
  'safetyStatus',
] as const satisfies readonly (keyof BrainKnowledgeInventoryRecord)[];

const REQUIRED_KNOWLEDGE_IDS = [
  'knowledge-manual-workbench-preview-gates-v1',
  'knowledge-vat-static-evidence-reconciliation-v1',
  'knowledge-static-scanned-intake-batch-v1',
  'knowledge-dima-case-work-v1',
  'knowledge-tsila-wage-rights-payroll-v1',
  'knowledge-attendance-payroll-calculation-v1',
  'knowledge-robium-business-plan-salary-bureau-v1',
  'knowledge-war-compensation-red-route-v1',
  'knowledge-brain-operating-truth-governance-v1',
] as const;

const PHASE1_RECORD_COUNT = 9;

const PHASE2_EXPECTED_CLASSIFICATIONS = {
  'knowledge-phase2-proof-of-life-standard-v1': {
    evidenceStatus: 'committed_static',
    sourceLocation: 'commit:07cd8fa',
    confidence: 'high',
    nextSafeUse: 'preview_reference_only',
  },
  'knowledge-phase2-full-brain-blueprint-v1': {
    evidenceStatus: 'committed_static',
    sourceLocation: 'src/work-spine/blueprint',
    confidence: 'high',
    nextSafeUse: 'preview_reference_only',
  },
  'knowledge-phase2-robium-salary-clients-v1': {
    evidenceStatus: 'committed_static',
    sourceLocation: 'known-project-context/robium-salary-clients',
    confidence: 'medium',
    nextSafeUse: 'learning_queue_candidate',
  },
  'knowledge-phase2-vat-static-evidence-v1': {
    evidenceStatus: 'committed_static',
    sourceLocation: 'src/work-spine/vat-evidence',
    confidence: 'high',
    nextSafeUse: 'approval_gate_context',
  },
  'knowledge-phase2-scanned-evidence-batch-v1': {
    evidenceStatus: 'partial_static',
    sourceLocation: 'src/work-spine/scanned-evidence',
    confidence: 'medium',
    nextSafeUse: 'learning_queue_candidate',
  },
  'knowledge-phase2-knowledge-inventory-preview-v1': {
    evidenceStatus: 'partial_static',
    sourceLocation: 'planned:manual-workbench-knowledge-inventory-preview',
    confidence: 'medium',
    nextSafeUse: 'learning_queue_candidate',
  },
} as const;

const PHASE2_KNOWLEDGE_IDS = Object.keys(PHASE2_EXPECTED_CLASSIFICATIONS);

const REQUIRED_BLOCKED_ACTIONS = [
  'execute',
  'submit',
  'send',
  'post',
  'file',
  'create_operational_record',
  'create_work_item',
  'create_matter',
  'create_document_ref',
  'persist',
  'provider_action',
  'file_operation',
  'rag_write',
  'knowledge_binding',
  'agent_autonomy',
] as const;

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
  'D' + 'B',
  'local' + 'Storage',
  'O' + 'Auth',
  'Knowledge' + 'Search',
  'RAG ' + 'write',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
] as const;

const BLOCKED_EXECUTION_WORDS = [
  'exe' + 'cute',
  'sub' + 'mit',
  'se' + 'nd',
  'po' + 'st',
  'fi' + 'le',
  'cre' + 'ate',
  'per' + 'sist',
  'app' + 'rove',
  'final' + 'ize',
  'sy' + 'nc',
] as const;

const BLOCKED_EXCLUDED_CANDIDATE_TERMS = [
  'Gma' + 'il',
  'Supa' + 'base',
  'Mat' + 'ter workspace',
  'Mav' + 'en reconciliation drafts',
  'Dima legacy outputs',
  'Tsila untracked materials',
  'generated DOCX',
  'generated HTML',
] as const;

const UNSAFE_WORDS = [
  'live',
  'connected',
  'verified',
  'approved',
  'ready',
  'executed',
  'submitted',
  'created',
  'filed',
  'synced',
] as const;

const SAFE_NEGATIVE_PHRASES = [
  'no live',
  'without live',
  'separated from live',
  'not live',
  'no folder scan',
  'no document-content reading',
  'no client-data access',
] as const;

const ALLOWED_STATUS_VALUES = ['committed_static', 'partial_static', 'known_context_only'] as const;

const ALLOWED_ACTION_FIELD_KEYS = ['blockedActions', 'canExecute', 'canPersist'] as const;

const BLOCKED_FIELD_NAME_PARTS = [
  'callback',
  'handler',
  'run',
  'execute',
  'submit',
  'send',
  'post',
  'create',
  'persist',
  'action',
] as const;
// #endregion

// #region Helpers
const recordTextValuesWithoutBlockedActions = (record: BrainKnowledgeInventoryRecord): readonly string[] =>
  Object.entries(record)
    .filter(([fieldName]) => fieldName !== 'blockedActions')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string');

const serializedNonBlockedInventory = (): string =>
  BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS
    .flatMap((record) => recordTextValuesWithoutBlockedActions(record))
    .join(' ');

const satisfiesEvidenceRequirements = (record: BrainKnowledgeInventoryRecord): boolean =>
  record.evidenceStatus === 'committed_static';

const phase2Records = (): readonly BrainKnowledgeInventoryRecord[] =>
  BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.filter((record) => record.knowledgeId.startsWith('knowledge-phase2-'));

const findRecord = (knowledgeId: string): BrainKnowledgeInventoryRecord | undefined =>
  BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.find((record) => record.knowledgeId === knowledgeId);

const hasUnsafePositiveWording = (text: string, unsafeWord: string): boolean => {
  if (!text.toLowerCase().includes(unsafeWord)) return false;

  return !SAFE_NEGATIVE_PHRASES.some((safePhrase) => text.toLowerCase().includes(safePhrase));
};
// #endregion

// #region Tests
describe('BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS', () => {
  it('exports all Phase 1 inventory records', () => {
    const knowledgeIds = BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.map((record) => record.knowledgeId);

    expect(BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.length).toBeGreaterThanOrEqual(REQUIRED_KNOWLEDGE_IDS.length);
    for (const knowledgeId of REQUIRED_KNOWLEDGE_IDS) {
      expect(knowledgeIds).toContain(knowledgeId);
    }
  });

  it('keeps every required record field present', () => {
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      for (const fieldName of REQUIRED_RECORD_FIELDS) {
        expect(Object.prototype.hasOwnProperty.call(record, fieldName)).toBe(true);
      }
      expect(record.sourceLocation.trim()).not.toBe('');
      expect(record.whatWasLearned.trim()).not.toBe('');
      expect(record.usableFor.length).toBeGreaterThan(0);
      expect(record.sourceTrace.trim()).not.toBe('');
    }
  });

  it('keeps every record in static inventory safety mode', () => {
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      expect(record.previewOnly).toBe(true);
      expect(record.staticOnly).toBe(true);
      expect(record.bindingKnowledge).toBe(false);
      expect(record.canExecute).toBe(false);
      expect(record.canPersist).toBe(false);
      expect(record.safetyStatus).toBe(BRAIN_KNOWLEDGE_INVENTORY_SAFETY_STATUS);
    }
  });

  it('uses only allowed inventory values', () => {
    expect(EVIDENCE_STATUSES).toEqual([...ALLOWED_STATUS_VALUES]);
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      expect(KNOWLEDGE_DOMAINS).toContain(record.domain);
      expect(KNOWLEDGE_SOURCE_TYPES).toContain(record.sourceType);
      expect(EVIDENCE_STATUSES).toContain(record.evidenceStatus);
      expect(CONFIDENCE_LEVELS).toContain(record.confidence);
      expect(NEXT_SAFE_USES).toContain(record.nextSafeUse);
      for (const blockedAction of record.blockedActions) {
        expect(BLOCKED_ACTIONS).toContain(blockedAction);
      }
    }
  });

  it('does not let known context satisfy evidence requirements', () => {
    const contextOnlyRecords = BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.filter(
      (record) => record.evidenceStatus === 'known_context_only',
    );

    expect(contextOnlyRecords.length).toBeGreaterThan(0);
    for (const record of contextOnlyRecords) {
      expect(satisfiesEvidenceRequirements(record)).toBe(false);
      expect(record.nextSafeUse).toBe('learning_queue_candidate');
      expect(record.relatedCommits).toHaveLength(0);
    }
  });

  it('does not treat partial static context as committed evidence', () => {
    const partialRecords = BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS.filter(
      (record) => record.evidenceStatus === 'partial_static',
    );

    expect(partialRecords.length).toBeGreaterThan(0);
    for (const record of partialRecords) {
      expect(satisfiesEvidenceRequirements(record)).toBe(false);
      expect(record.nextSafeUse).toBe('learning_queue_candidate');
    }
  });

  it('includes blocked live actions where relevant', () => {
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      for (const blockedAction of REQUIRED_BLOCKED_ACTIONS) {
        expect(record.blockedActions).toContain(blockedAction);
      }
    }
  });

  it('adds exactly the six Phase 2 safe candidates', () => {
    const phase2KnowledgeIds = phase2Records().map((record) => record.knowledgeId);

    expect(BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS).toHaveLength(PHASE1_RECORD_COUNT + PHASE2_KNOWLEDGE_IDS.length);
    expect(phase2Records()).toHaveLength(PHASE2_KNOWLEDGE_IDS.length);
    for (const knowledgeId of PHASE2_KNOWLEDGE_IDS) {
      expect(phase2KnowledgeIds).toContain(knowledgeId);
    }
  });

  it('matches the aligned Phase 2 classification table exactly', () => {
    for (const [knowledgeId, expectedClassification] of Object.entries(PHASE2_EXPECTED_CLASSIFICATIONS)) {
      const record = findRecord(knowledgeId);

      expect(record).toBeDefined();
      expect(record?.evidenceStatus).toBe(expectedClassification.evidenceStatus);
      expect(record?.sourceLocation).toBe(expectedClassification.sourceLocation);
      expect(record?.confidence).toBe(expectedClassification.confidence);
      expect(record?.nextSafeUse).toBe(expectedClassification.nextSafeUse);
    }
  });

  it('keeps excluded Phase 2 candidates out of exported values', () => {
    for (const excludedTerm of BLOCKED_EXCLUDED_CANDIDATE_TERMS) {
      expect(serializedNonBlockedInventory()).not.toContain(excludedTerm);
    }
  });

  it('keeps full blocked actions on every Phase 2 candidate', () => {
    for (const record of phase2Records()) {
      expect(record.blockedActions).toEqual([...REQUIRED_BLOCKED_ACTIONS]);
      expect(record.previewOnly).toBe(true);
      expect(record.staticOnly).toBe(true);
      expect(record.bindingKnowledge).toBe(false);
      expect(record.canExecute).toBe(false);
      expect(record.canPersist).toBe(false);
    }
  });

  it('does not expose function, callback, or action fields on inventory records', () => {
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      for (const value of Object.values(record)) {
        expect(typeof value).not.toBe('function');
      }
      for (const fieldName of Object.keys(record)) {
        if (ALLOWED_ACTION_FIELD_KEYS.includes(fieldName as (typeof ALLOWED_ACTION_FIELD_KEYS)[number])) continue;
        for (const blockedPart of BLOCKED_FIELD_NAME_PARTS) {
          expect(fieldName.toLowerCase()).not.toContain(blockedPart);
        }
      }
    }
  });

  it('does not expose blocked runtime words outside blocked action markers', () => {
    for (const blockedWord of BLOCKED_RUNTIME_WORDS) {
      expect(serializedNonBlockedInventory()).not.toContain(blockedWord);
    }
  });

  it('does not expose execution wording outside blocked action markers', () => {
    for (const blockedWord of BLOCKED_EXECUTION_WORDS) {
      expect(serializedNonBlockedInventory()).not.toContain(blockedWord);
    }
  });

  it('does not expose unsafe positive wording in descriptive values', () => {
    for (const unsafeWord of UNSAFE_WORDS) {
      expect(hasUnsafePositiveWording(serializedNonBlockedInventory(), unsafeWord)).toBe(false);
    }
  });

  it('does not expose runtime write, persistence, or connector behavior', () => {
    for (const record of BRAIN_KNOWLEDGE_INVENTORY_PHASE1_RECORDS) {
      expect(record.canExecute).toBe(false);
      expect(record.canPersist).toBe(false);
      expect(record.blockedActions).toContain('persist');
      expect(record.blockedActions).toContain('provider_action');
      expect(record.blockedActions).toContain('rag_write');
    }
  });
});
// #endregion
