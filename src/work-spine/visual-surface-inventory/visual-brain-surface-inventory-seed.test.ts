/* ==== FILE: src/work-spine/visual-surface-inventory/visual-brain-surface-inventory-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS } from './visual-brain-surface-inventory-seed';
import {
  VISUAL_SURFACE_BLOCKED_ACTIONS,
  VISUAL_SURFACE_CLASSIFICATIONS,
} from './visual-brain-surface-inventory-types';
import type {
  VisualBrainSurfaceInventoryRecord,
  VisualSurfaceClassification,
} from './visual-brain-surface-inventory-types';
// #endregion

// #region Constants
const EXPECTED_SURFACE_CLASSIFICATIONS = {
  'visual-dashboard-brain-v1': 'static_visual',
  'visual-brain-router-flowcharts-v1': 'static_visual',
  'visual-office-ops-flows-v1': 'static_visual',
  'visual-robium-business-pages-v1': 'static_visual',
  'visual-internal-manual-workbench-v1': 'preview_only',
  'visual-internal-intake-previews-v1': 'preview_only',
  'visual-approval-learning-diagnostics-v1': 'preview_only',
  'visual-ceo-bureau-v1': 'live_mutation_capable',
  'visual-global-navigation-active-cases-v1': 'live_mutation_capable',
  'visual-clients-cases-v1': 'live_mutation_capable',
  'visual-tools-engines-v1': 'live_mutation_capable',
  'visual-work-spine-board-v1': 'live_mutation_capable',
  'visual-settings-integrations-v1': 'live_mutation_capable',
  'visual-dima-case-surface-v1': 'unknown_needs_audit',
  'visual-tsila-case-surface-v1': 'unknown_needs_audit',
  'visual-matter-workspace-v1': 'unknown_needs_audit',
} as const satisfies Record<string, VisualSurfaceClassification>;

const REQUIRED_RECORD_FIELDS = [
  'surfaceId',
  'label',
  'routeOrPath',
  'surfaceType',
  'visualPresenceOnly',
  'classification',
  'classificationReason',
  'audited',
  'auditStatus',
  'proofOfLifeStatus',
  'mutationCapable',
  'liveProviderCapable',
  'persistenceCapable',
  'fileOperationCapable',
  'operationalCreationCapable',
  'blockedActions',
  'requiredAuditBeforeUse',
  'knownRisks',
  'mustNotInfer',
] as const satisfies readonly (keyof VisualBrainSurfaceInventoryRecord)[];

const BANNED_WORDING = [
  'sa' + 'fe',
  'app' + 'roved',
  'rea' + 'dy',
  'com' + 'plete',
  'ver' + 'ified',
  'opera' + 'tional',
  'live-' + 'ready',
  'production-' + 'ready',
  'can exe' + 'cute',
  'can cre' + 'ate',
  'can fi' + 'le',
  'can sub' + 'mit',
  'source ver' + 'ified',
  'professionally correct',
  'safe to use',
] as const;

const FORBIDDEN_RUNTIME_TERMS = [
  'pro' + 'viders',
  'O' + 'CR',
  'P' + 'DF',
  'Ex' + 'cel',
  'Mav' + 'en',
  'Gma' + 'il',
  'Dri' + 've',
  'f' + 's',
  'pa' + 'th',
  'xl' + 'sx',
  'fet' + 'ch',
  'Supa' + 'base',
  'D' + 'B',
  'sto' + 're',
  'per' + 'sistence',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
] as const;
// #endregion

// #region Helpers
const expectedSurfaceIds = (): readonly string[] => Object.keys(EXPECTED_SURFACE_CLASSIFICATIONS);

const surfaceIds = (): readonly string[] =>
  VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.map((record) => record.surfaceId);

const findRecord = (surfaceId: string): VisualBrainSurfaceInventoryRecord => {
  const record = VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.find((surface) => surface.surfaceId === surfaceId);

  if (!record) {
    throw new Error(`Missing surface record ${surfaceId}`);
  }

  return record;
};

const nonBlockedTextValues = (record: VisualBrainSurfaceInventoryRecord): readonly string[] =>
  Object.entries(record)
    .filter(([fieldName]) => fieldName !== 'blockedActions' && fieldName !== 'mustNotInfer')
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string');

const runtimeBoundaryTextValues = (record: VisualBrainSurfaceInventoryRecord): readonly string[] =>
  Object.entries(record)
    .filter(
      ([fieldName]) =>
        !['blockedActions', 'mustNotInfer', 'surfaceId', 'label', 'routeOrPath'].includes(fieldName),
    )
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string');

const serializedNonBlockedText = (): string =>
  VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.flatMap(nonBlockedTextValues).join(' ');

const serializedRuntimeBoundaryText = (): string =>
  VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.flatMap(runtimeBoundaryTextValues).join(' ');
// #endregion

// #region Tests
describe('VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS', () => {
  it('exports exactly the 16 initial visual surface records', () => {
    expect(VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS).toHaveLength(16);
    expect(surfaceIds().sort()).toEqual([...expectedSurfaceIds()].sort());
  });

  it('includes every required field on every record', () => {
    for (const record of VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS) {
      for (const fieldName of REQUIRED_RECORD_FIELDS) {
        expect(record).toHaveProperty(fieldName);
      }
    }
  });

  it('marks every record as visual presence only', () => {
    for (const record of VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS) {
      expect(record.visualPresenceOnly).toBe(true);
      expect(record.audited).toBe(false);
    }
  });

  it('matches the approved classification table exactly', () => {
    for (const [surfaceId, classification] of Object.entries(EXPECTED_SURFACE_CLASSIFICATIONS)) {
      expect(findRecord(surfaceId).classification).toBe(classification);
    }

    for (const record of VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS) {
      expect(VISUAL_SURFACE_CLASSIFICATIONS).toContain(record.classification);
    }
  });

  it('marks mutation-capable records with at least one relevant capability flag', () => {
    const records = VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.filter(
      (record) => record.classification === 'live_mutation_capable',
    );

    for (const record of records) {
      expect(
        record.mutationCapable || record.operationalCreationCapable || record.persistenceCapable,
      ).toBe(true);
    }
  });

  it('keeps preview-only records free of execution and retention capability flags', () => {
    const records = VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.filter(
      (record) => record.classification === 'preview_only',
    );

    for (const record of records) {
      expect(record.mutationCapable).toBe(false);
      expect(record.persistenceCapable).toBe(false);
      expect(record.operationalCreationCapable).toBe(false);
      expect(record.fileOperationCapable).toBe(false);
      expect(record.liveProviderCapable).toBe(false);
    }
  });

  it('requires audit before use for unknown records', () => {
    const records = VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS.filter(
      (record) => record.classification === 'unknown_needs_audit',
    );

    for (const record of records) {
      expect(record.requiredAuditBeforeUse).toBe(true);
      expect(record.auditStatus).toBe('requires_targeted_audit');
    }
  });

  it('includes must-not-infer boundaries and full blocked actions on every record', () => {
    for (const record of VISUAL_BRAIN_SURFACE_INVENTORY_RECORDS) {
      expect(record.mustNotInfer.length).toBeGreaterThan(0);
      expect(record.blockedActions).toEqual(VISUAL_SURFACE_BLOCKED_ACTIONS);
    }
  });

  it('does not use banned wording outside blocked or negative context fields', () => {
    const searchableText = serializedNonBlockedText().toLowerCase();

    for (const bannedWord of BANNED_WORDING) {
      expect(searchableText).not.toContain(bannedWord.toLowerCase());
    }
  });

  it('does not include forbidden runtime or object terms in non-blocked record text', () => {
    const searchableText = serializedRuntimeBoundaryText();

    for (const forbiddenTerm of FORBIDDEN_RUNTIME_TERMS) {
      expect(searchableText).not.toContain(forbiddenTerm);
    }
  });
});
// #endregion
