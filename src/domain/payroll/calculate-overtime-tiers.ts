/**
 * FILE: calculate-overtime-tiers.ts
 * PURPOSE: Hour Tier Breakdown Calculator (Regular / Overtime / Sabbath)
 * PROMOTED FROM: employee-system/employee-platform/src/lib/calculate-overtime-tiers.ts
 * PROMOTION DATE: 2026-04-15
 * WAVE: 1C
 * ADAPTATION: Changed import path from `"./labor-law-constants"` (external) to local `"./labor-law-constants"` (Wave 1A copy)
 * EXTERNAL IMPORTS: NONE (resolved via Wave 1A)
 * RUNTIME TOUCH: NONE
 */

import { LOCKED_PARAMS, CompanySettings } from "./labor-law-constants";

/**
 * Hour tier breakdown result
 */
export interface HourTierBreakdown {
    hours100: number;      // Regular hours at 100%
    hours125: number;      // First 2 overtime hours at 125%
    hours150: number;      // Additional overtime at 150%
    hours175: number;      // Sabbath/Holiday at 175% (first 2 hours)
    hours200: number;      // Sabbath/Holiday at 200% (additional hours)
    totalHours: number;
    isOvertime: boolean;
    isSabbath: boolean;
    nightHours: number;
}

/**
 * Options for calculating hour tiers
 */
export interface TierCalculationOptions {
    /** Is this day a Sabbath (Saturday) */
    isSabbath?: boolean;
    /** Is this day a holiday */
    isHoliday?: boolean;
    /** Is this day a Friday (shorter day) */
    isFriday?: boolean;
    /** Night hours worked (22:00-06:00) */
    nightHours?: number;
    /** Company settings override (uses defaults if not provided) */
    companySettings?: Partial<CompanySettings>;
}

/**
 * Calculate the standard daily hours based on company workweek
 * 
 * Israeli law: 42 hours/week max
 * - 6-day week: 42/6 = 7 hours/day (but standard is 8 with overtime allowed)
 * - 5-day week: 42/5 = 8.4 hours/day (round to 8.5 or 9 depending on company)
 */
export function getStandardDailyHours(
    settings?: Partial<CompanySettings>,
    isFriday?: boolean
): number {
    const weeklyHours = settings?.fullTimeWeeklyHours ?? LOCKED_PARAMS.WEEKLY_MAX_HOURS;

    // Friday is typically a shorter day in Israel
    if (isFriday) {
        return LOCKED_PARAMS.NIGHT_WORK_MAX_HOURS_REGULAR; // 7 hours
    }

    // Standard daily hours based on 5-day workweek
    // (most companies now use 5-day, especially if fullTimeWeeklyHours is set)
    const workDaysPerWeek = 5;
    const dailyHours = weeklyHours / workDaysPerWeek;

    // Cap at legal daily max
    return Math.min(dailyHours, LOCKED_PARAMS.DAILY_MAX_HOURS);
}

/**
 * Calculate hour tier breakdown for a single day
 * 
 * Logic:
 * - Regular workday: First 8 hours = 100%, next 2 = 125%, beyond = 150%
 * - Sabbath/Holiday: First hours = 150%, beyond = 200%
 * - Friday (pre-Sabbath): Standard day is 7 hours
 */
export function calculateHourTiers(
    totalHours: number,
    options: TierCalculationOptions = {}
): HourTierBreakdown {
    const {
        isSabbath = false,
        isHoliday = false,
        isFriday = false,
        nightHours = 0,
        companySettings
    } = options;

    const result: HourTierBreakdown = {
        hours100: 0,
        hours125: 0,
        hours150: 0,
        hours175: 0,
        hours200: 0,
        totalHours,
        isOvertime: false,
        isSabbath: isSabbath || isHoliday,
        nightHours
    };

    if (totalHours <= 0) return result;

    // Sabbath and holidays have different rate structure
    if (isSabbath || isHoliday) {
        // All hours on Sabbath/Holiday are at premium rates
        // First 2 hours at 150%, rest at 200% (per common practice)
        // Note: Some companies pay 150% for all Sabbath hours
        const sabbathTier1Hours = Math.min(totalHours, LOCKED_PARAMS.OVERTIME_TIER1_HOURS);
        const sabbathTier2Hours = Math.max(0, totalHours - LOCKED_PARAMS.OVERTIME_TIER1_HOURS);

        result.hours150 = sabbathTier1Hours;
        result.hours200 = sabbathTier2Hours;
        result.isOvertime = false; // All hours are premium on Sabbath
        return result;
    }

    // Regular workday calculation
    const standardDailyHours = getStandardDailyHours(companySettings, isFriday);

    // Regular hours (100%)
    result.hours100 = Math.min(totalHours, standardDailyHours);

    const remainingAfterRegular = totalHours - standardDailyHours;

    if (remainingAfterRegular > 0) {
        result.isOvertime = true;

        // First 2 overtime hours at 125%
        const tier1Overtime = Math.min(
            remainingAfterRegular,
            LOCKED_PARAMS.OVERTIME_TIER1_HOURS
        );
        result.hours125 = tier1Overtime;

        // Additional overtime at 150%
        const tier2Overtime = Math.max(0, remainingAfterRegular - LOCKED_PARAMS.OVERTIME_TIER1_HOURS);
        result.hours150 = tier2Overtime;
    }

    return result;
}

/**
 * Recalculate hour tiers for an attendance log based on settings
 * Returns the updated tier values (does not mutate the original)
 */
export function recalculateTiersForLog(
    totalHours: number,
    dayInfo: {
        dayOfWeek?: string;
        isSabbath?: boolean;
        isHoliday?: boolean;
        nightHours?: number;
    },
    companySettings?: Partial<CompanySettings>
): Pick<HourTierBreakdown, 'hours100' | 'hours125' | 'hours150' | 'hours175' | 'hours200'> {
    // Detect day type from Hebrew day names
    const isSabbath = dayInfo.isSabbath ||
        dayInfo.dayOfWeek === "ש'" ||
        dayInfo.dayOfWeek === 'ש' ||
        dayInfo.dayOfWeek === 'יום שבת';

    const isFriday = dayInfo.dayOfWeek === "ו'" ||
        dayInfo.dayOfWeek === 'ו' ||
        dayInfo.dayOfWeek === 'יום שישי';

    const result = calculateHourTiers(totalHours, {
        isSabbath,
        isHoliday: dayInfo.isHoliday,
        isFriday,
        nightHours: dayInfo.nightHours,
        companySettings
    });

    return {
        hours100: result.hours100,
        hours125: result.hours125,
        hours150: result.hours150,
        hours175: result.hours175,
        hours200: result.hours200
    };
}
