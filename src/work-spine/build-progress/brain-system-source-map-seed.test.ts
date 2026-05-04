/* ==== FILE: src/work-spine/build-progress/brain-system-source-map-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  BRAIN_SYSTEM_SOURCE_MAP_BLOCKED_ACTIONS,
  BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING,
  BRAIN_SYSTEM_SOURCE_MAP_ROWS,
  BRAIN_SYSTEM_SOURCE_MAP_TITLE,
  BRAIN_SYSTEM_SOURCE_MAP_WARNING,
} from './brain-system-source-map-seed';
import {
  BRAIN_SYSTEM_SOURCE_KINDS,
  BRAIN_SYSTEM_SOURCE_MAP_STATUSES,
  BRAIN_SYSTEM_SOURCE_RISK_LEVELS,
} from './brain-system-source-map-types';
import sourceMapSeedSource from './brain-system-source-map-seed.ts?raw';
// #endregion

// #region Constants
const REQUIRED_FIELDS = [
  'sourceId',
  'label',
  'domain',
  'sourceKind',
  'status',
  'indexOnly',
  'contentRead',
  'sourceMined',
  'sourceVerified',
  'dataCurrentVerified',
  'liveConnectionExists',
  'canActOnSource',
  'professionallyReliable',
  'blockedActions',
  'riskLevel',
  'requiredGateBeforeMining',
  'whatIsKnown',
  'whatIsNotKnown',
  'visibleWarning',
] as const;

const REQUIRED_LABELS = [
  'המוח של אלדד — brain-app',
  'Work Spine contracts',
  'Knowledge Inventory',
  'Visual Surface Inventory',
  'Brain Operating Truth',
  'סריקות',
  'דימה',
  'צילה',
  'VAT / Maven static context',
  'נוכחות / Payroll domain',
  'Employee System',
  'Guardian / אפוטרופוס',
  'רווח הון לתושב חוץ',
  'הצהרת הון',
  'Robium / Salary Bureau',
  'Protokol / Robium context',
  'Gmail/Drive exports',
  'Accounting Core',
  'WorkItem / Matter runtime',
  'Document output engines',
] as const;

const FORBIDDEN_IMPORT_PATTERNS = [
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
describe('BRAIN_SYSTEM_SOURCE_MAP_ROWS', () => {
  it('exports the exact source map title and warnings', () => {
    expect(BRAIN_SYSTEM_SOURCE_MAP_TITLE).toBe('מפת מצב המוח ומקורותיו');
    expect(BRAIN_SYSTEM_SOURCE_MAP_WARNING).toBe(
      'מפת מקורות בלבד — עצם הופעת מקור לא אומר שהתוכן נקרא, נכרה, אומת, עודכן, חובר חי, או שמותר למוח לפעול עליו.',
    );
    expect(BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING).toBe(
      'שורת מקור היא אינדקס בלבד — לא ראיה, לא אימות, לא חיבור חי, ולא הרשאה לפעולה.',
    );
  });

  it('exports exactly the 20 conservative source rows', () => {
    expect(BRAIN_SYSTEM_SOURCE_MAP_ROWS).toHaveLength(20);
    expect(BRAIN_SYSTEM_SOURCE_MAP_ROWS.map((row) => row.label)).toEqual(REQUIRED_LABELS);
  });

  it('includes every required field and safety flag on every row', () => {
    for (const row of BRAIN_SYSTEM_SOURCE_MAP_ROWS) {
      for (const fieldName of REQUIRED_FIELDS) {
        expect(row).toHaveProperty(fieldName);
      }

      expect(row.indexOnly).toBe(true);
      expect(row.contentRead).toBe(false);
      expect(row.sourceMined).toBe(false);
      expect(row.sourceVerified).toBe(false);
      expect(row.dataCurrentVerified).toBe(false);
      expect(row.liveConnectionExists).toBe(false);
      expect(row.canActOnSource).toBe(false);
      expect(row.professionallyReliable).toBe(false);
      expect(row.blockedActions).toEqual(BRAIN_SYSTEM_SOURCE_MAP_BLOCKED_ACTIONS);
      expect(row.visibleWarning).toBe(BRAIN_SYSTEM_SOURCE_MAP_ROW_WARNING);
      expect(BRAIN_SYSTEM_SOURCE_MAP_STATUSES).toContain(row.status);
      expect(BRAIN_SYSTEM_SOURCE_KINDS).toContain(row.sourceKind);
      expect(BRAIN_SYSTEM_SOURCE_RISK_LEVELS).toContain(row.riskLevel);
    }
  });

  it('keeps Gmail and Drive rows behind blocked live connection status', () => {
    const providerRow = BRAIN_SYSTEM_SOURCE_MAP_ROWS.find((row) => row.label === 'Gmail/Drive exports');
    expect(providerRow).toBeDefined();
    expect(providerRow!.status).toBe('blocked_live_connection');
    expect(providerRow!.liveConnectionExists).toBe(false);
    expect(providerRow!.whatIsNotKnown).toContain('אין חיבור Gmail/Drive');
  });

  it('keeps the scans row from implying OCR or file reading', () => {
    const scansRow = BRAIN_SYSTEM_SOURCE_MAP_ROWS.find((row) => row.label === 'סריקות');
    expect(scansRow).toBeDefined();
    expect(scansRow!.status).toBe('needs_mining');
    expect(scansRow!.contentRead).toBe(false);
    expect(scansRow!.sourceMined).toBe(false);
    expect(scansRow!.whatIsNotKnown).toContain('לא נקראה תיקייה');
    expect(scansRow!.whatIsNotKnown).toContain('לא הופעל OCR');
  });

  it('keeps Dima and Tsila as context rows without verified source content', () => {
    const dimaRow = BRAIN_SYSTEM_SOURCE_MAP_ROWS.find((row) => row.label === 'דימה');
    const tsilaRow = BRAIN_SYSTEM_SOURCE_MAP_ROWS.find((row) => row.label === 'צילה');
    expect(dimaRow).toBeDefined();
    expect(tsilaRow).toBeDefined();
    expect(dimaRow!.sourceVerified).toBe(false);
    expect(tsilaRow!.sourceVerified).toBe(false);
    expect(dimaRow!.whatIsNotKnown).toContain('לא מאשרת שתוכן תיק נקרא');
    expect(tsilaRow!.whatIsNotKnown).toContain('לא מאשרת תלושים');
  });

  it('does not import or call forbidden runtime, provider, or file-access surfaces', () => {
    for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
      expect(sourceMapSeedSource).not.toMatch(pattern);
    }
    expect(sourceMapSeedSource).not.toMatch(/from ['"].*provider/i);
    expect(sourceMapSeedSource).not.toMatch(/from ['"].*runtime/i);
    expect(sourceMapSeedSource).not.toMatch(/createWorkItem|createMatter|createDocumentRef/);
  });
});
// #endregion
