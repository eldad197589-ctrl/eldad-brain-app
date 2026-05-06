/* ==== FILE: src/work-spine/gravity-source-index/gravity-source-index-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { GRAVITY_SOURCE_INDEX_ROWS } from './gravity-source-index-seed';
import {
  GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS,
  GRAVITY_SOURCE_INDEX_REQUIRED_GATE,
  GRAVITY_SOURCE_INDEX_SAFETY_STATUS,
} from './gravity-source-index-types';
import type { GravitySourceIndexRow } from './gravity-source-index-types';
import seedSource from './gravity-source-index-seed.ts?raw';
import typesSource from './gravity-source-index-types.ts?raw';
import configSource from '../../../vitest.gravity-source-index.config.mjs?raw';
// #endregion

// #region Constants
const EXPECTED_SOURCE_IDS = [
  'gravity-ingestion-vault-root-v1',
  'gravity-ingestion-raw-queue-v1',
  'gravity-ingestion-processing-v1',
  'gravity-ingestion-archived-v1',
  'gravity-generated-output-root-v1',
  'gravity-generated-output-archive-v1',
  'gravity-public-legacy-v1',
  'gravity-case-packages-root-v1',
  'gravity-dima-case-package-final-v1',
  'gravity-general-case-package-final-v1',
  'gravity-dima-engine-artifacts-v1',
  'gravity-dima-source-docs-label-v1',
  'gravity-static-case-data-artifacts-v1',
  'gravity-parallel-build-areas-v1',
  'gravity-screenshot-artifacts-v1',
  'gravity-scans-root-v1',
  'gravity-scans-dima-red-route-v1',
  'gravity-scans-vat-periods-v1',
  'gravity-scans-robium-v1',
  'gravity-scans-labor-law-v1',
  'gravity-scans-email-downloads-v1',
] as const;

const EXPECTED_ROWS = {
  'gravity-ingestion-vault-root-v1': [
    'Gravity ingestion vault root',
    'gravity_ingestion_vault/',
    null,
    'ingestion_vault',
  ],
  'gravity-ingestion-raw-queue-v1': [
    'raw mining queue',
    'gravity_ingestion_vault/1_raw_mining_queue/',
    'gravity-ingestion-vault-root-v1',
    'ingestion_queue',
  ],
  'gravity-ingestion-processing-v1': [
    'processing by brain',
    'gravity_ingestion_vault/2_processing_by_brain/',
    'gravity-ingestion-vault-root-v1',
    'processing_queue',
  ],
  'gravity-ingestion-archived-v1': [
    'extracted and archived',
    'gravity_ingestion_vault/3_extracted_and_archived/',
    'gravity-ingestion-vault-root-v1',
    'ingestion_queue',
  ],
  'gravity-generated-output-root-v1': ['generated output folder', 'brain-app/output/', null, 'generated_output'],
  'gravity-generated-output-archive-v1': [
    'generated output archive',
    'brain-app/output/archive/',
    'gravity-generated-output-root-v1',
    'generated_output_archive',
  ],
  'gravity-public-legacy-v1': ['public legacy generated HTML', 'brain-app/public/legacy/', null, 'legacy_generated'],
  'gravity-case-packages-root-v1': ['case packages root', 'brain-app/cases/', null, 'case_package_area'],
  'gravity-dima-case-package-final-v1': [
    'Dima final package area',
    'brain-app/cases/dima-rodnitski/final/',
    'gravity-case-packages-root-v1',
    'case_package_area',
  ],
  'gravity-general-case-package-final-v1': [
    'general final package area',
    'brain-app/cases/general/final/',
    'gravity-case-packages-root-v1',
    'case_package_area',
  ],
  'gravity-dima-engine-artifacts-v1': ['Dima engine artifacts', 'engine_dima_case/', null, 'case_artifact_area'],
  'gravity-dima-source-docs-label-v1': [
    'Dima source docs label',
    'engine_dima_case/source-docs/',
    'gravity-dima-engine-artifacts-v1',
    'source_folder_label',
  ],
  'gravity-static-case-data-artifacts-v1': [
    'static case data artifacts',
    'brain-app/src/data/*dima*; brain-app/src/data/*tsila*; brain-app/src/data/Dima_Submission_Bundle.zip',
    null,
    'static_code_artifact',
  ],
  'gravity-parallel-build-areas-v1': ['parallel build areas', 'parallel_build_*/', null, 'legacy_build_area'],
  'gravity-screenshot-artifacts-v1': [
    'purchase and sale screenshots',
    'purchase_screenshots/; sale_screenshots/',
    null,
    'screenshot_artifact_area',
  ],
  'gravity-scans-root-v1': ['scans root', 'סריקות/', null, 'document_label_area'],
  'gravity-scans-dima-red-route-v1': [
    'Dima red-route scan label',
    'סריקות/בניית ערר או השגה דימה פיצוי מלחמה מסלול אדום/',
    'gravity-scans-root-v1',
    'document_batch_label',
  ],
  'gravity-scans-vat-periods-v1': [
    'VAT period scan labels',
    'סריקות/חומר למע דוד אלדד 3-4.26/; סריקות/חומר למעמ דוד אלדד 1-2.26/',
    'gravity-scans-root-v1',
    'document_batch_label',
  ],
  'gravity-scans-robium-v1': [
    'Robium scan label',
    'סריקות/טיפול שוטף רוביום/',
    'gravity-scans-root-v1',
    'document_batch_label',
  ],
  'gravity-scans-labor-law-v1': [
    'labor-law scan labels',
    'סריקות/מסמכים בכורי פריש בדיקת דיני עבודה/; סריקות/מסמכים שונים סיירת א.ח ראשון בביטחון בעמ/',
    'gravity-scans-root-v1',
    'document_batch_label',
  ],
  'gravity-scans-email-downloads-v1': [
    'email-download scan batches',
    'סריקות/סריקות2026-05-05_דחוף_מסמכים_מהמייל/; סריקות/סריקות2026-05-06_הורדה מדפי בנק אישור העברה לקיריל הלוואה 5000 שח/',
    'gravity-scans-root-v1',
    'document_batch_label',
  ],
} as const;

