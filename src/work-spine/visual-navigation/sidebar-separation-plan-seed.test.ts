/* ==== FILE: src/work-spine/visual-navigation/sidebar-separation-plan-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  SIDEBAR_SEPARATION_PLAN_ROWS,
  SIDEBAR_SEPARATION_PLAN_WARNING,
} from './sidebar-separation-plan-seed';
import { SIDEBAR_SEPARATION_CLASSIFICATIONS } from './sidebar-separation-plan-types';
import { VISUAL_NAVIGATION_INVENTORY_ITEMS } from './visual-navigation-inventory-seed';
// #endregion

// #region Tests
describe('sidebar separation plan seed', () => {
  it('includes all current sidebar process-like items from the Stage 21B audit', () => {
    const processBlueprintIds = VISUAL_NAVIGATION_INVENTORY_ITEMS.filter(
      (item) =>
        item.bucket === 'professional_process_blueprint' &&
        item.sourceSurface === 'sidebar',
    ).map((item) => item.itemId);
    const plannedIds = SIDEBAR_SEPARATION_PLAN_ROWS.map((row) => row.itemId);

    expect(processBlueprintIds).toHaveLength(13);
    expect(plannedIds).toEqual(expect.arrayContaining(processBlueprintIds));
  });

  it('classifies professional process blueprints away from operational sidebar work areas', () => {
    const processRows = SIDEBAR_SEPARATION_PLAN_ROWS.filter((row) =>
      row.itemId.startsWith('process-'),
    );

    expect(processRows.length).toBeGreaterThanOrEqual(13);
    for (const row of processRows.filter((row) => row.itemId !== 'process-brain-router')) {
      expect(row.proposedClassification).toBe('movesToProcessLibrary');
      expect(row.targetLocation).toContain('Process Library');
      expect(row.reason).not.toContain('staysInSidebar');
    }
  });

  it('keeps operational client and work areas as sidebar candidates', () => {
    const operationalIds = ['work-clients-index', 'work-active-cases', 'work-spine-board'];

    for (const itemId of operationalIds) {
      const row = SIDEBAR_SEPARATION_PLAN_ROWS.find((item) => item.itemId === itemId);
      expect(row?.proposedClassification).toBe('staysInSidebar');
      expect(row?.targetLocation).toContain('Operational Sidebar');
    }
  });

  it('uses every approved static classification at least once', () => {
    const classifications = new Set(
      SIDEBAR_SEPARATION_PLAN_ROWS.map((row) => row.proposedClassification),
    );

    expect([...classifications].sort()).toEqual(
      [...SIDEBAR_SEPARATION_CLASSIFICATIONS].sort(),
    );
  });

  it('keeps every row static and gated by Eldad approval', () => {
    for (const row of SIDEBAR_SEPARATION_PLAN_ROWS) {
      expect(row.itemId).toBeTruthy();
      expect(row.hebrewLabel).toBeTruthy();
      expect(row.currentLocation).toBeTruthy();
      expect(row.proposedClassification).toBeTruthy();
      expect(row.reason).toBeTruthy();
      expect(row.targetLocation).toBeTruthy();
      expect(row.implementationAllowed).toBe(false);
      expect(row.requiresEldadApproval).toBe(true);
    }
  });

  it('documents that the plan does not implement navigation changes', () => {
    expect(SIDEBAR_SEPARATION_PLAN_WARNING).toBe(
      'תוכנית הפרדת Sidebar סטטית בלבד — לא משנה ניווט, לא מזיזה Routes, לא מוחקת תהליכים, ולא יוצרת אזורי עבודה.',
    );
  });

  it('does not include runtime, UI mutation, or operational entity behavior', () => {
    const serializedPlan = JSON.stringify(SIDEBAR_SEPARATION_PLAN_ROWS);
    const forbiddenSnippets = [
      'sidebarNav',
      'Layout.tsx',
      'createRoute',
      'navigate(',
      'localStorage',
      'fetch(',
      'agent.run',
      'agent.execute',
      'Matter(',
      'WorkItem(',
      'DocumentRef(',
      'implementationAllowed:true',
    ];

    for (const snippet of forbiddenSnippets) {
      expect(serializedPlan).not.toContain(snippet);
    }
  });
});
// #endregion
