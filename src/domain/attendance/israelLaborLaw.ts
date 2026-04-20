/* ============================================
   FILE: israelLaborLaw.ts
   PURPOSE: Israel Labor Law constants & rates — promoted from
            israel-worklaw-attendance-engine/constants.ts
   DEPENDENCIES: none (pure data)
   EXPORTS: ISRAEL_LABOR_LAW, OVERTIME_RATES
   SOURCE: israel-worklaw-attendance-engine/constants.ts lines 2-21
   ============================================ */

/**
 * Israeli labor law base constants.
 * Source: חוק שעות עבודה ומנוחה, תשי"א-1951
 */
export const ISRAEL_LABOR_LAW = {
  /** 42 hours per week (current Israeli labor law) */
  STANDARD_WEEKLY_HOURS: 42,
  /** 42 / 5 = 8.4 hours per day in a 5-day week */
  STANDARD_DAILY_HOURS_5_DAYS: 8.4,
  /** 42 / 6 = 7.0 hours per day in a 6-day week */
  STANDARD_DAILY_HOURS_6_DAYS: 7.0,
  /** First 2 overtime hours are at 125% */
  MAX_DAILY_OVERTIME_125: 2.0,
  /** Night shift standard = 7 hours */
  NIGHT_SHIFT_HOURS: 7.0,

  // Night Shift Definition (22:00 - 06:00)
  NIGHT_START_HOUR: 22,
  NIGHT_END_HOUR: 6,
  /** Minimum night-window hours to qualify as "night shift" */
  MIN_NIGHT_HOURS_FOR_NIGHT_SHIFT: 2,
} as const;

/**
 * Overtime rate multipliers.
 * Source: חוק שעות עבודה ומנוחה, סעיפים 16-17
 */
export const OVERTIME_RATES = {
  REGULAR: 1.0,
  OT_125: 1.25,
  OT_150: 1.5,
  SHABBAT_HOLIDAY_175: 1.75,
  SHABBAT_HOLIDAY_200: 2.0,
} as const;
