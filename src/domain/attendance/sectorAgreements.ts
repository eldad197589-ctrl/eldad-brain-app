/* ============================================
   FILE: sectorAgreements.ts
   PURPOSE: Sector-based attendance agreements dataset — promoted from
            israel-worklaw-attendance-engine/constants.ts
   DEPENDENCIES: none (pure data)
   EXPORTS: AttendanceAgreement, ATTENDANCE_AGREEMENTS, SECTORS,
            getAttendanceAgreement, getAgreementsBySector
   SOURCE: israel-worklaw-attendance-engine/constants.ts lines 318-697
   ============================================ */

// #region Types

/**
 * Defines a sector-specific attendance agreement.
 * Each agreement maps to a collective bargaining agreement (הסכם קיבוצי)
 * or extension order (צו הרחבה) in Israeli labor law.
 */
export interface AttendanceAgreement {
  /** Unique identifier (e.g. 'security_12h') */
  id: string;
  /** Display name in Hebrew */
  name: string;
  /** Industry sector */
  sector: string;
  /** Standard daily hours for this agreement */
  dailyHours: number;
  /** Maximum weekly hours */
  weeklyHours: number;
  /** Night shift hour reduction (usually 1 hour) */
  nightHoursReduction?: number;
  /** Hour at which 125% overtime kicks in */
  overtime125StartHour?: number;
  /** Hour at which 150% overtime kicks in */
  overtime150StartHour?: number;
  /** Shabbat rate multiplier (default: 1.5) */
  shabbatRate?: number;
  /** Holiday rate multiplier (default: 1.5) */
  holidayRate?: number;
  /** Special rules for this agreement */
  specialRules?: string[];
  /** Legal basis — collective agreement or extension order */
  legalBasis?: string;
}

// #endregion

// #region Dataset

