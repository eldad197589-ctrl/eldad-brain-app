/* ============================================
   FILE: israelHolidays.ts
   PURPOSE: Israeli holidays & special days calendar — promoted from
            israel-worklaw-attendance-engine/constants.ts
   DEPENDENCIES: none (pure data)
   EXPORTS: ISRAEL_HOLIDAYS, CHOL_HAMOED, HOLIDAY_EVES,
            MEMORIAL_DAYS, ELECTION_DAYS, OTHER_HOLIDAYS,
            isHoliday, isHolidayEve, isCholHamoed, isMemorialDay,
            isElectionDay, isSpecialDay, getSpecialDayName, SpecialDayType
   SOURCE: israel-worklaw-attendance-engine/constants.ts lines 29-317
   ============================================ */

// #region Holiday Datasets

/**
 * חגים עיקריים — ימים שבהם חל איסור עבודה או תשלום מוגבר של 150%/200%
 */
export const ISRAEL_HOLIDAYS: Record<string, string> = {
  // 2024
  '2024-04-22': 'פסח (יום ראשון)',
  '2024-04-23': 'פסח (יום שני)',
  '2024-04-28': 'פסח (יום שביעי)',
  '2024-04-29': 'פסח (יום אחרון)',
  '2024-05-14': 'יום העצמאות',
  '2024-06-11': 'שבועות (יום ראשון)',
  '2024-06-12': 'שבועות (יום שני)',
  '2024-10-02': 'ראש השנה (ערב)',
  '2024-10-03': 'ראש השנה (יום ראשון)',
  '2024-10-04': 'ראש השנה (יום שני)',
  '2024-10-11': 'יום כיפור (ערב)',
  '2024-10-12': 'יום כיפור',
  '2024-10-16': 'סוכות (יום ראשון)',
  '2024-10-17': 'סוכות (יום שני)',
  '2024-10-23': 'שמחת תורה (ערב)',
  '2024-10-24': 'שמחת תורה',
  // 2025
  '2025-04-12': 'פסח (יום ראשון)',
  '2025-04-13': 'פסח (יום שני)',
  '2025-04-18': 'פסח (יום שביעי)',
  '2025-04-19': 'פסח (יום אחרון)',
  '2025-05-01': 'יום העצמאות',
  '2025-06-01': 'שבועות (יום ראשון)',
  '2025-06-02': 'שבועות (יום שני)',
  '2025-09-22': 'ראש השנה (ערב)',
  '2025-09-23': 'ראש השנה (יום ראשון)',
  '2025-09-24': 'ראש השנה (יום שני)',
  '2025-10-01': 'יום כיפור (ערב)',
  '2025-10-02': 'יום כיפור',
  '2025-10-06': 'סוכות (יום ראשון)',
  '2025-10-07': 'סוכות (יום שני)',
  '2025-10-13': 'שמחת תורה (ערב)',
  '2025-10-14': 'שמחת תורה',
  // 2026
  '2026-04-01': 'פסח (יום ראשון)',
  '2026-04-02': 'פסח (יום שני)',
  '2026-04-07': 'פסח (יום שביעי)',
  '2026-04-08': 'פסח (יום אחרון)',
  '2026-04-22': 'יום העצמאות',
  '2026-05-21': 'שבועות (יום ראשון)',
  '2026-05-22': 'שבועות (יום שני)',
  '2026-09-11': 'ראש השנה (ערב)',
  '2026-09-12': 'ראש השנה (יום ראשון)',
  '2026-09-13': 'ראש השנה (יום שני)',
  '2026-09-20': 'יום כיפור (ערב)',
  '2026-09-21': 'יום כיפור',
  '2026-09-25': 'סוכות (יום ראשון)',
  '2026-09-26': 'סוכות (יום שני)',
  '2026-10-02': 'שמחת תורה (ערב)',
  '2026-10-03': 'שמחת תורה',
};

/**
 * חול המועד — ימי עבודה רגילים בין ימי החג
 */