const TRUE_SAFETY_FLAGS = [
  'labelOnly',
  'staticOnly',
  'indexOnly',
  'sourceAuditRequired',
  'nonOperational',
] as const satisfies readonly (keyof GravitySourceIndexRow)[];

const FALSE_SAFETY_FLAGS = [
  'contentUseAllowed',
  'contentAccessAllowed',
  'ocrAllowed',
  'providerAccessAllowed',
  'finalUseAllowed',
  'evidenceUseAllowed',
  'operationalObjectAllowed',
  'stateWriteAllowed',
  'canAct',
] as const satisfies readonly (keyof GravitySourceIndexRow)[];

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
const BLOCKED_CODE_NAME_PARTS = ['read', 'scan', 'mine', 'parse', 'ocr', 'connect', 'sync', 'persist', 'create', 'move', 'archive'] as const;
const FINALITY_WORDING = ['client evidence', 'professional finality', 'professional conclusion', 'verified evidence', 'approved final', 'binding source'];
// #endregion

// #region Helpers
const rowById = (sourceId: string): GravitySourceIndexRow => {
  const row = GRAVITY_SOURCE_INDEX_ROWS.find((candidate) => candidate.sourceId === sourceId);
  if (!row) throw new Error(`Missing row ${sourceId}`);
  return row;
};

const rowDisplayText = (row: GravitySourceIndexRow): string =>
  [row.sourceId, row.label, row.locationHint, row.parentSourceId, row.sourceClass, row.requiredGateBeforeUse]
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
describe('GRAVITY_SOURCE_INDEX_ROWS', () => {
  it('exports the exact 21-row allowlist', () => {
    expect(GRAVITY_SOURCE_INDEX_ROWS.map((row) => row.sourceId)).toEqual([...EXPECTED_SOURCE_IDS]);

    for (const sourceId of EXPECTED_SOURCE_IDS) {
      const row = rowById(sourceId);
      const [label, locationHint, parentSourceId, sourceClass] = EXPECTED_ROWS[sourceId];

      expect(row.label).toBe(label);
      expect(row.locationHint).toBe(locationHint);
      expect(row.parentSourceId).toBe(parentSourceId);
      expect(row.sourceClass).toBe(sourceClass);
    }
  });

  it('keeps every row label-only, static-only, and index-only', () => {
    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      for (const flagName of TRUE_SAFETY_FLAGS) {
        expect(row[flagName]).toBe(true);
      }

      expect(row.safetyStatus).toBe(GRAVITY_SOURCE_INDEX_SAFETY_STATUS);
      expect(row.requiredGateBeforeUse).toBe(GRAVITY_SOURCE_INDEX_REQUIRED_GATE);
    }
  });

  it('requires source audit on every row', () => {
    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      expect(row.sourceAuditRequired).toBe(true);
    }
  });

  it('keeps every row non-operational', () => {
    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      expect(row.nonOperational).toBe(true);
    }
  });

  it('keeps every denied safety flag false', () => {
    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      for (const flagName of FALSE_SAFETY_FLAGS) {
        expect(row[flagName]).toBe(false);
      }
    }
  });

  it('keeps blocked actions attached to every row', () => {
    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      expect(row.blockedActions).toEqual([...GRAVITY_SOURCE_INDEX_BLOCKED_ACTIONS]);
    }
  });

  it('does not add client evidence or professional finality wording', () => {
    const displayText = GRAVITY_SOURCE_INDEX_ROWS.map((row) => rowDisplayText(row)).join(' ').toLowerCase();

    for (const blockedText of FINALITY_WORDING) {
      expect(displayText).not.toContain(blockedText);
    }

    for (const row of GRAVITY_SOURCE_INDEX_ROWS) {
      expect(row.evidenceUseAllowed).toBe(false);
      expect(row.finalUseAllowed).toBe(false);
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
