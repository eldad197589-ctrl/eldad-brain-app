/* ==== FILE: src/work-spine/build-progress/brain-visual-process-registry-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  BRAIN_VISUAL_PROCESS_CATEGORIES,
  BRAIN_VISUAL_PROCESS_PENDING_CANDIDATES,
  BRAIN_VISUAL_PROCESS_REGISTRY_ROWS,
  BRAIN_VISUAL_PROCESS_REGISTRY_SOURCE_TRACE,
  BRAIN_VISUAL_PROCESS_REGISTRY_TITLE,
  BRAIN_VISUAL_PROCESS_REGISTRY_WARNING,
  BRAIN_VISUAL_PROCESS_STATUS_LABELS,
} from './brain-visual-process-registry-seed';
import { BRAIN_VISUAL_PROCESS_BUILD_STATUSES } from './brain-visual-process-registry-types';
import visualProcessSeedSource from './brain-visual-process-registry-seed.ts?raw';
// #endregion

// #region Constants
const REQUIRED_PROCESSES = [
  'פיצויי מלחמה',
  'ביטול קנסות',
  'מחזור חיי עובד',
  'בוט מכתבים',
  'אפוטרופוס',
  'רווח הון ממקרקעין בחו"ל',
  'דוחות מוסדיים',
  'קליטת לקוחות ותמחור',
] as const;

const REQUIRED_PENDING_CANDIDATES = [
  'מע"מ חודשי',
  'דוח שנתי',
  'ביטוח לאומי',
  'דמי הבראה',
  'חישובי פיצויים',
  'הסכם קיבוצי',
] as const;

const FORBIDDEN_IMPORT_PATTERNS = [
  /brainStore/,
  /work-spine\/.*repository/i,
  /work-spine\/.*use-cases/i,
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /from ['"]xlsx['"]/,
  /fetch\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /OAuth/,
  /Supabase/,
  /\bDB\b/,
  /import\s+.*WorkItem/,
  /import\s+.*Matter/,
  /import\s+.*DocumentRef/,
] as const;
// #endregion

// #region Tests
describe('BRAIN_VISUAL_PROCESS_REGISTRY_ROWS', () => {
  it('exports the exact title, warning, and source trace', () => {
    expect(BRAIN_VISUAL_PROCESS_REGISTRY_TITLE).toBe('רשימת תהליכי המוח הוויזואלי');
    expect(BRAIN_VISUAL_PROCESS_REGISTRY_WARNING).toBe(
      'נוכחות חזותית ברשימת התהליכים אינה מוכנות תפעולית, אינה אימות מקצועי, ואינה הרשאה לפעולה.',
    );
    expect(BRAIN_VISUAL_PROCESS_REGISTRY_SOURCE_TRACE).toBe(
      'snapshot-static-copy:src/data/neurons.ts:CATEGORIES/NEURONS/PENDING',
    );
  });

  it('exports exactly 7 categories and 22 visual process rows', () => {
    expect(BRAIN_VISUAL_PROCESS_CATEGORIES).toHaveLength(7);
    expect(BRAIN_VISUAL_PROCESS_REGISTRY_ROWS).toHaveLength(22);
  });

  it('uses the required build status counts', () => {
    const countByStatus = (status: string): number =>
      BRAIN_VISUAL_PROCESS_REGISTRY_ROWS.filter((row) => row.buildStatus === status).length;

    expect(countByStatus('built')).toBe(17);
    expect(countByStatus('building')).toBe(2);
    expect(countByStatus('pending')).toBe(3);
    expect(BRAIN_VISUAL_PROCESS_STATUS_LABELS.built).toBe('נבנה');
    expect(BRAIN_VISUAL_PROCESS_STATUS_LABELS.building).toBe('בבנייה');
    expect(BRAIN_VISUAL_PROCESS_STATUS_LABELS.pending).toBe('ממתין');
  });

  it('contains required visual process labels', () => {
    const processLabels = BRAIN_VISUAL_PROCESS_REGISTRY_ROWS.map((row) => row.processLabel);

    for (const processLabel of REQUIRED_PROCESSES) {
      expect(processLabels).toContain(processLabel);
    }
  });

  it('contains required future pending candidates', () => {
    for (const candidate of REQUIRED_PENDING_CANDIDATES) {
      expect(BRAIN_VISUAL_PROCESS_PENDING_CANDIDATES).toContain(candidate);
    }
  });

  it('marks every visual process row as visual/index only', () => {
    for (const row of BRAIN_VISUAL_PROCESS_REGISTRY_ROWS) {
      expect(BRAIN_VISUAL_PROCESS_BUILD_STATUSES).toContain(row.buildStatus);
      expect(row.visualPresenceOnly).toBe(true);
      expect(row.indexOnly).toBe(true);
      expect(row.operationalReady).toBe(false);
      expect(row.canExecute).toBe(false);
      expect(row.canCreateRecord).toBe(false);
      expect(row.sourceTrace).toBe(BRAIN_VISUAL_PROCESS_REGISTRY_SOURCE_TRACE);
      expect(row.visibleWarning).toBe(BRAIN_VISUAL_PROCESS_REGISTRY_WARNING);
    }
  });

  it('does not import live registry stores, providers, persistence, or runtime paths', () => {
    for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
      expect(visualProcessSeedSource).not.toMatch(pattern);
    }
    expect(visualProcessSeedSource).not.toMatch(/from ['"].*provider/i);
    expect(visualProcessSeedSource).not.toMatch(/from ['"].*runtime/i);
    expect(visualProcessSeedSource).not.toMatch(/createWorkItem|createMatter|createDocumentRef/);
  });
});
// #endregion
