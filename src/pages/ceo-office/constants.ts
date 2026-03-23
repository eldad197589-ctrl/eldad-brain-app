/* ============================================
   FILE: constants.ts
   PURPOSE: Static data and configuration
   DEPENDENCIES: None (local only)
   EXPORTS: DAYS_HE, MONTHS_HE, MEETING_COLORS, CATEGORY_KEYWORDS, detectCategory
   ============================================ */
/**
 * CEO Office — Constants & Configuration
 *
 * Static data, lookup tables, and configuration values.
 * Includes Hebrew locale data and category detection logic.
 */

// #region Hebrew Locale Data

/** Hebrew day-of-week abbreviations (Sunday → Saturday) */
export const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/** Hebrew month names (January → December) */
export const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

// #endregion

// #region Meeting Colors

/** Color palette available for meeting color selection */
export const MEETING_COLORS = [
  '#f59e0b', '#7C3AED', '#3b82f6', '#10b981',
  '#ef4444', '#06b6d4', '#f43f5e', '#fb923c',
];

// #endregion

// #region Category Detection

/** Keyword-to-category mapping for auto-detecting task categories from title text */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'פלאפון': ['פלאפון', 'pelephone', 'pitch', 'דמו'],
  'טכנולוגי': ['טכני', 'קוד', 'פיתוח', 'סינכרון', 'tech', 'api'],
  'משפטי': ['הסכם', 'חוזה', 'משפטי', 'חתימה', 'רישום', 'קניין', 'וטו'],
  'כספי': ['תקציב', 'כספי', 'חשבון', 'תזרים', 'הלוואה', 'מניות', 'שכר', 'אקטואר'],
  'הון אנושי': ['קליטה', 'עובדים', 'חממה', 'גיוס', 'צוות'],
  'אסטרטגי': ['אקוויטי', 'רכישה', 'משקיע', 'עתיד', 'ראייה', 'מותג'],
};

/**
 * Auto-detect a task category from its title.
 * Matches against `CATEGORY_KEYWORDS`; defaults to 'כללי' if no match.
 *
 * @param title — The task title to analyze
 * @returns The detected category string
 */
export function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'כללי';
}

// #endregion