export const CHOL_HAMOED: Record<string, string> = {
  // 2024
  '2024-04-24': 'חול המועד פסח',
  '2024-04-25': 'חול המועד פסח',
  '2024-04-26': 'חול המועד פסח (ערב שבת)',
  '2024-04-27': 'חול המועד פסח (שבת)',
  '2024-10-18': 'חול המועד סוכות',
  '2024-10-19': 'חול המועד סוכות (שבת)',
  '2024-10-20': 'חול המועד סוכות',
  '2024-10-21': 'חול המועד סוכות',
  '2024-10-22': 'הושענא רבה',
  // 2025
  '2025-04-14': 'חול המועד פסח',
  '2025-04-15': 'חול המועד פסח',
  '2025-04-16': 'חול המועד פסח',
  '2025-04-17': 'חול המועד פסח',
  '2025-10-08': 'חול המועד סוכות',
  '2025-10-09': 'חול המועד סוכות',
  '2025-10-10': 'חול המועד סוכות',
  '2025-10-11': 'חול המועד סוכות (שבת)',
  '2025-10-12': 'הושענא רבה',
  // 2026
  '2026-04-03': 'חול המועד פסח',
  '2026-04-04': 'חול המועד פסח (שבת)',
  '2026-04-05': 'חול המועד פסח',
  '2026-04-06': 'חול המועד פסח',
  '2026-09-27': 'חול המועד סוכות',
  '2026-09-28': 'חול המועד סוכות',
  '2026-09-29': 'חול המועד סוכות',
  '2026-09-30': 'חול המועד סוכות',
  '2026-10-01': 'הושענא רבה',
};

/**
 * ערבי חג — ימי עבודה מקוצרים (עד 7 שעות או עד 13:00)
 */
export const HOLIDAY_EVES: Record<string, string> = {
  // 2024
  '2024-04-21': 'ערב פסח',
  '2024-06-10': 'ערב שבועות',
  '2024-10-01': 'ערב ראש השנה',
  '2024-10-10': 'ערב יום כיפור',
  '2024-10-15': 'ערב סוכות',
  // 2025
  '2025-04-11': 'ערב פסח',
  '2025-05-31': 'ערב שבועות',
  '2025-09-21': 'ערב ראש השנה',
  '2025-09-30': 'ערב יום כיפור',
  '2025-10-05': 'ערב סוכות',
  // 2026
  '2026-03-31': 'ערב פסח',
  '2026-05-20': 'ערב שבועות',
  '2026-09-10': 'ערב ראש השנה',
  '2026-09-19': 'ערב יום כיפור',
  '2026-09-24': 'ערב סוכות',
};

/**
 * ימי זיכרון לאומיים
 */
export const MEMORIAL_DAYS: Record<string, string> = {
  '2024-05-05': 'יום השואה והגבורה',
  '2024-05-12': 'יום הזיכרון לחללי מערכות ישראל',
  '2025-04-23': 'יום השואה והגבורה',
  '2025-04-30': 'יום הזיכרון לחללי מערכות ישראל',
  '2026-04-12': 'יום השואה והגבורה',
  '2026-04-21': 'יום הזיכרון לחללי מערכות ישראל',
};

/**
 * ימי בחירות — יום חופשה בתשלום
 */
export const ELECTION_DAYS: Record<string, string> = {
  // Add election dates when announced
};

/**
 * חגים וימים מיוחדים נוספים (לא ימי מנוחה חובה)
 */
