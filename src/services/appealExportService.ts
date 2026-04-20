/* ============================================
   FILE: appealExportService.ts
   PURPOSE: Appeal-specific configuration for the finalization pipeline.
            Provides QA checks, body parser, and export metadata
            specific to war-compensation appeals.
            Backward-compatible: exportAppealToWord + runPreflightQA
            work exactly as before.
   DEPENDENCIES: ./finalizationPipeline, ./wordExportService, ../data/caseTypes
   EXPORTS: exportAppealToWord, runPreflightQA, PreflightResult,
            APPEAL_CONFIG (for direct pipeline use)
   ============================================ */

import {
  executeFinalization, runGenericQA,
  type FinalizationConfig, type QACheck, type PreflightResult,
  type WordSection, type WordTableData,
} from './finalizationPipeline';
import type { CaseEntity } from '../data/caseTypes';

// Re-export for backward compatibility
export type { PreflightResult };

// #region Appeal-Specific Blacklist

const APPEAL_BLACKLIST = [
  'אקסיומטיות',
  'כונניות',
  'ייסוב ספר',
  'יוסג לבצע',
  'המערער הגיש להרשות',
  'בג"ץ קטיף',
  'לאיין לחלוטין',
  'לכנס את סמכותה',
  'גניזת הדחייה',
  'הלכת משק ארצי מנותק-קרקע',
];

// #endregion

// #region Appeal QA Checks

/**
 * Build appeal-specific QA checks (layered on top of generic checks).
 */
function buildAppealQAChecks(body: string, entity: CaseEntity): QACheck[] {
  const checks: QACheck[] = [];

  // A1: All sections א-ז present
  const sections = ['א.', 'ב.', 'ג.', 'ד.', 'ה.', 'ו.', 'ז.'];
  const missingSections = sections.filter(s => !body.includes(s));
  checks.push({
    id: 'A1', label: 'כל סעיפי א-ז',
    passed: missingSections.length === 0,
    detail: missingSections.length ? `חסרים: ${missingSections.join(', ')}` : 'כל 7 הסעיפים קיימים',
  });

  // A2: Counter-arguments present
  const counterArgs = (body.match(/טענת הרשות \d+:/g) || []).length;
  const hasRealCounterArgs = counterArgs >= 5 && !body.includes('טענת הרשות 1: ...');
  checks.push({
    id: 'A2', label: 'מענים בסעיף ו',
    passed: hasRealCounterArgs,
    detail: `${counterArgs} מענים${hasRealCounterArgs ? '' : ' (placeholder)'}`,
  });

  // A3: Section ז has relief (סעד)
  const hasRelief = body.includes('סעד') && (body.includes('לבטל') || body.includes('לאשר'));
  checks.push({
    id: 'A3', label: 'סעד בסעיף ז',
    passed: hasRelief,
    detail: hasRelief ? 'סעד מבוקש קיים' : 'חסר סעד מבוקש',
  });

  // A4: Claim amount present
  const officialNum = entity.officialCaseNumber || '';
  const hasAmount = body.includes('77,080') || body.includes('₪');
  checks.push({
    id: 'A4', label: 'סכום תביעה',
    passed: hasAmount,
    detail: hasAmount ? 'סכום קיים' : 'חסר סכום',
  });

  // A5: Client and representative names
  const hasNames = body.includes(entity.clientName) && body.includes('דוד אלדד');
  checks.push({
    id: 'A5', label: 'שמות מערער ומייצג',
    passed: hasNames,
    detail: hasNames ? 'שניהם קיימים' : 'חסר שם',
  });

  // A6: Case number
  const hasCaseNum = officialNum ? body.includes(officialNum) : true;
  checks.push({
    id: 'A6', label: 'מספר בקשה',
    passed: hasCaseNum,
    detail: hasCaseNum ? (officialNum || 'N/A') : 'חסר',
  });

  // A7: Signature line
  const hasSignature = body.includes('__') && body.includes('המערער');
  checks.push({
    id: 'A7', label: 'חתימה',
    passed: hasSignature,
    detail: hasSignature ? 'קיימת' : 'חסרה',
  });

  // A8: Evidence references
  const evidenceCount = (body.match(/^\d+\.\s/gm) || []).length;
  checks.push({
    id: 'A8', label: 'ראיות ≥5',
    passed: evidenceCount >= 5,
    detail: `${evidenceCount} פריטים ממוספרים`,
  });

  return checks;
}

// #endregion

// #region Appeal Body Parser

/**
 * Parse a raw appeal body string into structured WordSection[].
 * Extracts: addressee, subject, sections א-ז, evidence table, signature.
 */
