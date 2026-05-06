/* ==== FILE: src/work-spine/visual-architecture/visual-architecture-map-seed.test.ts ==== */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  VISUAL_ARCHITECTURE_BUCKET_LABELS,
  VISUAL_ARCHITECTURE_MAP_ROWS,
  visualArchitectureBucketCounts,
  visualArchitectureBuckets,
} from './visual-architecture-map-seed';
import {
  VISUAL_ARCHITECTURE_BLOCKED_ACTIONS,
  VISUAL_ARCHITECTURE_BUCKETS,
  VISUAL_ARCHITECTURE_MAP_WARNING,
} from './visual-architecture-map-types';
// #endregion

// #region Test Data
const seedSource = readFileSync(new URL('./visual-architecture-map-seed.ts', import.meta.url), 'utf8');
const typeSource = readFileSync(new URL('./visual-architecture-map-types.ts', import.meta.url), 'utf8');
const combinedSource = `${seedSource}\n${typeSource}`;

const rowById = (surfaceId: string) => {
  const row = VISUAL_ARCHITECTURE_MAP_ROWS.find((candidate) => candidate.surfaceId === surfaceId);
  if (!row) throw new Error(`Missing visual architecture row: ${surfaceId}`);
  return row;
};

const forbiddenImportPatterns = [
  /from ['"].*pages\//,
  /from ['"].*components\//,
  /from ['"].*store\//,
  /from ['"].*runtime\//,
  /from ['"].*persistence\//,
  /from ['"].*providers\//,
  /from ['"].*use-cases\//,
  /from ['"].*data\/neurons/,
];
// #endregion

// #region Tests
describe('VISUAL_ARCHITECTURE_MAP_ROWS', () => {
  it('represents all seven approved buckets', () => {
    expect(visualArchitectureBuckets()).toEqual(VISUAL_ARCHITECTURE_BUCKETS);
    expect(Object.keys(VISUAL_ARCHITECTURE_BUCKET_LABELS).sort()).toEqual([...VISUAL_ARCHITECTURE_BUCKETS].sort());

    const bucketCounts = visualArchitectureBucketCounts();
    for (const bucket of VISUAL_ARCHITECTURE_BUCKETS) {
      expect(bucketCounts[bucket]).toBeGreaterThan(0);
    }
  });

  it('keeps dashboard, CEO Bureau, and Work Desk as separate architecture rows', () => {
    const dashboard = rowById('surface-dashboard-main');
    const ceoBureau = rowById('surface-ceo-bureau');
    const workDesk = rowById('surface-work-desk-route');
    const workDeskTab = rowById('surface-work-desk-tab');

    expect(dashboard.currentRoute).toBe('/');
    expect(ceoBureau.currentRoute).toBe('/ceo');
    expect(workDesk.currentRoute).toBe('/work-spine');
    expect(workDeskTab.currentRoute).toBe('/ceo#kanban');
    expect(workDesk.bucket).toBe('work_desk');
    expect(workDeskTab.bucket).toBe('work_desk');
  });

  it('includes a dedicated Process Library bucket and row', () => {
    const processLibraryRows = VISUAL_ARCHITECTURE_MAP_ROWS.filter((row) => row.bucket === 'process_library');

    expect(processLibraryRows.length).toBeGreaterThan(0);
    expect(rowById('surface-process-library-seed').targetRole).toContain('מקור האמת');
    expect(rowById('surface-flowchart-pages').recommendedAction).toContain('Process Library');
  });

  it('keeps internal tools in the internal dev tools bucket', () => {
    expect(rowById('surface-manual-preview-workbench').bucket).toBe('internal_dev_tools');
    expect(rowById('surface-brain-build-progress').bucket).toBe('internal_dev_tools');
    expect(rowById('surface-brain-build-progress').currentRoute).toBe('/internal/brain-build-progress');
  });

  it('locks every row as static planning only', () => {
    for (const row of VISUAL_ARCHITECTURE_MAP_ROWS) {
      expect(row.implementationAllowed).toBe(false);
      expect(row.requiresEldadApproval).toBe(true);
      expect(row.visibleWarning).toBe(VISUAL_ARCHITECTURE_MAP_WARNING);
      expect(row.blockedActions).toEqual(VISUAL_ARCHITECTURE_BLOCKED_ACTIONS);
      expect(row.currentProblem.length).toBeGreaterThan(0);
      expect(row.targetRole.length).toBeGreaterThan(0);
      expect(row.recommendedAction.length).toBeGreaterThan(0);
    }
  });

  it('does not import UI, route, store, runtime, provider, persistence, or neurons modules', () => {
    for (const forbiddenImportPattern of forbiddenImportPatterns) {
      expect(combinedSource).not.toMatch(forbiddenImportPattern);
    }
  });
});
// #endregion
