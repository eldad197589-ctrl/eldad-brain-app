/**
 * FILE: labor-law-constants.ts
 * PURPOSE: Israeli Labor Law Constants, Sector Presets, Company Settings
 * PROMOTED FROM: employee-system/employee-platform/src/lib/labor-law-constants.ts
 * PROMOTION DATE: 2026-04-15
 * ADAPTATION: NONE — verbatim copy
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

export const LOCKED_PARAMS = {
    // שעות עבודה - תקן יומי לפי סוג שבוע עבודה
    DAILY_MAX_HOURS: 8,
    DAILY_MAX_WITH_OVERTIME: 12,
    WEEKLY_MAX_HOURS: 42,
    MONTHLY_STANDARD_HOURS: 182,
    WEEKLY_REST_HOURS: 36,
    BREAK_THRESHOLD_HOURS: 6, // חובת הפסקה לאחר 6 שעות
    BREAK_MIN_MINUTES: 45, // ביום של 6 שעות ומעלה
    BREAK_MIN_CONTINUOUS: 30,
    PRE_SABBATH_BREAK_MIN: 30,
    BETWEEN_DAYS_REST: 8,
    CAN_LEAVE_WORK_ON_BREAK: true, // אם ההפסקה 30 דקות ומעלה

    // שעות תקן לפי סוג שבוע עבודה
    WORK_WEEK_5_DAYS_DAILY_HOURS: 8.4, // שבוע עבודה מקוצר (5 ימים)
    WORK_WEEK_6_DAYS_DAILY_HOURS: 8, // שבוע עבודה ארוך (6 ימים)
    WORK_WEEK_5_DAYS_FRIDAY_HOURS: 0, // יום שישי הוא יום מנוחה בשבוע 5 ימים
    WORK_WEEK_6_DAYS_FRIDAY_HOURS: 7, // יום שישי מקוצר בשבוע 6 ימים

    // ערבי חג
    HOLIDAY_EVE_5_DAY_WEEK_HOURS: 8, // משולם כ-9
    HOLIDAY_EVE_6_DAY_WEEK_HOURS: 7, // משולם כ-8
    YOM_KIPPUR_EVE_HOURS: 6, // משולם כ-9

    // שעות נוספות רגילות
    OVERTIME_TIER1_HOURS: 2, // מכסת שעות ל-125%
    OVERTIME_TIER1_RATE: 1.25,
    OVERTIME_TIER2_RATE: 1.50,

    // שבת וחגים - תעריפים
    SABBATH_RATE: 1.50, // תעריף בסיסי לשבת/חג
    SABBATH_OVERTIME_TIER1_RATE: 1.75, // שעות נוספות ראשונות בשבת (150% + 25%)
    SABBATH_OVERTIME_TIER2_RATE: 2.00, // שעות נוספות נוספות בשבת (150% + 50%)
    HOLIDAY_RATE: 1.50, // תעריף בסיסי לחג
    HOLIDAY_OVERTIME_TIER1_RATE: 1.75,
    HOLIDAY_OVERTIME_TIER2_RATE: 2.00,
    FORCED_HOLIDAY_WORK_RATE: 2.50, // עבודה כפויה בחג (100% דמי חג + 150%)

    // לילה
    NIGHT_WORK_MAX_HOURS_REGULAR: 7, // יום עבודה בלילה הוא 7 שעות
    NIGHT_START_HOUR: 22,
    NIGHT_END_HOUR: 6,

    // נוער (עד גיל 18)
    YOUTH_MAX_AGE: 18,
    YOUTH_DAILY_MAX: 8,
    YOUTH_WEEKLY_MAX: 40,
    YOUTH_OVERTIME_ALLOWED: false,
    YOUTH_NIGHT_WORK_ALLOWED: false,

    // שכר וסוציאליות (מינימום חוקי/צו הרחבה כללי)
    MINIMUM_WAGE_MONTHLY_2025: 6247.67,
    MINIMUM_WAGE_HOURLY_2025: 32.4,
    HOURLY_DIVISOR: 182, // מחלק לשכר שעתי

    // דמי מחלה
    SICK_DAY1_RATE: 0,
    SICK_DAY2_RATE: 0.5,
    SICK_DAY3_PLUS_RATE: 1.0,
    SICK_MONTHLY_ACCRUAL: 1.5,
    SICK_MAX_ACCRUAL: 90,

    // פנסיה חובה (צו הרחבה 2017)
    PENSION_EMPLOYEE_MIN: 0.06,
    PENSION_EMPLOYER_MIN: 0.065, // תגמולים
    PENSION_SEVERANCE_MIN: 0.06, // פיצויים (לרוב 8.33% אבל החובה היא 6%)
    // *הערה: בפועל המקובל הוא 18.5% סה"כ, כאן שמנו את המינימום לפי החוק היבש במידת הצורך, 
    // אך ברוב המשק נהוג 6% עובד + 6.5% מעביד + 6% פיצויים או 8.33%

    // נסיעות
    TRAVEL_MAX_DAILY_2025: 27.1,

    // קנסות והתראות
    PENALTY_INDIVIDUAL: 14000,
    PENALTY_CORPORATE: 35000,
} as const;

// סוג שבוע עבודה
export type WorkWeekType = '5_days' | '6_days';

export interface SectorPreset {
    id: string;
    name: string;
    nightBonus: number; // 1.20 = 120%
    shiftBonus: number; // תוספת משמרת (גורם כופל או סכום, כאן באחוזים)
    minWageMultiplier: number; // למשל 1.10 = 10% מעל המינימום
    havraahRate: number;
    description: string;
}

export const SECTOR_PRESETS: Record<string, SectorPreset> = {
    default: {
        id: 'default',
        name: 'ללא צו הרחבה ספציפי',
        nightBonus: 1.0, // החוק לא מחייב תוספת, רק קיצור יום ל-7 שעות. אך נהוג 120% בהרבה מקומות, נשאיר 1.0 כחוק יבש וניתן לעריכה
        shiftBonus: 0,
        minWageMultiplier: 1.0,
        havraahRate: 418, // פרטי
        description: 'הגדרות בסיסיות לפי חוק שעות עבודה ומנוחה ללא הסכמים מיוחדים.',
    },
    security: {
        id: 'security',
        name: 'אבטחה ושמירה',
        nightBonus: 1.40, // 40% תוספת
        shiftBonus: 0.10, // הערכה כללית, משתנה
        minWageMultiplier: 1.10, // שכר מינימום ענפי גבוה יותר
        havraahRate: 418, // או תעריף משופר
        description: 'כולל תוספות לשמירה ואבטחה (תוספת לילה מוגדלת).',
    },
    restaurants: {
        id: 'restaurants',
        name: 'מסעדות והסעדה',
        nightBonus: 1.0,
        shiftBonus: 0,
        minWageMultiplier: 1.10, // הפקדה שקלית נוספת או אחוז
        havraahRate: 418,
        description: 'כולל תוספות ייחודיות לענף ההסעדה.',
    },
    hotels: {
        id: 'hotels',
        name: 'מלונאות',
        nightBonus: 1.25, // משתנה
        shiftBonus: 0,
        minWageMultiplier: 1.0,
        havraahRate: 418,
        description: 'הסכם קיבוצי למלונאות.',
    },
    construction: {
        id: 'construction',
        name: 'בניין',
        nightBonus: 1.0,
        shiftBonus: 0,
        minWageMultiplier: 1.15, // מדרגות שכר גבוהות יותר
        havraahRate: 418,
        description: 'שכר מינימום ענפי גבוה ותנאים סוציאליים מורחבים.',
    },
    hitech: {
        id: 'hitech',
        name: 'הייטק (חוזים אישיים)',
        nightBonus: 1.0, // לרוב גלובלי
        shiftBonus: 0,
        minWageMultiplier: 1.0,
        havraahRate: 418,
        description: 'מבוסס לרוב על שכר גלובלי גבוה, ללא תוספות משמרת ספציפיות.',
    },
};

export interface CompanySettings {
    sectorId: string;

    // סוג שבוע עבודה (5 או 6 ימים)
    workWeekType: WorkWeekType;

    // פרמטרים ניתנים לעריכה (COMPANY-SPECIFIC)
    fullTimeWeeklyHours: number; // ברירת מחדל 42
    nightBonusRate: number; // 1.20, 1.40 etc.
    sabbathBonusRate: number; // 1.50 default

    extraVacationDays: number; // מעבר לחוק
    extraHavraahDays: number; // מעבר לחוק

    pensionEmployeeRate: number; // 0.06
    pensionEmployerRate: number; // 0.065
    pensionSeveranceRate: number; // 0.0833

    kerenHishtalmutEmployeeRate: number; // 0.025
    kerenHishtalmutEmployerRate: number; // 0.075

    travelReimbursementDailyLimit: number; // 27.1

    useGlobalOvertime: boolean; // האם להשתמש בחישוב גלובלי (פחות נפוץ שעתי, אבל קיים)
}

export const EDITABLE_DEFAULTS: CompanySettings = {
    sectorId: 'default',

    workWeekType: '5_days', // ברירת מחדל - שבוע עבודה מקוצר

    fullTimeWeeklyHours: 42,
    nightBonusRate: 1.20, // הרוב נותנים 120% גם אם לא חובה
    sabbathBonusRate: 1.50,

    extraVacationDays: 0,
    extraHavraahDays: 0,

    pensionEmployeeRate: 0.06,
    pensionEmployerRate: 0.065,
    pensionSeveranceRate: 0.0833, // 8.33% לפיצויים מלאים (סעיף 14)

    kerenHishtalmutEmployeeRate: 0,
    kerenHishtalmutEmployerRate: 0,

    travelReimbursementDailyLimit: 27.1,

    useGlobalOvertime: false,
};

export const VACATION_DAYS_BY_TENURE = [
    { years: 0, days: 12 }, // 1-2
    { years: 2, days: 12 },
    { years: 3, days: 16 }, // 3-5
    { years: 4, days: 16 },
    { years: 5, days: 16 },
    { years: 6, days: 18 }, // 6-10
    { years: 7, days: 18 },
    { years: 8, days: 18 },
    { years: 9, days: 18 },
    { years: 10, days: 18 },
    { years: 11, days: 20 }, // 10+
];

export const HAVRAA_DAYS_BY_TENURE = [
    { years: 1, days: 5 },
    { years: 2, days: 6 },
    { years: 3, days: 7 },
    // שנה 4 ו-5 מוגדרות גם 7 ברוב המקומות, עד הסכמים ספציפיים
    { years: 20, days: 10 }, // תקרה
];

// ==========================================
// הסכמי נוכחות ענפיים — רשימת בחירה ל-UI
// מקור: israel-worklaw-attendance-engine/constants.ts ATTENDANCE_AGREEMENTS
// ==========================================
export interface AttendanceAgreementOption {
    id: string;
    name: string;
    sector: string;
}

export const ATTENDANCE_AGREEMENT_OPTIONS: AttendanceAgreementOption[] = [
    // כללי
    { id: 'regular_5days', name: 'רגילה - 5 ימים (8.4 שעות)', sector: 'כללי' },
    { id: 'regular_6days', name: 'רגילה - 6 ימים (8 שעות)', sector: 'כללי' },
    { id: 'partial', name: 'חלקית (משרה חלקית)', sector: 'כללי' },
    { id: 'night_shift', name: 'לילה (7 שעות)', sector: 'כללי' },
    // שמירה ואבטחה
    { id: 'security_regular', name: 'שמירה - משמרת רגילה (8 שעות)', sector: 'שמירה ואבטחה' },
    { id: 'security_12h', name: 'שמירה - משמרת 12 שעות', sector: 'שמירה ואבטחה' },
    { id: 'security_night', name: 'שמירה - משמרת לילה', sector: 'שמירה ואבטחה' },
    // ניקיון ותחזוקה
    { id: 'cleaning_regular', name: 'ניקיון - משמרת רגילה', sector: 'ניקיון ותחזוקה' },
    { id: 'cleaning_part_time', name: 'ניקיון - משמרת חלקית', sector: 'ניקיון ותחזוקה' },
    // בניין ותשתיות
    { id: 'construction_regular', name: 'בניין - עבודה רגילה', sector: 'בניין ותשתיות' },
    { id: 'construction_summer', name: 'בניין - עונת קיץ (מופחת)', sector: 'בניין ותשתיות' },
    // הובלה והיסעים
    { id: 'transport_driver', name: 'הובלה - נהג רגיל', sector: 'הובלה והיסעים' },
    { id: 'transport_longhaul', name: 'הובלה - נהג קו ארוך', sector: 'הובלה והיסעים' },
    { id: 'transport_bus', name: 'היסעים - נהג אוטובוס', sector: 'הובלה והיסעים' },
    // מסחר וקמעונאות
    { id: 'retail_regular', name: 'מסחר - משמרת רגילה', sector: 'מסחר וקמעונאות' },
    { id: 'retail_shift', name: 'מסחר - עבודת משמרות', sector: 'מסחר וקמעונאות' },
    // מלונאות ותיירות
    { id: 'hotel_regular', name: 'מלונאות - משמרת רגילה', sector: 'מלונאות ותיירות' },
    { id: 'hotel_night', name: 'מלונאות - משמרת לילה', sector: 'מלונאות ותיירות' },
    // תעשייה
    { id: 'factory_morning', name: 'מפעל - משמרת בוקר (8 שעות)', sector: 'תעשייה' },
    { id: 'factory_afternoon', name: 'מפעל - משמרת אחה"צ (8 שעות)', sector: 'תעשייה' },
    { id: 'factory_night', name: 'מפעל - משמרת לילה (7 שעות)', sector: 'תעשייה' },
    { id: 'factory_12h_morning', name: 'מפעל - 12 שעות בוקר', sector: 'תעשייה' },
    { id: 'factory_12h_night', name: 'מפעל - 12 שעות לילה', sector: 'תעשייה' },
    { id: 'factory_week_alternate', name: 'מפעל - שבוע בוקר/שבוע לילה', sector: 'תעשייה' },
    // מתכת ופלסטיקה
    { id: 'metal_regular', name: 'מתכת - משמרת רגילה', sector: 'מתכת ופלסטיקה' },
    // חקלאות
    { id: 'agriculture_regular', name: 'חקלאות - עבודה רגילה', sector: 'חקלאות' },
    { id: 'agriculture_seasonal', name: 'חקלאות - עונת קטיף', sector: 'חקלאות' },
    // הייטק
    { id: 'hightech_regular', name: 'הייטק/משרד - 5 ימים', sector: 'הייטק' },
    { id: 'hightech_global', name: 'הייטק - שעות גמישות גלובליות', sector: 'הייטק' },
    // סיעוד
    { id: 'nursing_home_care', name: 'סיעוד - מטפלת בית', sector: 'סיעוד' },
    { id: 'nursing_institution', name: 'סיעוד - מוסד (משמרות)', sector: 'סיעוד' },
    { id: 'nursing_24h', name: 'סיעוד - מטפלת 24 שעות', sector: 'סיעוד' },
];