function parseAppealBody(body: string, entity: CaseEntity): WordSection[] {
  const sections: WordSection[] = [];
  const lines = body.split('\n');

  // --- Addressee Block ---
  const addresseeLines: string[] = [];
  let i = 0;
  if (lines[i] && /\d{4}/.test(lines[i])) i++;
  while (i < lines.length && !lines[i].startsWith('הנדון:')) {
    if (lines[i].trim()) addresseeLines.push(lines[i].trim());
    i++;
  }
  if (addresseeLines.length > 0) {
    sections.push({ paragraphs: addresseeLines });
  }

  // --- Subject Block (הנדון) ---
  const subjectLines: string[] = [];
  while (i < lines.length && !lines[i].startsWith('א.')) {
    if (lines[i].trim()) subjectLines.push(lines[i].trim());
    i++;
  }
  if (subjectLines.length > 0) {
    sections.push({ paragraphs: subjectLines });
  }

  // --- Main Sections (א through ז) ---
  const sectionHeaders = ['א.', 'ב.', 'ג.', 'ד.', 'ה.', 'ו.', 'ז.'];
  let currentTitle = '';
  let currentParagraphs: string[] = [];

  for (; i < lines.length; i++) {
    const line = lines[i];
    const isNewSection = sectionHeaders.some(h => line.startsWith(h));

    if (isNewSection) {
      if (currentTitle || currentParagraphs.length > 0) {
        sections.push({
          title: currentTitle || undefined,
          paragraphs: currentParagraphs.length > 0 ? currentParagraphs : undefined,
        });
      }
      currentTitle = line;
      currentParagraphs = [];
    } else if (line.startsWith('בכבוד רב')) {
      if (currentTitle || currentParagraphs.length > 0) {
        sections.push({
          title: currentTitle || undefined,
          paragraphs: currentParagraphs.length > 0 ? currentParagraphs : undefined,
        });
      }
      currentTitle = '';
      currentParagraphs = [];
      break;
    } else if (line.trim()) {
      currentParagraphs.push(line);
    }
  }

  if (currentTitle || currentParagraphs.length > 0) {
    sections.push({
      title: currentTitle || undefined,
      paragraphs: currentParagraphs.length > 0 ? currentParagraphs : undefined,
    });
  }

  // --- Evidence Appendix Table ---
  const evidenceTable: WordTableData = {
    headers: ['#', 'תיאור', 'תאריך הגשה', 'סטטוס'],
    rows: entity.documents
      .filter(d => d.wasSubmitted)
      .map((d, idx) => [
        String(idx + 1),
        d.description || d.fileName,
        d.submissionDate || '—',
        d.wasSubmitted ? 'הוגש' : 'קיים בתיק',
      ]),
  };
  if (evidenceTable.rows.length > 0) {
    sections.push({ title: 'נספח: טבלת אסמכתאות', table: evidenceTable });
  }

  // --- Signature ---
  sections.push({
    signatures: [{ name: entity.clientName, role: 'המערער' }],
  });

  // --- Credit line ---
  sections.push({
    paragraphs: ['(הערר והתחשיבים נערכו בסיוע מקצועי של דוד אלדד, רו"ח)'],
  });

  return sections;
}

// #endregion

// #region Appeal Config

/**
 * Complete FinalizationConfig for war-compensation appeals.
 * Can be used directly with executeFinalization().
 */
export const APPEAL_CONFIG: FinalizationConfig = {
  processType: 'war_compensation_appeal',
  displayName: 'ערר פיצויי מלחמה',
  blacklist: APPEAL_BLACKLIST,
  buildQAChecks: buildAppealQAChecks,
  parseBody: parseAppealBody,
  buildExportMeta: (entity) => {
    const today = new Date().toISOString().split('T')[0];
    return {
      title: `ערר על החלטת דחייה — בקשה ${entity.officialCaseNumber}`,
      subtitle: `${entity.clientName} | מסלול אדום — מלחמת חרבות ברזל`,
      filename: `ערר_${entity.clientName}_${today}`,
    };
  },
  showHeader: true,
  showFooter: true,
};

// #endregion

// #region Backward-Compatible API

/**
 * Run preflight QA on an appeal case entity.
 * Backward-compatible wrapper around the generic pipeline.
 * @param caseEntity - The case entity to check
 */
export function runPreflightQA(caseEntity: CaseEntity): PreflightResult {
  return runGenericQA(APPEAL_CONFIG, caseEntity);
}

/**
 * Export a CaseEntity appeal to DOCX using the finalization pipeline.
 * Backward-compatible wrapper — same API as before.
 * @param caseEntity - The case entity to export
 * @returns PreflightResult for display to user
 */
export async function exportAppealToWord(caseEntity: CaseEntity): Promise<PreflightResult> {
  return executeFinalization(APPEAL_CONFIG, caseEntity);
}

// #endregion
