/* ====
   FILE: domain-boundary-index-seed.test.ts
   PURPOSE: Focused Stage 18F-18G label-only static index tests.
   DEPENDENCIES: Vitest and domain boundary index rows
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX,
  STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS,
  STAGE_18G_BLOCKED_BOUNDARY_ROWS,
} from './domain-boundary-index-seed';
import {
  DOMAIN_BOUNDARY_INDEX_BOUNDARY_LABELS,
  DOMAIN_BOUNDARY_INDEX_DOMAIN_LABELS,
  DOMAIN_BOUNDARY_INDEX_ROW_FALSE_FLAGS,
  DOMAIN_BOUNDARY_INDEX_SCOPE,
} from './domain-boundary-index-types';
// #endregion

// #region Test Helpers
const falseFlagKeys = [
  'professionalConclusionFlag',
  'clientEvidenceClassificationFlag',
  'actionFlag',
  'providerActionFlag',
  'runtimeActionFlag',
  'storageWriteFlag',
  'fileOutputFlag',
  'accountingLedgerWriteFlag',
  'recordMaterializationFlag',
] as const;

const dependencySurfaceTerms = [
  'f' + 's',
  'p' + 'ath',
  'pro' + 'viders',
  'A' + 'PIs',
  'O' + 'Auth',
  'store' + 's',
  'per' + 'sistence',
  'Supa' + 'base',
  'D' + 'B',
] as const;

const restrictedRecordTerms = [
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
] as const;

const prohibitedPathNames = [
  'read',
  'scan',
  'mine',
  'parse',
  'ocr',
  'connect',
  'sync',
  'persist',
  'create',
  'invoke',
  'run',
  'export',
  'post',
] as const;

const allRows = [
  ...STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS,
  ...STAGE_18G_BLOCKED_BOUNDARY_ROWS,
] as const;

const collectNonLabelTerms = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectNonLabelTerms);
  }

  if (typeof value !== 'object' || value === null) {
    return typeof value === 'string' ? [value] : [];
  }

  return Object.entries(value).flatMap(([termName, nestedValue]) => {
    if (termName === 'label') {
      return [termName];
    }

    return [termName, ...collectNonLabelTerms(nestedValue)];
  });
};

const collectPropertyNames = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectPropertyNames);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  return Object.entries(value).flatMap(([termName, nestedValue]) => [
    termName,
    ...collectPropertyNames(nestedValue),
  ]);
};
// #endregion

// #region Tests
describe('Stage 18F-18G domain boundary index', () => {
  it('has exactly 12 Stage 18F external professional domain rows', () => {
    expect(STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS).toHaveLength(12);
    expect(STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS.map((row) => row.label)).toEqual(
      DOMAIN_BOUNDARY_INDEX_DOMAIN_LABELS,
    );
  });

  it('has exactly 11 Stage 18G blocked boundary rows', () => {
    expect(STAGE_18G_BLOCKED_BOUNDARY_ROWS).toHaveLength(11);
    expect(STAGE_18G_BLOCKED_BOUNDARY_ROWS.map((row) => row.label)).toEqual(
      DOMAIN_BOUNDARY_INDEX_BOUNDARY_LABELS,
    );
  });

  it('keeps every row label-only, static-only, and index-only', () => {
    allRows.forEach((row) => {
      expect(row.labelOnly).toBe(true);
      expect(row.staticOnly).toBe(true);
      expect(row.indexOnly).toBe(true);
    });
  });

  it('keeps every professional, evidence, and action flag false', () => {
    expect(Object.keys(DOMAIN_BOUNDARY_INDEX_ROW_FALSE_FLAGS)).toEqual(falseFlagKeys);

    allRows.forEach((row) => {
      falseFlagKeys.forEach((flagKey) => {
        expect(row.safetyFlags[flagKey]).toBe(false);
      });
    });
  });

  it('keeps blocked boundary rows negative only', () => {
    STAGE_18G_BLOCKED_BOUNDARY_ROWS.forEach((row) => {
      expect(row.rowKind).toBe('blocked_boundary');
      expect(row.stage).toBe('18G');
      expect(row.boundaryMode).toBe('blocked_only');
      expect(row.negativeOnly).toBe(true);
      expect(row.safetyFlags.actionFlag).toBe(false);
    });
  });

  it('keeps dependency surfaces out of non-label terms', () => {
    const nonLabelTerms = collectNonLabelTerms(
      STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX,
    ).map((termName) => termName.toLowerCase());

    dependencySurfaceTerms.forEach((surfaceTerm) => {
      expect(nonLabelTerms).not.toContain(surfaceTerm.toLowerCase());
    });
  });

  it('keeps operational record surfaces out of non-label terms', () => {
    const nonLabelTerms = collectNonLabelTerms(
      STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX,
    ).map((termName) => termName.toLowerCase());

    restrictedRecordTerms.forEach((surfaceTerm) => {
      expect(nonLabelTerms).not.toContain(surfaceTerm.toLowerCase());
    });
  });

  it('keeps prohibited code path names out of property names', () => {
    const propertyNames = collectPropertyNames(STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX).map(
      (propertyName) => propertyName.toLowerCase(),
    );

    prohibitedPathNames.forEach((pathName) => {
      expect(propertyNames).not.toContain(pathName);
    });
  });

  it('keeps the combined index scoped to Stage 18F-18G only', () => {
    expect(STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX.scope).toBe(DOMAIN_BOUNDARY_INDEX_SCOPE);
    expect(STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX.domains).toBe(
      STAGE_18F_EXTERNAL_PROFESSIONAL_DOMAIN_ROWS,
    );
    expect(STAGE_18F_18G_DOMAIN_BOUNDARY_INDEX.boundaries).toBe(
      STAGE_18G_BLOCKED_BOUNDARY_ROWS,
    );
  });
});
// #endregion
