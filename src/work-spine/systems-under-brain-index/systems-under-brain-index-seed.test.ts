/* ==== FILE: src/work-spine/systems-under-brain-index/systems-under-brain-index-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { SYSTEMS_UNDER_BRAIN_INDEX_ROWS } from './systems-under-brain-index-seed';
import {
  SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS,
  SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE,
  SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS,
} from './systems-under-brain-index-types';
import type { SystemsUnderBrainIndexRow } from './systems-under-brain-index-types';
import seedSource from './systems-under-brain-index-seed.ts?raw';
import typesSource from './systems-under-brain-index-types.ts?raw';
import configSource from '../../../vitest.systems-under-brain-index.config.mjs?raw';
// #endregion

// #region Constants
const EXPECTED_SOURCE_IDS = [
  'work-spine-providers',
  'work-spine-intake',
  'work-spine-projection',
  'work-spine-read-model',
  'work-spine-runtime',
  'work-spine-use-cases',
  'accounting-core',
  'services',
  'store',
] as const;

const EXPECTED_ROWS = {
  'work-spine-providers': ['work-spine-providers', 'src/work-spine/providers/', 'work_spine_providers'],
  'work-spine-intake': ['work-spine-intake', 'src/work-spine/intake/', 'work_spine_intake'],
  'work-spine-projection': ['work-spine-projection', 'src/work-spine/projection/', 'work_spine_projection'],
  'work-spine-read-model': ['work-spine-read-model', 'src/work-spine/read-model/', 'work_spine_read_model'],
  'work-spine-runtime': ['work-spine-runtime', 'src/work-spine/runtime/', 'work_spine_runtime'],
  'work-spine-use-cases': ['work-spine-use-cases', 'src/work-spine/use-cases/', 'work_spine_use_cases'],
  'accounting-core': ['accounting-core', 'src/accounting-core/', 'accounting_core'],
  services: ['services', 'src/services/', 'services'],
  store: ['store', 'src/store/', 'store'],
} as const;

const TRUE_SAFETY_FLAGS = [
  'labelOnly',
  'staticOnly',
  'indexOnly',
  'fileNamesOnly',
] as const satisfies readonly (keyof SystemsUnderBrainIndexRow)[];

const FALSE_SAFETY_FLAGS = [
  'contentRead',
  'runtimeInvoked',
  'providerConnected',
  'operationalReady',
  'canCreateWorkItem',
  'canCreateMatter',
  'canCreateDocumentRef',
  'canPersist',
  'canAct',
] as const satisfies readonly (keyof SystemsUnderBrainIndexRow)[];

const BLOCKED_IMPORT_TERMS = [
  'fs',
  'path',
  'runtime',
  'provider',
  'providers',
  'store',
  'stores',
  'persistence',
  'Supabase',
  'DB',
] as const;

const BLOCKED_ENTITY_TERMS = ['WorkItem', 'Matter', 'DocumentRef'] as const;
const BLOCKED_CODE_NAME_PARTS = ['read', 'scan', 'mine', 'parse', 'ocr', 'connect', 'sync', 'persist', 'create', 'invoke', 'run'] as const;
// #endregion

// #region Helpers
const rowById = (sourceId: string): SystemsUnderBrainIndexRow => {
  const row = SYSTEMS_UNDER_BRAIN_INDEX_ROWS.find((candidate) => candidate.sourceId === sourceId);
  if (!row) throw new Error(`Missing row ${sourceId}`);
  return row;
};

const importLinesFrom = (sourceText: string): readonly string[] =>
  sourceText.split(/\r?\n/).filter((line) => line.trim().startsWith('import '));

const namedSymbolsFrom = (sourceText: string): readonly string[] => {
  const matches = sourceText.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z0-9_]+)/g);
  return [...matches].map((match) => match[1] ?? '');
};

const implementationSources = (): readonly string[] => [typesSource, seedSource, configSource];
// #endregion

// #region Tests
describe('SYSTEMS_UNDER_BRAIN_INDEX_ROWS', () => {
  it('exports the exact nine-row allowlist', () => {
    expect(SYSTEMS_UNDER_BRAIN_INDEX_ROWS.map((row) => row.sourceId)).toEqual([...EXPECTED_SOURCE_IDS]);

    for (const sourceId of EXPECTED_SOURCE_IDS) {
      const row = rowById(sourceId);
      const [label, locationHint, systemArea] = EXPECTED_ROWS[sourceId];

      expect(row.label).toBe(label);
      expect(row.locationHint).toBe(locationHint);
      expect(row.systemArea).toBe(systemArea);
    }
  });

  it('keeps every row label-only, static-only, index-only, and file-names-only', () => {
    for (const row of SYSTEMS_UNDER_BRAIN_INDEX_ROWS) {
      for (const flagName of TRUE_SAFETY_FLAGS) {
        expect(row[flagName]).toBe(true);
      }

      expect(row.safetyStatus).toBe(SYSTEMS_UNDER_BRAIN_INDEX_SAFETY_STATUS);
      expect(row.requiredGateBeforeUse).toBe(SYSTEMS_UNDER_BRAIN_INDEX_REQUIRED_GATE);
    }
  });

  it('keeps every runtime, provider, persistence, and action flag false', () => {
    for (const row of SYSTEMS_UNDER_BRAIN_INDEX_ROWS) {
      for (const flagName of FALSE_SAFETY_FLAGS) {
        expect(row[flagName]).toBe(false);
      }
    }
  });

  it('keeps blocked actions attached to every row', () => {
    for (const row of SYSTEMS_UNDER_BRAIN_INDEX_ROWS) {
      expect(row.blockedActions).toEqual([...SYSTEMS_UNDER_BRAIN_INDEX_BLOCKED_ACTIONS]);
    }
  });

  it('does not import filesystem, runtime, provider, store, persistence, or database modules', () => {
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
