/* ============================================
   FILE: documentTemplateVariants.ts
   PURPOSE: Concrete template implementations for each document variant.
            4 variants: appeal, expert_opinion, letter, report.
   DEPENDENCIES: ./documentTemplates
   EXPORTS: TEMPLATES, getTemplate
   ============================================ */

import type { DocumentTemplate, DocumentVariant } from './documentTemplates';

// #region Template: ערר (Appeal)

const APPEAL_TEMPLATE: DocumentTemplate = {
  variant: 'appeal',
  displayName: 'ערר',
  description: 'ערר על החלטת דחייה — מסלול אדום / פיצויי מלחמה',

  /**
   * Cover page and TOC are OFF by default for appeals (simple filing).
   * Caller can activate via TemplateOverrides.forceCoverPage / forceTOC.
   */
  hasCoverPage: false,
  hasTOC: false,
  hasAddressee: true,
  hasSubjectLine: true,
  hasEvidenceAppendix: true,
  hasBrandedHeader: true,
  hasBrandedFooter: true,
  sectionPattern: 'hebrew_letters',

  buildAddressee: () => ({
    prefix: 'לכבוד',
    name: 'ועדת הערר לענייני פיצויים — מלחמת חרבות ברזל',
    addressLines: ['ירושלים'],
  }),

  buildSubjectLine: (entity) => {
    const caseNum = entity.officialCaseNumber || '';
    return `הנדון: ערר על החלטת דחייה — בקשה מס' ${caseNum}\nהמערער: ${entity.clientName}`;
  },

  buildSignatures: (entity) => [
    {
      signerName: entity.clientName,
      signerRole: 'המערער',
      creditLine: 'הערר והתחשיבים נערכו בסיוע מקצועי של דוד אלדד, רו"ח',
    },
  ],

  /** TOC entries for optional use (activated via TemplateOverrides.forceTOC) */
  buildTOC: () => [
    { title: 'מבוא ורקע עובדתי', anchorId: 'sec-a' },
    { title: 'תיאור הנכס והנזק', anchorId: 'sec-b' },
    { title: 'פירוט הנזקים', anchorId: 'sec-c' },
    { title: 'בסיס משפטי', anchorId: 'sec-d' },
    { title: 'ראיות ואסמכתאות', anchorId: 'sec-e' },
    { title: 'מענה לטענות הרשות', anchorId: 'sec-f' },
    { title: 'סעד מבוקש', anchorId: 'sec-g' },
  ],

  buildEvidenceTable: (entity) => {
    const submitted = entity.documents.filter(d => d.wasSubmitted);
    if (submitted.length === 0) return null;
    return {
      headers: ['#', 'תיאור', 'תאריך הגשה', 'סטטוס'],
      rows: submitted.map((d, i) => [
        String(i + 1),
        d.description || d.fileName,
        d.submissionDate || '—',
        'הוגש',
      ]),
    };
  },
};

// #endregion

// #region Template: חוות דעת (Expert Opinion)

const EXPERT_OPINION_TEMPLATE: DocumentTemplate = {
  variant: 'expert_opinion',
  displayName: 'חוות דעת',
  description: 'חוות דעת כלכלית / מקצועית — בית דין לעבודה, מיסוי, שמאות',

  hasCoverPage: true,
  hasTOC: true,
  hasAddressee: true,
  hasSubjectLine: true,
  hasEvidenceAppendix: true,
  hasBrandedHeader: true,
  hasBrandedFooter: true,
  sectionPattern: 'numbers',

  buildAddressee: () => ({
    prefix: 'לכבוד',
    name: 'בית הדין האזורי לעבודה',
    addressLines: [],
  }),

  buildSubjectLine: (entity) =>
    `הנדון: חוות דעת כלכלית\nבעניין: ${entity.clientName}`,

  buildSignatures: () => [
    {
      signerName: 'דוד אלדד',
      signerRole: 'רו"ח',
      stampText: 'חותם משרד',
    },
  ],

  buildTOC: () => [
    { title: 'פתיחה ומינוי', anchorId: 'intro' },
    { title: 'תיאור ההעסקה', anchorId: 'employment' },
    { title: 'ממצאים', anchorId: 'findings' },
    { title: 'תחשיב מפורט', anchorId: 'calculation' },
    { title: 'סיכום והמלצות', anchorId: 'summary' },
    { title: 'נספחים', anchorId: 'appendix' },
  ],

  buildEvidenceTable: (entity) => {
    const docs = entity.documents;
    if (docs.length === 0) return null;
    return {
      headers: ['#', 'מסמך', 'סוג', 'מקור'],
      rows: docs.map((d, i) => [
        String(i + 1),
        d.description || d.fileName,
        d.type || '—',
        d.wasSubmitted ? 'הוגש לתיק' : 'בתיק',
      ]),
    };
  },
};

