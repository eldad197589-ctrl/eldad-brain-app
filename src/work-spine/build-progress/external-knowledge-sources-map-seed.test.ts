/* ==== FILE: src/work-spine/build-progress/external-knowledge-sources-map-seed.test.ts ==== */

// #region Imports
import { describe, expect, it } from 'vitest';
import {
  EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS,
  EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING,
  EXTERNAL_KNOWLEDGE_SOURCES_MAP_TITLE,
  EXTERNAL_KNOWLEDGE_SOURCES_MAP_WARNING,
} from './external-knowledge-sources-map-seed';
import externalSourceMapSeedSource from './external-knowledge-sources-map-seed.ts?raw';
// #endregion

// #region Constants
const REQUIRED_LABELS = [
  'נוכחון / Attendance',
  'Employee System',
  'Israel Worklaw Attendance Engine',
  'Guardian / אפוטרופוס',
  'רווח הון לתושב חוץ',
  'הצהרת הון',
  'Section 102/102A income tax knowledge',
  'Urgent scans 2026-05-05 mixed intake',
  'Robium / Protokol / Pelephone',
  'Smart Bureau Robium',
  'WPS Inventory System',
  'מודול קליטת לקוח חדש',
  'מערכת לניהול ובקרת אתרי בנייה',
  'Gravity ingestion vault',
  'Gmail data exports',
  'Drive data exports',
  'סריקות folder',
  'לקוחות folder',
  'Maven/VAT source folders',
  'legacy/generated Dima source folders',
  'legacy/generated Tsila source folders',
] as const;

const REQUIRED_FIELDS = [
  'sourceId',
  'label',
  'domain',
  'sourceKind',
  'locationHint',
  'status',
  'indexOnly',
  'contentRead',
  'sourceParsed',
  'ocrPerformed',
  'providerConnected',
  'sourceVerified',
  'dataCurrentVerified',
  'canCreateRecord',
  'canActOnSource',
  'blockedActions',
  'requiredGateBeforeAccess',
  'visibleWarning',
] as const;

