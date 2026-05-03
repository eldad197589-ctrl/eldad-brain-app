/* ====
   FILE: daily-operating-snapshot-types.test.ts
   PURPOSE: Focused tests for Stage 17 static daily operating snapshots.
   DEPENDENCIES: Vitest, daily operating snapshot fixtures
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { DAILY_OPERATING_SNAPSHOTS } from './daily-operating-snapshot-seed';
import {
  DAILY_OPERATING_ITEM_GROUP_KEYS,
  DAILY_OPERATING_SOURCE_STAGE_REFS,
} from './daily-operating-snapshot-types';
// #endregion

// #region Test Helpers
const allowedGroupKeys = ['count', 'ids', 'summaryLabels', 'urgencyLabels', 'riskLabels'] as const;

const lockedFalseCapabilityNames = [
  'canExecuteActions',
  'canPersistSnapshot',
  'canCreateWorkItem',
  'canCreateMatter',
  'canCreateDocumentRef',
  'canApproveItems',
  'canGenerateFiles',
  'canUseProviders',
  'canMoveFiles',
] as const;

const forbiddenSurfaceTerms = [
  'sto' + 'res',
  'pro' + 'viders',
  'persist' + 'ence',
  'file' + 'system',
  'CEO' + ' Bureau',
  'Dash' + 'board',
  'Work' + 'Item',
  'Mat' + 'ter',
  'Document' + 'Ref',
  'tim' + 'er',
  'sched' + 'uler',
  'email',
  'Whats' + 'App',
] as const;

const collectRecordKeys = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectRecordKeys);
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  return Object.entries(record).flatMap(([key, childValue]) => [
    key,
    ...collectRecordKeys(childValue),
  ]);
};

const collectPrimitiveValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectPrimitiveValues);
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value !== 'object' || value === null) {
    return [];
  }

  return Object.values(value as Record<string, unknown>).flatMap(collectPrimitiveValues);
};

const isPrimitiveArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
// #endregion

// #region Tests
describe('Stage 17 daily operating snapshots', () => {
  it('includes all nine item groups in every fixture', () => {
    DAILY_OPERATING_SNAPSHOTS.forEach((snapshot) => {
      expect(Object.keys(snapshot.itemGroups)).toEqual(DAILY_OPERATING_ITEM_GROUP_KEYS);
    });
  });

  it('keeps every fixture preview-only and read-only', () => {
    DAILY_OPERATING_SNAPSHOTS.forEach((snapshot) => {
      expect(snapshot.previewOnly).toBe(true);
      expect(snapshot.readOnly).toBe(true);
      expect(snapshot.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(snapshot.generatedAt).toBeTruthy();
    });
  });

  it('locks all capability flags to false', () => {
    DAILY_OPERATING_SNAPSHOTS.forEach((snapshot) => {
      lockedFalseCapabilityNames.forEach((capabilityName) => {
        expect(snapshot.capabilities[capabilityName]).toBe(false);
      });
    });
  });

  it('keeps item groups shallow with only counts, ids, and labels', () => {
    DAILY_OPERATING_SNAPSHOTS.forEach((snapshot) => {
      Object.values(snapshot.itemGroups).forEach((group) => {
        expect(Object.keys(group)).toEqual(allowedGroupKeys);
        expect(typeof group.count).toBe('number');
        expect(isPrimitiveArray(group.ids)).toBe(true);
        expect(isPrimitiveArray(group.summaryLabels)).toBe(true);
        expect(isPrimitiveArray(group.urgencyLabels)).toBe(true);
        expect(isPrimitiveArray(group.riskLabels)).toBe(true);
      });
    });
  });

  it('limits source stage refs to stages six through sixteen', () => {
    const allowedStageRefs = new Set<number>(DAILY_OPERATING_SOURCE_STAGE_REFS);

    DAILY_OPERATING_SNAPSHOTS.forEach((snapshot) => {
      snapshot.sourceStageRefs.forEach((stageRef) => {
        expect(allowedStageRefs.has(stageRef)).toBe(true);
        expect(stageRef).toBeGreaterThanOrEqual(6);
        expect(stageRef).toBeLessThanOrEqual(16);
      });
    });
  });

  it('does not expose forbidden implementation surfaces beyond locked capability names', () => {
    const snapshotKeys = collectRecordKeys(DAILY_OPERATING_SNAPSHOTS).filter(
      (key) => !lockedFalseCapabilityNames.includes(key as never),
    );
    const snapshotValues = collectPrimitiveValues(DAILY_OPERATING_SNAPSHOTS);
    const searchableText = [...snapshotKeys, ...snapshotValues].join(' ');

    forbiddenSurfaceTerms.forEach((surfaceTerm) => {
      expect(searchableText).not.toContain(surfaceTerm);
    });
  });

  it('preserves Hebrew right-to-left labels when present', () => {
    const firstSnapshot = DAILY_OPERATING_SNAPSHOTS[0]!;
    const learningLabels = firstSnapshot.itemGroups.learningCandidates.summaryLabels;

    expect(learningLabels.some((label) => label.includes('למידה'))).toBe(true);
    expect(learningLabels.some((label) => label.includes('תצוגה'))).toBe(true);
  });
});
// #endregion