export const ATTENDANCE_AGREEMENTS: AttendanceAgreement[] = [
  // ==========================================
  // כללי / General
  // ==========================================
  {
    id: 'regular_5days',
    name: 'רגילה - 5 ימים (8.4 שעות)',
    sector: 'כללי',
    dailyHours: 8.4,
    weeklyHours: 42,
    legalBasis: 'חוק שעות עבודה ומנוחה, תשי"א-1951',
    specialRules: ['ראשון-חמישי, 8.4 שעות', 'שישי מנוחה']
  },
  {
    id: 'regular_6days',
    name: 'רגילה - 6 ימים (8 שעות)',
    sector: 'כללי',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'חוק שעות עבודה ומנוחה, תשי"א-1951',
    specialRules: ['ראשון-חמישי 8 שעות', 'שישי עד 2 שעות']
  },
  {
    id: 'partial',
    name: 'חלקית (משרה חלקית)',
    sector: 'כללי',
    dailyHours: 6,
    weeklyHours: 30,
    specialRules: ['חלקיות משרה לפי הסכמה']
  },
  {
    id: 'night_shift',
    name: 'לילה (7 שעות)',
    sector: 'כללי',
    dailyHours: 7,
    weeklyHours: 36,
    nightHoursReduction: 1,
    legalBasis: 'סעיף 2(ב) לחוק שעות עבודה ומנוחה',
    specialRules: ['עבודה בשעות 22:00-06:00', 'קיצור שעת עבודה בלילה']
  },

  // ==========================================
  // שמירה ואבטחה / Security
  // ==========================================
  {
    id: 'security_regular',
    name: 'שמירה - משמרת רגילה (8 שעות)',
    sector: 'שמירה ואבטחה',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה בענף השמירה והאבטחה',
    specialRules: ['תשלום נסיעות', 'ביגוד עבודה', 'הפרשות פנסיה מיום ראשון']
  },
  {
    id: 'security_12h',
    name: 'שמירה - משמרת 12 שעות',
    sector: 'שמירה ואבטחה',
    dailyHours: 12,
    weeklyHours: 60,
    overtime125StartHour: 8,
    overtime150StartHour: 10,
    legalBasis: 'צו הרחבה בענף השמירה והאבטחה + היתר הנהלה',
    specialRules: ['משמרות 12 שעות', 'מנוחה מינימלית 12 שעות בין משמרות']
  },
  {
    id: 'security_night',
    name: 'שמירה - משמרת לילה',
    sector: 'שמירה ואבטחה',
    dailyHours: 7,
    weeklyHours: 36,
    nightHoursReduction: 1,
    legalBasis: 'צו הרחבה בענף השמירה + חוק עבודת לילה',
    specialRules: ['משמרות 22:00-06:00', 'תוספת לילה 15%']
  },

  // ==========================================
  // ניקיון ותחזוקה / Cleaning
  // ==========================================
  {
    id: 'cleaning_regular',
    name: 'ניקיון - משמרת רגילה',
    sector: 'ניקיון ותחזוקה',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה בענף הניקיון',
    specialRules: ['שכר מינימום ענפי', 'ביגוד וציוד מגן', 'נסיעות']
  },
  {
    id: 'cleaning_part_time',
    name: 'ניקיון - משמרת חלקית',
    sector: 'ניקיון ותחזוקה',
    dailyHours: 4,
    weeklyHours: 20,
    legalBasis: 'צו הרחבה בענף הניקיון',
    specialRules: ['עבודה חלקית', 'לרוב בוקר או ערב']
  },

  // ==========================================
  // בניין ותשתיות / Construction
  // ==========================================
  {
    id: 'construction_regular',
    name: 'בניין - עבודה רגילה',
    sector: 'בניין ותשתיות',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי בענף הבניין',
    specialRules: ['תוספת ותק', 'דמי הבראה מוגדלים', 'ביטוח חיים']
  },
  {
    id: 'construction_summer',
    name: 'בניין - עונת קיץ (מופחת)',
    sector: 'בניין ותשתיות',
    dailyHours: 7,
    weeklyHours: 38,
    legalBasis: 'הסכם קיבוצי בענף הבניין',
    specialRules: ['קיצור שעות בחודשי קיץ (יולי-אוגוסט)', 'הפסקות מורחבות']
  },

  // ==========================================
  // הובלה והיסעים / Transport
  // ==========================================
  {
    id: 'transport_driver',
    name: 'הובלה - נהג רגיל',
    sector: 'הובלה והיסעים',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה לנהגי משאיות',
    specialRules: ['מנוחות חובה', 'הפסקות נהיגה', 'רישום טכוגרף']
  },
  {
    id: 'transport_longhaul',
    name: 'הובלה - נהג קו ארוך',
    sector: 'הובלה והיסעים',
    dailyHours: 10,
    weeklyHours: 50,
    legalBasis: 'צו הרחבה לנהגי משאיות + היתר מנכ"ל',
    specialRules: ['נסיעות ארוכות', 'לינה מחוץ לבית', 'דמי אש"ל']
  },
  {
    id: 'transport_bus',
    name: 'היסעים - נהג אוטובוס',
    sector: 'הובלה והיסעים',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי בתחבורה הציבורית',
    specialRules: ['קווים עירוניים/בינעירוניים', 'עבודה במשמרות']
  },

  // ==========================================
  // מסחר וקמעונאות / Retail
  // ==========================================
  {
    id: 'retail_regular',
    name: 'מסחר - משמרת רגילה',
    sector: 'מסחר וקמעונאות',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה בענף המסחר',
    specialRules: ['עבודה בימי שישי', 'מוצאי שבת מותר']
  },
  {
    id: 'retail_shift',
    name: 'מסחר - עבודת משמרות',
    sector: 'מסחר וקמעונאות',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה בענף המסחר',
    specialRules: ['בוקר/ערב', 'קניונים עד 22:00-23:00']
  },

  // ==========================================
  // מלונאות ותיירות / Hospitality
  // ==========================================
  {
    id: 'hotel_regular',
    name: 'מלונאות - משמרת רגילה',
    sector: 'מלונאות ותיירות',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי בענף המלונאות',
    specialRules: ['עבודה בשבתות וחגים שכיחה', 'טיפים']
  },
  {
    id: 'hotel_night',
    name: 'מלונאות - משמרת לילה',
    sector: 'מלונאות ותיירות',
    dailyHours: 7,
    weeklyHours: 36,
    nightHoursReduction: 1,
    legalBasis: 'הסכם קיבוצי בענף המלונאות',
    specialRules: ['קבלה/כירות לילה', 'תוספת לילה']
  },

  // ==========================================
  // תעשייה / Manufacturing
  // ==========================================
  {
    id: 'factory_morning',
    name: 'מפעל - משמרת בוקר (8 שעות)',
    sector: 'תעשייה',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי ענפי / מפעלי',
    specialRules: ['06:00-14:00', 'תוספת משמרות']
  },
  {
    id: 'factory_afternoon',
    name: 'מפעל - משמרת אחה"צ (8 שעות)',
    sector: 'תעשייה',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי ענפי / מפעלי',
    specialRules: ['14:00-22:00', 'תוספת משמרת שנייה 15%']
  },
  {
    id: 'factory_night',
    name: 'מפעל - משמרת לילה (7 שעות)',
    sector: 'תעשייה',
    dailyHours: 7,
    weeklyHours: 36,
    nightHoursReduction: 1,
    legalBasis: 'הסכם קיבוצי + חוק עבודת לילה',
    specialRules: ['22:00-06:00', 'תוספת לילה 25%']
  },
  {
    id: 'factory_12h_morning',
    name: 'מפעל - 12 שעות בוקר',
    sector: 'תעשייה',
    dailyHours: 12,
    weeklyHours: 60,
    overtime125StartHour: 8,
    overtime150StartHour: 10,
    legalBasis: 'היתר הנהלה למשמרות ארוכות',
    specialRules: ['08:00-20:00', 'מנוחה מינימלית 12 שעות']
  },
  {
    id: 'factory_12h_night',
    name: 'מפעל - 12 שעות לילה',
    sector: 'תעשייה',
    dailyHours: 12,
    weeklyHours: 60,
    nightHoursReduction: 1,
    overtime125StartHour: 8,
    overtime150StartHour: 10,
    legalBasis: 'היתר הנהלה למשמרות ארוכות',
    specialRules: ['20:00-08:00', 'תוספת לילה']
  },
  {
    id: 'factory_week_alternate',
    name: 'מפעל - שבוע בוקר/שבוע לילה',
    sector: 'תעשייה',
    dailyHours: 12,
    weeklyHours: 60,
    legalBasis: 'היתר הנהלה למשמרות מתחלפות',
    specialRules: ['שבוע בוקר 08:00-20:00', 'שבוע לילה 20:00-08:00']
  },

  // ==========================================
  // מתכת ופלסטיקה / Metal & Plastics
  // ==========================================
  {
    id: 'metal_regular',
    name: 'מתכת - משמרת רגילה',
    sector: 'מתכת ופלסטיקה',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'הסכם קיבוצי בענף המתכת',
    specialRules: ['תוספת ותק', 'ביגוד מגן', 'בדיקות תקופתיות']
  },

  // ==========================================
  // חקלאות / Agriculture
  // ==========================================
  {
    id: 'agriculture_regular',
    name: 'חקלאות - עבודה רגילה',
    sector: 'חקלאות',
    dailyHours: 8,
    weeklyHours: 45,
    legalBasis: 'צו הרחבה בענף החקלאות',
    specialRules: ['שעות גמישות לפי עונה', 'עבודה בחוץ']
  },
  {
    id: 'agriculture_seasonal',
    name: 'חקלאות - עונת קטיף',
    sector: 'חקלאות',
    dailyHours: 10,
    weeklyHours: 55,
    legalBasis: 'היתר חקלאות עונתי',
    specialRules: ['עבודה מוגברת בעונת קטיף', 'הפסקות מוגדלות בחום']
  },

  // ==========================================
  // הייטק / High-Tech
  // ==========================================
  {
    id: 'hightech_regular',
    name: 'הייטק/משרד - 5 ימים',
    sector: 'הייטק',
    dailyHours: 8.4,
    weeklyHours: 42,
    legalBasis: 'חוק שעות עבודה ומנוחה',
    specialRules: ['שעות גמישות', 'עבודה מהבית']
  },
  {
    id: 'hightech_global',
    name: 'הייטק - שעות גמישות גלובליות',
    sector: 'הייטק',
    dailyHours: 9,
    weeklyHours: 45,
    legalBasis: 'חוזה אישי + חוק שעות עבודה',
    specialRules: ['עבודה משולבת עם חו"ל', 'שעות לא קבועות', 'שעות נוספות גלובליות']
  },

  // ==========================================
  // סיעוד / Nursing Care
  // ==========================================
  {
    id: 'nursing_home_care',
    name: 'סיעוד - מטפלת בית',
    sector: 'סיעוד',
    dailyHours: 10,
    weeklyHours: 50,
    legalBasis: 'צו הרחבה לעובדי סיעוד',
    specialRules: ['לינה בבית המטופל', 'הפסקות נוחות', 'מנוחה שבועית 25 שעות']
  },
  {
    id: 'nursing_institution',
    name: 'סיעוד - מוסד (משמרות)',
    sector: 'סיעוד',
    dailyHours: 8,
    weeklyHours: 42,
    legalBasis: 'צו הרחבה לעובדי סיעוד',
    specialRules: ['משמרות בבתי אבות', 'עבודה בשבתות וחגים']
  },
  {
    id: 'nursing_24h',
    name: 'סיעוד - מטפלת 24 שעות',
    sector: 'סיעוד',
    dailyHours: 24,
    weeklyHours: 168,
    legalBasis: 'צו הרחבה לעובדי סיעוד + הלכת פסק הדין',
    specialRules: ['שכר חודשי כולל', 'מנוחה שבועית', 'הלכת גלוטן']
  }
];

// #endregion

// #region Helpers

/**
 * Find an agreement by its unique ID.
 * @param id - Agreement ID (e.g. 'security_12h')
 */
export const getAttendanceAgreement = (id: string): AttendanceAgreement | undefined => {
  return ATTENDANCE_AGREEMENTS.find(a => a.id === id);
};

/**
 * Get all agreements for a specific sector.
 * @param sector - Sector name in Hebrew (e.g. 'שמירה ואבטחה')
 */
export const getAgreementsBySector = (sector: string): AttendanceAgreement[] => {
  return ATTENDANCE_AGREEMENTS.filter(a => a.sector === sector);
};

/** All unique sector names derived from the agreements dataset. */
export const SECTORS = [...new Set(ATTENDANCE_AGREEMENTS.map(a => a.sector))];

// #endregion
