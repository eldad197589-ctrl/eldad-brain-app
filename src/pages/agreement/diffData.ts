/* ============================================
   FILE: diffData.ts
   PURPOSE: Agreement diff data — NEW side is DYNAMICALLY pulled from agreementData.ts
   DEPENDENCIES: agreementData.ts
   EXPORTS: DiffSection, DIFF_SECTIONS, DIFF_STATS, getClauseTexts
   ============================================ */
import { AGREEMENT_CLAUSES } from './agreementData';

// #region Types

/** Badge severity level */
export type BadgeType = 'critical' | 'important' | 'good';

/** A single comparison section */
export interface DiffSection {
  id: string;
  title: string;
  icon: string;
  badge: BadgeType;
  badgeLabel: string;
  /** Clause IDs that the NEW side pulls from (LIVE from agreementData.ts) */
  sourceClauseIds: string[];
  /** OLD side — static, never changes (historical record of 3.3.26) */
  oldSide: { label: string; summary: string; items: string[] };
  explanation: string;
}

// #endregion

// #region Dynamic clause extraction

/**
 * Get sub-clause texts from AGREEMENT_CLAUSES by their IDs.
 * This is the REAL sync — pulls live data, not hardcoded copies.
 * @param ids - Array of sub-clause IDs (e.g. ['7.1', '7.2', '7.3'])
 * @returns Array of clause texts (text or highlight)
 */
export function getClauseTexts(ids: string[]): string[] {
  const results: string[] = [];
  for (const id of ids) {
    for (const clause of AGREEMENT_CLAUSES) {
      const sub = clause.subClauses.find(s => s.id === id);
      if (sub) {
        const content = sub.text || sub.highlight || '';
        if (content) results.push(`[${id}] ${content}`);
        break;
      }
    }
  }
  return results;
}

/**
 * Get the title of a clause by its parent ID.
 * @param clauseId - e.g. 'clause-7'
 */
export function getClauseTitle(clauseId: string): string {
  const clause = AGREEMENT_CLAUSES.find(c => c.id === clauseId);
  return clause ? `${clause.number}. ${clause.title}` : '[לא נמצא]';
}

// #endregion

// #region Stats (computed dynamically)

const allSubClauses = AGREEMENT_CLAUSES.flatMap(c => c.subClauses);

export const DIFF_STATS = {
  totalClauses: AGREEMENT_CLAUSES.length,
  totalSubClauses: allSubClauses.length,
  highlightedWarnings: allSubClauses.filter(s => s.highlight).length,
  sections: 0, // will be set after DIFF_SECTIONS
};

// #endregion

// #region Diff Sections