const FORBIDDEN_IMPORT_OR_CALL_PATTERNS = [
  /from ['"]fs['"]/,
  /from ['"]path['"]/,
  /from ['"]xlsx['"]/,
  /fetch\s*\(/,
  /Supabase/,
  /\bDB\b/,
  /from ['"].*store/i,
  /from ['"].*runtime/i,
  /from ['"].*provider/i,
  /from ['"].*WorkItem/i,
  /from ['"].*Matter/i,
  /from ['"].*DocumentRef/i,
  /createWorkItem|createMatter|createDocumentRef/,
] as const;
// #endregion

// #region Tests
describe('EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS', () => {
  it('exports the approved Stage 18 title and warnings', () => {
    expect(EXTERNAL_KNOWLEDGE_SOURCES_MAP_TITLE).toBe('מפת מקורות ידע חיצוניים');
    expect(EXTERNAL_KNOWLEDGE_SOURCES_MAP_WARNING).toBe(
      'מפת מקורות ידע חיצוניים בלבד — לא נקרא תוכן, לא נכרו תיקיות, לא בוצע OCR, לא חוברו ספקים, לא אומתו מקורות, ולא נוצרו רשומות.',
    );
    expect(EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING).toBe(
      'מקור זה מוצג כאינדקס בלבד — אין אימות מקור, אין חיבור חי, ואין הרשאה לפעולה.',
    );
  });

  it('exports the approved initial external source rows', () => {
    expect(EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS).toHaveLength(REQUIRED_LABELS.length);
    expect(EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.map((row) => row.label)).toEqual(REQUIRED_LABELS);
  });

  it('keeps every row index-only with all safety flags false', () => {
    for (const row of EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS) {
      for (const requiredField of REQUIRED_FIELDS) {
        expect(row).toHaveProperty(requiredField);
      }
      expect(row.indexOnly).toBe(true);
      expect(row.contentRead).toBe(false);
      expect(row.sourceParsed).toBe(false);
      expect(row.ocrPerformed).toBe(false);
      expect(row.providerConnected).toBe(false);
      expect(row.sourceVerified).toBe(false);
      expect(row.dataCurrentVerified).toBe(false);
      expect(row.canCreateRecord).toBe(false);
      expect(row.canActOnSource).toBe(false);
      expect(row.blockedActions.length).toBeGreaterThan(0);
      expect(row.requiredGateBeforeAccess.length).toBeGreaterThan(0);
      expect(row.visibleWarning).toBe(EXTERNAL_KNOWLEDGE_SOURCE_ROW_WARNING);
    }
  });

  it('keeps provider export rows behind blocked live connection status', () => {
    const providerRows = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.filter((row) => row.sourceKind === 'provider_export');

    expect(providerRows.map((row) => row.label)).toEqual(['Gmail data exports', 'Drive data exports']);
    for (const row of providerRows) {
      expect(row.status).toBe('blocked_live_connection');
      expect(row.providerConnected).toBe(false);
      expect(row.contentRead).toBe(false);
      expect(row.canActOnSource).toBe(false);
    }
  });

  it('adds Section 102/102A as curated income tax knowledge only', () => {
    const section102Row = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.find(
      (row) => row.sourceId === 'external-income-tax-section-102-102a-knowledge-v1',
    );

    expect(section102Row).toBeDefined();
    expect(section102Row!.label).toBe('Section 102/102A income tax knowledge');
    expect(section102Row!.domain).toBe('income_tax');
    expect(section102Row!.sourceKind).toBe('professional_domain');
    expect(section102Row!.locationHint).toBe('Knowledge_Base/tax/income_tax/section_102_102a-label-only');
    expect(section102Row!.status).toBe('partial_static_pointer');
    expect(section102Row!.indexOnly).toBe(true);
    expect(section102Row!.contentRead).toBe(false);
    expect(section102Row!.sourceParsed).toBe(false);
    expect(section102Row!.providerConnected).toBe(false);
    expect(section102Row!.canCreateRecord).toBe(false);
    expect(section102Row!.canActOnSource).toBe(false);
    expect(section102Row!.requiredGateBeforeAccess).toContain('not client evidence');
    expect(section102Row!.requiredGateBeforeAccess).toContain('not operational');
  });

  it('adds the urgent scan folder as unclassified mixed intake only', () => {
    const urgentScanRow = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.find(
      (row) => row.sourceId === 'external-urgent-tax-102-scans-2026-05-05-v1',
    );

    expect(urgentScanRow).toBeDefined();
    expect(urgentScanRow!.label).toBe('Urgent scans 2026-05-05 mixed intake');
    expect(urgentScanRow!.domain).toBe('unclassified_mixed_intake');
    expect(urgentScanRow!.sourceKind).toBe('file_folder');
    expect(urgentScanRow!.locationHint).toBe('סריקות/סריקות2026-05-05_דחוף_מסמכים_מהמייל-label-only');
    expect(urgentScanRow!.status).toBe('needs_source_audit');
    expect(urgentScanRow!.indexOnly).toBe(true);
    expect(urgentScanRow!.contentRead).toBe(false);
    expect(urgentScanRow!.sourceParsed).toBe(false);
    expect(urgentScanRow!.ocrPerformed).toBe(false);
    expect(urgentScanRow!.canCreateRecord).toBe(false);
    expect(urgentScanRow!.canActOnSource).toBe(false);
    expect(urgentScanRow!.requiredGateBeforeAccess).toContain('general intake landing zone');
    expect(urgentScanRow!.requiredGateBeforeAccess).toContain('not automatically client evidence');
    expect(urgentScanRow!.requiredGateBeforeAccess).toContain('pending mapping and verification');
  });

  it('keeps folder rows blocked from read, parse, and mining behavior', () => {
    const folderRows = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.filter((row) =>
      ['file_folder', 'source_vault'].includes(row.sourceKind),
    );

    expect(folderRows.length).toBeGreaterThan(0);
    for (const row of folderRows) {
      expect(['blocked_file_access', 'needs_source_audit']).toContain(row.status);
      expect(row.contentRead).toBe(false);
      expect(row.sourceParsed).toBe(false);
      expect(row.ocrPerformed).toBe(false);
      expect(row.locationHint).toContain('label');
    }
  });

  it('keeps Dima and Tsila legacy rows audit-only', () => {
    const dimaRow = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.find((row) => row.label.includes('Dima'));
    const tsilaRow = EXTERNAL_KNOWLEDGE_SOURCE_MAP_ROWS.find((row) => row.label.includes('Tsila'));

    expect(dimaRow).toBeDefined();
    expect(tsilaRow).toBeDefined();
    expect(dimaRow!.status).toBe('unknown_needs_audit');
    expect(tsilaRow!.status).toBe('unknown_needs_audit');
    expect(dimaRow!.sourceVerified).toBe(false);
    expect(tsilaRow!.sourceVerified).toBe(false);
  });

  it('does not import or call forbidden runtime, provider, or file-access surfaces', () => {
    for (const forbiddenPattern of FORBIDDEN_IMPORT_OR_CALL_PATTERNS) {
      expect(externalSourceMapSeedSource).not.toMatch(forbiddenPattern);
    }
  });
});
// #endregion
