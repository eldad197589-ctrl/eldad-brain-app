/* ==== FILE: src/work-spine/knowledge-base-index/knowledge-base-index-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_BASE_INDEX_ROWS } from './knowledge-base-index-seed';
import {
  KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS,
  KNOWLEDGE_BASE_INDEX_REQUIRED_GATE,
  KNOWLEDGE_BASE_INDEX_SAFETY_STATUS,
} from './knowledge-base-index-types';
import type { KnowledgeBaseIndexRow } from './knowledge-base-index-types';
import seedSource from './knowledge-base-index-seed.ts?raw';
import typesSource from './knowledge-base-index-types.ts?raw';
import configSource from '../../../vitest.knowledge-base-index.config.mjs?raw';
// #endregion

// #region Constants
const EXPECTED_SOURCE_IDS = [
  'kb-root-knowledge-base-v1',
  'kb-tax-root-v1',
  'kb-tax-income-tax-v1',
  'kb-tax-income-tax-section-102-102a-v1',
  'kb-tax-vat-v1',
  'kb-tax-vat-maven-reconciliation-examples-v1',
  'kb-tax-vat-maven-reconciliation-2026-01-02-v1',
  'kb-tax-vat-maven-training-v1',
] as const;

const EXPECTED_ROWS = {
  'kb-root-knowledge-base-v1': ['Knowledge_Base', 'Knowledge_Base/', null],
  'kb-tax-root-v1': ['tax', 'Knowledge_Base/tax/', 'kb-root-knowledge-base-v1'],
  'kb-tax-income-tax-v1': ['income_tax', 'Knowledge_Base/tax/income_tax/', 'kb-tax-root-v1'],
  'kb-tax-income-tax-section-102-102a-v1': [
    'section_102_102a',
    'Knowledge_Base/tax/income_tax/section_102_102a/',
    'kb-tax-income-tax-v1',
  ],
  'kb-tax-vat-v1': ['vat', 'Knowledge_Base/tax/vat/', 'kb-tax-root-v1'],
  'kb-tax-vat-maven-reconciliation-examples-v1': [
    'maven_reconciliation_examples',
    'Knowledge_Base/tax/vat/maven_reconciliation_examples/',
    'kb-tax-vat-v1',
  ],
  'kb-tax-vat-maven-reconciliation-2026-01-02-v1': [
    '2026_01_02_vat_close',
    'Knowledge_Base/tax/vat/maven_reconciliation_examples/2026_01_02_vat_close/',
    'kb-tax-vat-maven-reconciliation-examples-v1',
  ],
  'kb-tax-vat-maven-training-v1': [
    'maven_training',
    'Knowledge_Base/tax/vat/maven_training/',
    'kb-tax-vat-v1',
  ],
} as const;

const FALSE_SAFETY_FLAGS = [
  'contentRead',
  'folderRead',
  'contentMined',
  'ocrPerformed',
  'providerConnected',
  'professionalConclusion',
  'clientEvidence',
  'sourceVerified',
  'canCreateWorkItem',
  'canCreateMatter',
  'canCreateDocumentRef',
  'canPersist',
  'canAct',
] as const satisfies readonly (keyof KnowledgeBaseIndexRow)[];

const BLOCKED_IMPORT_TERMS = [
  'fs',
  'path',
  'OCR',
  'providers',
  'API',
  'OAuth',
  'stores',
  'persistence',
  'Supabase',
  'DB',
] as const;

const BLOCKED_ENTITY_TERMS = ['WorkItem', 'Matter', 'DocumentRef'] as const;
const BLOCKED_CODE_NAME_PARTS = ['read', 'scan', 'mine', 'parse', 'ocr', 'connect', 'sync', 'persist', 'create'] as const;
const PROFESSIONAL_WORDING = ['conclusion made', 'verified source', 'approved source', 'binding rule', 'client evidence'];
// #endregion

// #region Helpers
const rowById = (sourceId: string): KnowledgeBaseIndexRow => {
  const row = KNOWLEDGE_BASE_INDEX_ROWS.find((candidate) => candidate.sourceId === sourceId);
  if (!row) throw new Error(`Missing row ${sourceId}`);
  return row;
};

const rowDisplayText = (row: KnowledgeBaseIndexRow): string =>
  [row.sourceId, row.label, row.locationHint, row.parentSourceId, row.domain, row.requiredGateBeforeAccess]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

const importLinesFrom = (sourceText: string): readonly string[] =>
  sourceText.split(/\r?\n/).filter((line) => line.trim().startsWith('import '));

const namedSymbolsFrom = (sourceText: string): readonly string[] => {
  const matches = sourceText.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z0-9_]+)/g);
  return [...matches].map((match) => match[1] ?? '');
};

const implementationSources = (): readonly string[] => [typesSource, seedSource, configSource];
// #endregion

// #region Tests
describe('KNOWLEDGE_BASE_INDEX_ROWS', () => {
  it('exports the exact eight-row allowlist', () => {
    expect(KNOWLEDGE_BASE_INDEX_ROWS.map((row) => row.sourceId)).toEqual([...EXPECTED_SOURCE_IDS]);

    for (const sourceId of EXPECTED_SOURCE_IDS) {
      const row = rowById(sourceId);
      const [label, locationHint, parentSourceId] = EXPECTED_ROWS[sourceId];

      expect(row.label).toBe(label);
      expect(row.locationHint).toBe(locationHint);
      expect(row.parentSourceId).toBe(parentSourceId);
    }
  });

  it('keeps every row label-only and static-only', () => {
    for (const row of KNOWLEDGE_BASE_INDEX_ROWS) {
      expect(row.labelOnly).toBe(true);
      expect(row.staticOnly).toBe(true);
      expect(row.safetyStatus).toBe(KNOWLEDGE_BASE_INDEX_SAFETY_STATUS);
      expect(row.requiredGateBeforeAccess).toBe(KNOWLEDGE_BASE_INDEX_REQUIRED_GATE);
    }
  });

  it('keeps every denied safety flag false', () => {
    for (const row of KNOWLEDGE_BASE_INDEX_ROWS) {
      for (const flagName of FALSE_SAFETY_FLAGS) {
        expect(row[flagName]).toBe(false);
      }
    }
  });

  it('keeps blocked actions attached to every row', () => {
    for (const row of KNOWLEDGE_BASE_INDEX_ROWS) {
      expect(row.blockedActions).toEqual([...KNOWLEDGE_BASE_INDEX_BLOCKED_ACTIONS]);
    }
  });

  it('does not add professional conclusion wording', () => {
    const displayText = KNOWLEDGE_BASE_INDEX_ROWS.map((row) => rowDisplayText(row)).join(' ').toLowerCase();

    for (const blockedText of PROFESSIONAL_WORDING) {
      expect(displayText).not.toContain(blockedText);
    }
  });

  it('does not classify any row as client evidence', () => {
    for (const row of KNOWLEDGE_BASE_INDEX_ROWS) {
      expect(row.clientEvidence).toBe(false);
      expect(rowDisplayText(row).toLowerCase()).not.toContain('client_evidence');
    }
  });

  it('does not import runtime folders, providers, storage, or database modules', () => {
    const importText = implementationSources().flatMap((sourceText) => importLinesFrom(sourceText)).join('\n');

    for (const blockedTerm of BLOCKED_IMPORT_TERMS) {
      expect(importText).not.toContain(blockedTerm);
    }
  });

  it('does not import operational entity contracts', () => {
    const importText = implementationSources().flatMap((sourceText) => importLinesFrom(sourceText)).join('\n');

    for (const blockedTerm of BLOCKED_ENTITY_TERMS) {
      expect(importText).not.toContain(blockedTerm);
    }
  });

  it('does not add executable code paths with blocked names', () => {
    const symbolNames = implementationSources().flatMap((sourceText) => namedSymbolsFrom(sourceText));

    for (const symbolName of symbolNames) {
      for (const blockedPart of BLOCKED_CODE_NAME_PARTS) {
        expect(symbolName.toLowerCase()).not.toContain(blockedPart);
      }
    }
  });
});
// #endregion