export const OTHER_HOLIDAYS: Record<string, string> = {
  // 2024
  '2024-01-25': 'ט"ו בשבט',
  '2024-03-23': 'פורים (ערב)',
  '2024-03-24': 'פורים',
  '2024-03-25': 'שושן פורים',
  '2024-05-26': 'ל"ג בעומר',
  '2024-12-25': 'חנוכה (נר ראשון)',
  '2024-12-26': 'חנוכה', '2024-12-27': 'חנוכה', '2024-12-28': 'חנוכה',
  '2024-12-29': 'חנוכה', '2024-12-30': 'חנוכה', '2024-12-31': 'חנוכה',
  '2025-01-01': 'חנוכה (נר אחרון)',
  // 2025
  '2025-02-13': 'ט"ו בשבט',
  '2025-03-13': 'פורים (ערב)',
  '2025-03-14': 'פורים',
  '2025-03-15': 'שושן פורים (שבת)',
  '2025-03-16': 'שושן פורים',
  '2025-05-16': 'ל"ג בעומר',
  '2025-12-14': 'חנוכה (נר ראשון)',
  '2025-12-15': 'חנוכה', '2025-12-16': 'חנוכה', '2025-12-17': 'חנוכה',
  '2025-12-18': 'חנוכה', '2025-12-19': 'חנוכה', '2025-12-20': 'חנוכה',
  '2025-12-21': 'חנוכה (נר אחרון)',
  // 2026
  '2026-02-03': 'ט"ו בשבט',
  '2026-03-02': 'פורים (ערב)',
  '2026-03-03': 'פורים',
  '2026-03-04': 'שושן פורים',
  '2026-05-07': 'ל"ג בעומר',
  '2026-12-04': 'חנוכה (נר ראשון)',
  '2026-12-05': 'חנוכה', '2026-12-06': 'חנוכה', '2026-12-07': 'חנוכה',
  '2026-12-08': 'חנוכה', '2026-12-09': 'חנוכה', '2026-12-10': 'חנוכה',
  '2026-12-11': 'חנוכה (נר אחרון)',
};

// #endregion

// #region Helper Functions

/** @returns Holiday name or null */
export const getHolidayName = (dateString: string): string | null =>
  ISRAEL_HOLIDAYS[dateString] || null;

export const isHoliday = (dateString: string): boolean =>
  dateString in ISRAEL_HOLIDAYS;

export const getCholHamoedName = (dateString: string): string | null =>
  CHOL_HAMOED[dateString] || null;

export const isCholHamoed = (dateString: string): boolean =>
  dateString in CHOL_HAMOED;

export const getHolidayEveName = (dateString: string): string | null =>
  HOLIDAY_EVES[dateString] || null;

export const isHolidayEve = (dateString: string): boolean =>
  dateString in HOLIDAY_EVES;

export const getMemorialDayName = (dateString: string): string | null =>
  MEMORIAL_DAYS[dateString] || null;

export const isMemorialDay = (dateString: string): boolean =>
  dateString in MEMORIAL_DAYS;

export const getElectionDayName = (dateString: string): string | null =>
  ELECTION_DAYS[dateString] || null;

export const isElectionDay = (dateString: string): boolean =>
  dateString in ELECTION_DAYS;

export const getOtherHolidayName = (dateString: string): string | null =>
  OTHER_HOLIDAYS[dateString] || null;

export const isOtherHoliday = (dateString: string): boolean =>
  dateString in OTHER_HOLIDAYS;

/** Returns the name of any special day, or null */
export const getSpecialDayName = (dateString: string): string | null =>
  getHolidayName(dateString) ||
  getCholHamoedName(dateString) ||
  getHolidayEveName(dateString) ||
  getMemorialDayName(dateString) ||
  getElectionDayName(dateString) ||
  getOtherHolidayName(dateString);

export const isSpecialDay = (dateString: string): boolean =>
  isHoliday(dateString) ||
  isCholHamoed(dateString) ||
  isHolidayEve(dateString) ||
  isMemorialDay(dateString) ||
  isElectionDay(dateString) ||
  isOtherHoliday(dateString);

export type SpecialDayType = 'holiday' | 'cholHamoed' | 'holidayEve' | 'memorial' | 'election' | 'other' | null;

export const getSpecialDayType = (dateString: string): SpecialDayType => {
  if (isHoliday(dateString)) return 'holiday';
  if (isCholHamoed(dateString)) return 'cholHamoed';
  if (isHolidayEve(dateString)) return 'holidayEve';
  if (isMemorialDay(dateString)) return 'memorial';
  if (isElectionDay(dateString)) return 'election';
  if (isOtherHoliday(dateString)) return 'other';
  return null;
};

// #endregion