// #endregion

// #region Template: מכתב (Letter)

const LETTER_TEMPLATE: DocumentTemplate = {
  variant: 'letter',
  displayName: 'מכתב',
  description: 'מכתב מקצועי — לרשות, לבנק, ללקוח, לצד שלישי, לעובד, לעו"ד',

  hasCoverPage: false,
  hasTOC: false,
  hasAddressee: true,
  hasSubjectLine: true,
  hasEvidenceAppendix: false,
  hasBrandedHeader: true,
  hasBrandedFooter: true,
  sectionPattern: 'none',

  /** Default addressee — caller should override via TemplateOverrides */
  buildAddressee: () => ({
    prefix: 'לכבוד',
    name: '(נמען)',
    addressLines: [],
  }),

  buildSubjectLine: (entity) => {
    return `הנדון: ${entity.clientName}`;
  },

  buildSignatures: () => [
    { signerName: 'דוד אלדד', signerRole: 'רו"ח' },
  ],

  buildTOC: () => [],
  buildEvidenceTable: () => null,
};

// #endregion

// #region Template: דוח (Report)

const REPORT_TEMPLATE: DocumentTemplate = {
  variant: 'report',
  displayName: 'דוח',
  description: 'דוח מקצועי — דוח ביקורת, דוח ממצאים, דוח מיוחד. תומך ב-internal / submitted.',

  hasCoverPage: true,
  hasTOC: true,
  hasAddressee: true,
  hasSubjectLine: true,
  hasEvidenceAppendix: true,
  hasBrandedHeader: true,
  hasBrandedFooter: true,
  sectionPattern: 'numbers',

  /** Default addressee for submitted reports — override via TemplateOverrides */
  buildAddressee: () => ({
    prefix: 'לכבוד',
    name: '(נמען)',
    addressLines: [],
  }),

  /** Default subject — override via TemplateOverrides.subjectOverride */
  buildSubjectLine: (entity) =>
    `הנדון: דוח מקצועי — ${entity.clientName}`,

  buildSignatures: () => [
    {
      signerName: 'דוד אלדד',
      signerRole: 'רו"ח',
      stampText: 'חותם משרד',
    },
  ],

  buildTOC: () => [
    { title: 'תקציר מנהלים', anchorId: 'executive-summary' },
    { title: 'רקע', anchorId: 'background' },
    { title: 'ממצאים', anchorId: 'findings' },
    { title: 'ניתוח', anchorId: 'analysis' },
    { title: 'סיכום והמלצות', anchorId: 'recommendations' },
    { title: 'נספחים', anchorId: 'appendices' },
  ],

  buildEvidenceTable: (entity) => {
    const docs = entity.documents;
    if (docs.length === 0) return null;
    return {
      headers: ['#', 'מסמך', 'סוג', 'הערות'],
      rows: docs.map((d, i) => [
        String(i + 1),
        d.description || d.fileName,
        d.type || '—',
        d.wasSubmitted ? 'הוגש' : '—',
      ]),
    };
  },
};

// #endregion

// #region Registry

/** All registered templates */
export const TEMPLATES: Record<DocumentVariant, DocumentTemplate> = {
  appeal: APPEAL_TEMPLATE,
  expert_opinion: EXPERT_OPINION_TEMPLATE,
  letter: LETTER_TEMPLATE,
  report: REPORT_TEMPLATE,
};

/**
 * Get a template by variant.
 * @param variant - The document variant
 * @returns The matching DocumentTemplate
 * @throws if variant is unknown
 */
export function getTemplate(variant: DocumentVariant): DocumentTemplate {
  const tpl = TEMPLATES[variant];
  if (!tpl) throw new Error(`Unknown document variant: ${variant}`);
  return tpl;
}

// #endregion