export const DIFF_SECTIONS: DiffSection[] = [
  {
    id: 'equity',
    title: 'חלוקת אחזקות ודילול',
    icon: '💰',
    badge: 'critical',
    badgeLabel: 'שינוי קריטי',
    sourceClauseIds: ['3.1', '3.2', '3.3', '3.3.1', '3.3.2', '3.3.3', '3.4'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: '33% / 33% / 33%',
      items: ['אלדד — 33%', 'קיריל — 33%', 'אוסנת — 33%', 'אין ESOP, אין מאגר לעובדים'],
    },
    explanation: 'חלוקה שווה 33/33/33 לא משקפת הבדלים בהשקעה ובסיכון. אלדד וקיריל עבדו 3 חודשים לפני ההסכם. 20% למאגר עובדים ומשקיעים — הכרחי לגיוס.',
  },
  {
    id: 'ceo',
    title: 'תפקיד המנכ"ל ומבנה הניהול',
    icon: '👑',
    badge: 'critical',
    badgeLabel: 'שינוי קריטי',
    sourceClauseIds: ['2.1'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'אוסנת = מנכ"לית השותפות (סעיף 4.4)',
      items: [
        'אלדד — ניהול פיננסי בלבד',
        'קיריל — פיתוח טכנולוגי',
        'אוסנת — מנכ"לית + אסטרטגיה + שיווק + משפט + ראיונות',
        'ללא KPI, ללא הגדרת "מסלול מנכ"לית".',
      ],
    },
    explanation: 'במקור אוסנת הוגדרה כמנכ"לית מיום 1. בהסכם הסופי, אלדד משמש מנכ"ל עם אפשרות קידום אוסנת לאחר הוכחת ביצועים.',
  },
  {
    id: 'veto',
    title: 'זכויות וטו וזכות הכרעה',
    icon: '🛑',
    badge: 'critical',
    badgeLabel: 'שינוי קריטי',
    sourceClauseIds: ['4.1', '4.2', '4.3', '4.4', '4.5'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'וטו גורף + זכות הכרעה סופית לאוסנת',
      items: [
        'אלדד — וטו בלעדי על כל הפיננסים',
        'קיריל — וטו בלעדי על כל הטכנולוגיה',
        'אוסנת — וטו על מסחר, משפט, אסטרטגיה + זכות הכרעה סופית (סעיף 4.7)',
        'סעיף 4.8: "מנגנון ההכרעה גובר על כל מנגנון אחר"',
        'רוב: 66%',
      ],
    },
    explanation: 'זו הנקודה הקריטית ביותר: במקור, אוסנת קיבלה זכות הכרעה סופית ומחייבת. בהסכם הסופי בוטל מנגנון ההכרעה לחלוטין, הוחלף ב-Casting Vote למנכ"ל בלבד.',
  },
  {
    id: 'background-ip',
    title: 'הכרה בהשקעת העבר (Background IP)',
    icon: '🧠',
    badge: 'critical',
    badgeLabel: 'שינוי קריטי',
    sourceClauseIds: ['5.1', '5.2'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: '60,000 ₪ בלבד — 30K לכל אחד',
      items: ['10,000 ₪ לחודש × 3 חודשים × 2', 'אלדד ויתר על 30K/חודש לטובת 10K', '"ללא תמורה נוספת" + "ויתור בלתי חוזר"'],
    },
    explanation: 'במקור, נכסים בשווי חצי מיליון ₪ הועברו "ללא תמורה". ההסכם הסופי מכיר ב-500K שווי עם עדיפות החזר.',
  },
  {
    id: 'salary',
    title: 'מנגנון שכר ותגמול',
    icon: '💼',
    badge: 'important',
    badgeLabel: 'שינוי מהותי',
    sourceClauseIds: ['7.1', '7.2', '7.3', '7.4', '7.4.1', '7.4.2', '7.5', '7.6', '7.6.1'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'אין שכר + "שכר מינימום" חד-פעמי לקיריל',
      items: [
        'בשלב ראשון אין שכר (סעיף 4.10)',
        'שינוי שכר = הסכמה פה אחד (100%)',
        'קיריל: 2 חודשי שכר מינימום חד-פעמי מרווח ראשון (4.12)',
        'שכר שווה לכולם',
      ],
    },
    explanation: 'במקור, אין רטרואקטיבי, אין מנגנון הפחתה, ושכר שווה לכולם ללא קשר לתפוקה. בסופי: מודל דו-שלבי הוגן — עדיפות רק עד שהחובות ההיסטוריים שולמו.',
  },
  {
    id: 'vesting',
    title: 'מנגנון הבשלה (Vesting)',
    icon: '⏱️',
    badge: 'important',
    badgeLabel: 'שינוי מהותי',
    sourceClauseIds: ['3.3', '3.3.1', '3.3.2', '3.4'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'Vesting זמני קלאסי',
      items: ['אלדד: 25% מיידי + 20% ב-3 שנים', 'קיריל + אוסנת: 4 שנים, Cliff 12 חודשים', 'הבשלה מבוססת זמן בלבד — לא ביצועים'],
    },
    explanation: 'במקור, מספיק "לשבת" 4 שנים ולקבל מניות. בסופי, צריך להוכיח תוצאות.',
  },
  {
    id: 'ip',
    title: 'קניין רוחני ומותג',
    icon: '🔒',
    badge: 'important',
    badgeLabel: 'שינוי מהותי',
    sourceClauseIds: ['6.1', '6.1.1', '6.1.2', '6.2', '6.3'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'IP עובר לשותפות "ללא תמורה" + "ויתור בלתי חוזר"',
      items: [
        'אישור שימוש מאוסנת (במקום מהשותפות)',
        'קיריל לבד שיפוי (במקום כל שותף)',
        'אישור קוד פתוח מאוסנת (בלבד)',
        'פיצוי הפרה: 500,000 ₪ (ללא Claw-Back)',
      ],
    },
    explanation: 'במקור, אישורים רבים דרשו את הסכמת אוסנת אישית במקום השותפות כגוף. בסופי, הכל דורש אישור 75%.',
  },
  {
    id: 'dissolution',
    title: 'פירוק ופרידה',
    icon: '⚡',
    badge: 'important',
    badgeLabel: 'שינוי מהותי',
    sourceClauseIds: ['8.1', '8.2'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'פרק 15 — מפורט אך ללא הפרדת IP',
      items: ['חלוקה שווה בפירוק', 'אין התייחסות למותג אישי', 'אין License לקוד'],
    },
    explanation: 'ההסכם הסופי מכיל סעיף פירוק מלא בפנים (לא נדחה לתקנון) עם הגנות אישיות לכל מייסד.',
  },
  {
    id: 'non-compete',
    title: 'אי-תחרות וסודיות',
    icon: '🛡️',
    badge: 'important',
    badgeLabel: 'שינוי מהותי',
    sourceClauseIds: ['9.1', '9.2'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: 'NDA + Non-Compete כפרק נפרד (9-10)',
      items: ['פרק 9: סודיות', 'פרק 10: אי-תחרות', 'אותם עקרונות — פחות מובנה'],
    },
    explanation: 'ההסכם הסופי מאחד את אי-תחרות וסודיות בפרק אחד ממוקד. חשוב: זה בהסכם עצמו — לא נדחה לתקנון.',
  },
  {
    id: 'general',
    title: 'הוראות כלליות ותקנון',
    icon: '📋',
    badge: 'good',
    badgeLabel: 'חדש',
    sourceClauseIds: ['10.1', '10.2', '10.3', '10.4'],
    oldSide: {
      label: '❌ מקורי (3.3.26)',
      summary: '20 פרקים ללא הפרדה ברורה',
      items: ['הכול בהסכם אחד ארוך', 'אין הפניה לתקנון עתידי', 'אין הבהרה מה נדחה ומה לא'],
    },
    explanation: 'ההסכם הסופי מפריד בבירור: סעיפים קריטיים בהסכם, פרוצדורליים בתקנון. הכול מתועד.',
  },
];

// Update stats
DIFF_STATS.sections = DIFF_SECTIONS.length;

// #endregion
