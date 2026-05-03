/* ====
   FILE: operational-preview-types.test.ts
   PURPOSE: Focused tests for Stage 8 preview-only operational object contracts.
   DEPENDENCIES: Vitest, operational preview static bundles
   EXPORTS: Test suite
   ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import { STATIC_OPERATIONAL_PREVIEW_BUNDLES } from './operational-preview-seed';
import {
  OPERATIONAL_PREVIEW_BLOCKED_REASON,
  OPERATIONAL_PREVIEW_BUNDLE_STATUS,
  OPERATIONAL_PREVIEW_STATUS,
} from './operational-preview-types';
// #endregion

// #region Test Helpers
const forbiddenOperationalStatuses = [
  'active',
  'in_progress',
  'completed',
  'assigned',
] as const;

const forbiddenSurfaceNames = [
  'useBrain' + 'Store',
  'useMatter' + 'Store',
  'brain' + 'Store',
  'matter' + 'Store',
  'local' + 'Storage',
  'Supa' + 'base',
  'D' + 'B',
  'google' + 'apis',
  'f' + 's',
  'pa' + 'th',
  'O' + 'Auth',
  'O' + 'CR',
  'create' + 'WorkItem',
  'create' + 'Matter',
  'create' + 'DocumentRef',
  'WorkItem' + 'Repository',
  'Matter' + 'Store',
  'DocumentRef' + 'Repository',
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

const getAllObjectPreviews = () =>
  STATIC_OPERATIONAL_PREVIEW_BUNDLES.flatMap((bundle) => [
    ...bundle.workItemPreviews,
    ...bundle.matterLinkPreviews,
    ...bundle.documentRefPreviews,
  ]);
// #endregion

// #region Tests
describe('Stage 8 operational preview contracts', () => {
  it('keeps all static bundles preview-only', () => {
    expect(STATIC_OPERATIONAL_PREVIEW_BUNDLES).toHaveLength(3);

    STATIC_OPERATIONAL_PREVIEW_BUNDLES.forEach((bundle) => {
      expect(bundle.bundleStatus).toBe(OPERATIONAL_PREVIEW_BUNDLE_STATUS);
      expect(bundle.canExecute).toBe(false);
      expect(bundle.canPersist).toBe(false);
      expect(bundle.requiresEldadApproval).toBe(true);
      expect(bundle.sourceApprovalDecision.decisionId).toBeTruthy();
      expect(bundle.sourceIntake.sourceId).toBeTruthy();
    });
  });

  it('locks every object preview as hypothetical and blocked', () => {
    const objectPreviews = getAllObjectPreviews();

    expect(objectPreviews.length).toBeGreaterThan(0);

    objectPreviews.forEach((preview) => {
      expect(preview.previewStatus).toBe(OPERATIONAL_PREVIEW_STATUS);
      expect(preview.creationBlocked).toBe(true);
      expect(preview.creationBlockedReason).toBe(OPERATIONAL_PREVIEW_BLOCKED_REASON);
    });
  });

  it('links every preview to an approval decision and source intake preview', () => {
    getAllObjectPreviews().forEach((preview) => {
      expect(preview.sourceApprovalId).toMatch(/^approval-stage7a-/);
      expect(preview.sourceIntakeId).toMatch(/^src-/);
    });
  });

  it('does not expose operational statuses', () => {
    const previewValues = collectPrimitiveValues(STATIC_OPERATIONAL_PREVIEW_BUNDLES);

    forbiddenOperationalStatuses.forEach((status) => {
      expect(previewValues).not.toContain(status);
    });
  });

  it('does not create or enable real operational objects', () => {
    STATIC_OPERATIONAL_PREVIEW_BUNDLES.forEach((bundle) => {
      expect(bundle.canExecute).toBe(false);
      expect(bundle.canPersist).toBe(false);
      expect(bundle.workItemPreviews.every((preview) => preview.creationBlocked)).toBe(true);
      expect(bundle.matterLinkPreviews.every((preview) => preview.creationBlocked)).toBe(true);
      expect(bundle.documentRefPreviews.every((preview) => preview.creationBlocked)).toBe(true);
    });
  });

  it('does not expose forbidden live, store, repository, or factory surfaces', () => {
    const previewKeys = collectRecordKeys(STATIC_OPERATIONAL_PREVIEW_BUNDLES);
    const previewValues = collectPrimitiveValues(STATIC_OPERATIONAL_PREVIEW_BUNDLES);

    forbiddenSurfaceNames.forEach((surfaceName) => {
      expect(previewKeys).not.toContain(surfaceName);
      expect(previewValues).not.toContain(surfaceName);
    });
  });
});
// #endregion
