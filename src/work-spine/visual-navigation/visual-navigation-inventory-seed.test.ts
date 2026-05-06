/* ==== FILE: src/work-spine/visual-navigation/visual-navigation-inventory-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  VISUAL_NAVIGATION_BUCKET_LABELS,
  VISUAL_NAVIGATION_INVENTORY_ITEMS,
  VISUAL_NAVIGATION_INVENTORY_WARNING,
  VISUAL_NAVIGATION_REQUIRED_GATE,
  visualNavigationBucketCounts,
} from './visual-navigation-inventory-seed';
import {
  VISUAL_NAVIGATION_BLOCKED_ACTIONS,
  VISUAL_NAVIGATION_BUCKETS,
} from './visual-navigation-inventory-types';
import type { VisualNavigationInventoryItem } from './visual-navigation-inventory-types';
import visualNavigationSeedSource from './visual-navigation-inventory-seed.ts?raw';
// #endregion

// #region Constants
const REQUIRED_FIELDS = [
  'itemId',
  'label',
  'routeOrPath',
  'sourceSurface',
  'currentLocation',
  'bucket',
  'recommendedHome',
  'classificationReason',
  'staticIndexOnly',
  'visualNavigationOnly',
  'changesRuntimeNavigation',
  'changesRouting',
  'canExecute',
  'canCreateOperationalObject',
  'canPersist',
  'readsSourceContent',
  'blockedActions',
  'requiredGateBeforeChange',
  'currentMixingRisk',
  'mixingNotes',
  'visibleWarning',
] as const satisfies readonly (keyof VisualNavigationInventoryItem)[];

const EXPECTED_BUCKET_COUNTS = {
  control_view: 6,
  professional_process_blueprint: 13,
  real_client_case_work_area: 8,
  product_system: 14,
} as const;

const REQUIRED_PROCESS_BLUEPRINTS = [
  'process-war-compensation',
  'process-penalty-cancellation',
  'process-declaration-of-capital',
  'process-capital-gains',
] as const;

const REQUIRED_WORK_AREAS = [
  'work-clients-index',
  'work-active-cases',
  'work-helman-case',
  'work-guardian-case',
] as const;

const REQUIRED_PRODUCT_SYSTEMS = [
  'system-robium-client',
  'system-accounting-core',
  'system-document-change-agent',
  'system-messaging',
] as const;

const FORBIDDEN_IMPORT_PATTERNS = [
  /from ['"].*sidebarNav/,
  /from ['"].*Layout/,
  /from ['"].*Dashboard/,
  /from ['"].*neurons/,
  /brainStore/,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /provider/i,
  /OCR/,
  /WorkItem/,
  /Matter/,
  /DocumentRef/,
] as const;
// #endregion

// #region Helpers
const findItem = (itemId: string): VisualNavigationInventoryItem => {
  const item = VISUAL_NAVIGATION_INVENTORY_ITEMS.find((candidate) => candidate.itemId === itemId);

  if (!item) {
    throw new Error(`Missing visual navigation item ${itemId}`);
  }

  return item;
};

const itemsByBucket = (bucket: string): readonly VisualNavigationInventoryItem[] =>
  VISUAL_NAVIGATION_INVENTORY_ITEMS.filter((item) => item.bucket === bucket);
// #endregion

// #region Tests
describe('VISUAL_NAVIGATION_INVENTORY_ITEMS', () => {
  it('exports the approved warning, gate, and bucket labels', () => {
    expect(VISUAL_NAVIGATION_INVENTORY_WARNING).toBe(
      'מלאי ניווט חזותי סטטי בלבד — מסווג פריטים קיימים לצורך תכנון, לא משנה ניווט, לא יוצר אזורי עבודה, ולא מעניק הרשאת פעולה.',
    );
    expect(VISUAL_NAVIGATION_REQUIRED_GATE).toContain('Stage 21B');
    expect(Object.keys(VISUAL_NAVIGATION_BUCKET_LABELS).sort()).toEqual([...VISUAL_NAVIGATION_BUCKETS].sort());
  });

  it('exports the current static inventory with the expected bucket counts', () => {
    expect(VISUAL_NAVIGATION_INVENTORY_ITEMS).toHaveLength(41);
    expect(visualNavigationBucketCounts()).toEqual(EXPECTED_BUCKET_COUNTS);
  });

  it('includes every required field and static safety flag on each item', () => {
    for (const item of VISUAL_NAVIGATION_INVENTORY_ITEMS) {
      for (const fieldName of REQUIRED_FIELDS) {
        expect(item).toHaveProperty(fieldName);
      }

      expect(item.staticIndexOnly).toBe(true);
      expect(item.visualNavigationOnly).toBe(true);
      expect(item.changesRuntimeNavigation).toBe(false);
      expect(item.changesRouting).toBe(false);
      expect(item.canExecute).toBe(false);
      expect(item.canCreateOperationalObject).toBe(false);
      expect(item.canPersist).toBe(false);
      expect(item.readsSourceContent).toBe(false);
      expect(item.blockedActions).toEqual(VISUAL_NAVIGATION_BLOCKED_ACTIONS);
      expect(item.requiredGateBeforeChange).toBe(VISUAL_NAVIGATION_REQUIRED_GATE);
      expect(item.visibleWarning).toBe(VISUAL_NAVIGATION_INVENTORY_WARNING);
    }
  });

  it('classifies every item into exactly one approved bucket', () => {
    for (const item of VISUAL_NAVIGATION_INVENTORY_ITEMS) {
      expect(VISUAL_NAVIGATION_BUCKETS).toContain(item.bucket);
      expect(VISUAL_NAVIGATION_BUCKETS).toContain(item.recommendedHome);
    }

    for (const bucket of VISUAL_NAVIGATION_BUCKETS) {
      expect(itemsByBucket(bucket).length).toBeGreaterThan(0);
    }
  });

  it('maps professional process blueprints away from operational sidebar semantics', () => {
    for (const itemId of REQUIRED_PROCESS_BLUEPRINTS) {
      const item = findItem(itemId);

      expect(item.bucket).toBe('professional_process_blueprint');
      expect(item.recommendedHome).toBe('professional_process_blueprint');
      expect(item.currentMixingRisk).toBe('process_in_operational_nav');
    }
  });

  it('maps real clients, cases, and work areas separately from process blueprints', () => {
    for (const itemId of REQUIRED_WORK_AREAS) {
      const item = findItem(itemId);

      expect(item.bucket).toBe('real_client_case_work_area');
      expect(item.recommendedHome).toBe('real_client_case_work_area');
    }
  });

  it('maps products and systems separately from process and case navigation', () => {
    for (const itemId of REQUIRED_PRODUCT_SYSTEMS) {
      const item = findItem(itemId);

      expect(item.bucket).toBe('product_system');
      expect(item.recommendedHome).toBe('product_system');
    }
  });

  it('keeps the inventory static and free of live UI, runtime, provider, or object imports', () => {
    for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
      expect(visualNavigationSeedSource).not.toMatch(pattern);
    }
  });
});
// #endregion
