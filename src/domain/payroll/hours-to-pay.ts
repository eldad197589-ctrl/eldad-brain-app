/**
 * FILE: hours-to-pay.ts
 * PURPOSE: Bridge — Attendance Hours → Payroll NIS Values
 * CREATED: 2026-04-16 — Gap Closure Sprint (Gap 3)
 * CONTEXT:
 *   calculate-overtime-tiers.ts returns HourTierBreakdown (hours at each rate tier).
 *   gross-to-net.ts expects PayrollInput.overtimePay in NIS (₪).
 *   This file bridges the two: converts hour-tier breakdown into monetary components.
 * DEPENDENCIES:
 *   - ./calculate-overtime-tiers (HourTierBreakdown)
 *   - ./labor-law-constants (LOCKED_PARAMS for HOURLY_DIVISOR)
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

import { HourTierBreakdown } from './calculate-overtime-tiers';
import { LOCKED_PARAMS } from './labor-law-constants';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for converting a monthly attendance summary into payroll NIS values.
 * Use this when the caller has a monthly hours summary (not day-by-day breakdown).
 */
export interface MonthlyHoursSummary {
    /** Total regular hours worked (100%) */
    regularHours: number;
    /** Total overtime hours at 125% */
    overtime125Hours: number;
    /** Total overtime hours at 150% */
    overtime150Hours: number;
    /** Total Sabbath/holiday hours at 150% */
    sabbath150Hours: number;
    /** Total Sabbath/holiday hours at 200% */
    sabbath200Hours: number;
    /** Total night bonus hours (for employers who pay night premium) */
    nightBonusHours?: number;
    /** Night bonus multiplier (e.g. 1.20 = 120%) — from company settings */
    nightBonusRate?: number;
}

/**
 * The NIS output ready to feed into PayrollInput.
 */
export interface HourlyPayComponents {
    /** Base gross salary calculated from standard hours (₪) */
    baseSalary: number;
    /** Overtime premium pay — the EXTRA amount above base (₪) */
    overtimePay: number;
    /** Night bonus extra amount (₪) — 0 if not applicable */
    nightBonusPay: number;
    /** Total gross before travel/convalescence (₪) */
    totalGrossFromHours: number;
    /** Effective hourly rate used for calculation (₪/hour) */
    hourlyRate: number;
    /** Breakdown for transparency */
    breakdown: {
        regular100Pay: number;
        overtime125Pay: number;   // Extra 25% on top of base
        overtime150Pay: number;   // Extra 50% on top of base
        sabbath150Pay: number;    // Extra 50% on sabbath
        sabbath200Pay: number;    // Extra 100% on sabbath
    };
}

// ============================================================================
// Core Helper Functions
// ============================================================================

/**
 * Derive the hourly rate from a monthly gross salary.
 * Uses the standard Israeli divisor of 182 hours/month.
 *
 * @param monthlySalary - Monthly base salary in ₪
 * @param customDivisor - Override (default: 182 per LOCKED_PARAMS.HOURLY_DIVISOR)
 * @returns Hourly rate in ₪
 */
export function deriveHourlyRate(
    monthlySalary: number,
    customDivisor?: number
): number {
    const divisor = customDivisor ?? LOCKED_PARAMS.HOURLY_DIVISOR; // 182
    if (divisor <= 0 || monthlySalary < 0) return 0;
    return Math.round((monthlySalary / divisor) * 100) / 100;
}

/**
 * Convert a HourTierBreakdown (single day) into its NIS monetary value.
 * Used when processing day-by-day attendance logs.
 *
 * @param tiers - The hour tier breakdown from calculateHourTiers()
 * @param hourlyRate - The employee's hourly rate in ₪
 * @param nightBonusRate - Night hours multiplier (e.g. 1.20). Default: 1.0 (no bonus)
 * @returns NIS pay components for that day
 */
export function convertDayTiersToNIS(
    tiers: HourTierBreakdown,
    hourlyRate: number,
    nightBonusRate: number = 1.0
): HourlyPayComponents {
    if (hourlyRate <= 0) {
        return buildZeroComponents(hourlyRate);
    }

    // Base pay for each tier
    const regular100Pay   = tiers.hours100 * hourlyRate * 1.00;
    const tier125Pay      = tiers.hours125 * hourlyRate * 1.25;
    const tier150Pay      = (tiers.hours150 + tiers.hours175 / 1.50 * 1.50) * hourlyRate * 1.50; // simplified

    // For sabbath hours stored in hours150/hours200:
    const sabbath150Pay   = tiers.hours150 * hourlyRate * 1.50; // if isSabbath
    const sabbath200Pay   = tiers.hours200 * hourlyRate * 2.00;

    // Night bonus on night hours (above regular base)
    const nightBonusPay = nightBonusRate > 1.0
        ? tiers.nightHours * hourlyRate * (nightBonusRate - 1.0)
        : 0;

    // Total gross from hours
    const totalGrossFromHours = Math.round((
        regular100Pay + tier125Pay + tier150Pay + sabbath200Pay + nightBonusPay
    ) * 100) / 100;

    // overtimePay = total above base salary for this day
    const overtimePay = Math.round((
        totalGrossFromHours - regular100Pay
    ) * 100) / 100;

    return {
        baseSalary: Math.round(regular100Pay * 100) / 100,
        overtimePay: Math.max(0, overtimePay),
        nightBonusPay: Math.round(nightBonusPay * 100) / 100,
        totalGrossFromHours,
        hourlyRate,
        breakdown: {
            regular100Pay: Math.round(regular100Pay * 100) / 100,
            overtime125Pay: Math.round((tiers.hours125 * hourlyRate * 0.25) * 100) / 100, // extra 25%
            overtime150Pay: Math.round((tiers.hours150 * hourlyRate * 0.50) * 100) / 100, // extra 50%
            sabbath150Pay:  Math.round(sabbath150Pay * 100) / 100,
            sabbath200Pay:  Math.round(sabbath200Pay * 100) / 100,
        }
    };
}

/**
 * Convert a monthly hours summary into payroll NIS components.
 * This is the PRIMARY function to use when bridging attendance totals → PayrollInput.
 *
 * Typical usage:
 * ```typescript
 * const hourlyRate = deriveHourlyRate(employee.baseSalary);
 * const pay = convertMonthlyHoursToNIS(monthlySummary, hourlyRate);
 * const result = PayrollService.calculateFullPayroll({
 *   grossSalary: pay.baseSalary,
 *   overtimePay: pay.overtimePay,
 *   taxCreditPoints,
 *   taxYear: 2026,
 * });
 * ```
 *
 * @param summary - Monthly aggregated hours by tier
 * @param hourlyRate - Employee's hourly rate in ₪
 * @returns NIS components ready for PayrollInput
 */
export function convertMonthlyHoursToNIS(
    summary: MonthlyHoursSummary,
    hourlyRate: number
): HourlyPayComponents {
    if (hourlyRate <= 0) {
        return buildZeroComponents(hourlyRate);
    }

    const nightBonusRate = summary.nightBonusRate ?? 1.0;

    // Base pay (100% hours)
    const regular100Pay = summary.regularHours * hourlyRate;

    // Overtime EXTRA amounts (not total, just the premium above 100%)
    const extra125    = summary.overtime125Hours * hourlyRate * 0.25; // 25% premium
    const extra150    = summary.overtime150Hours * hourlyRate * 0.50; // 50% premium
    const extraSab150 = summary.sabbath150Hours  * hourlyRate * 0.50; // 50% on sabbath
    const extraSab200 = summary.sabbath200Hours  * hourlyRate * 1.00; // 100% on sabbath

    // Night bonus
    const nightBonusPay = (summary.nightBonusHours ?? 0) * hourlyRate * (nightBonusRate - 1.0);

    // Total overtime premium (all extras combined — this is PayrollInput.overtimePay)
    const overtimePay = round2(extra125 + extra150 + extraSab150 + extraSab200 + nightBonusPay);

    // Total gross
    const totalGrossFromHours = round2(regular100Pay + overtimePay);

    return {
        baseSalary:         round2(regular100Pay),
        overtimePay:        Math.max(0, overtimePay),
        nightBonusPay:      round2(nightBonusPay),
        totalGrossFromHours,
        hourlyRate,
        breakdown: {
            regular100Pay:  round2(regular100Pay),
            overtime125Pay: round2(extra125),
            overtime150Pay: round2(extra150),
            sabbath150Pay:  round2(extraSab150),
            sabbath200Pay:  round2(extraSab200),
        }
    };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Quick helper: derive hourly rate from monthly salary + build pay components
 * from a monthly hours summary in one step.
 *
 * @param monthlySalary - Monthly base salary (₪)
 * @param summary - Monthly hours broken down by tier
 * @returns Pay components ready for PayrollInput
 */
export function monthlyHoursToPay(
    monthlySalary: number,
    summary: MonthlyHoursSummary
): HourlyPayComponents {
    const hourlyRate = deriveHourlyRate(monthlySalary);
    return convertMonthlyHoursToNIS(summary, hourlyRate);
}

function buildZeroComponents(hourlyRate: number): HourlyPayComponents {
    return {
        baseSalary: 0,
        overtimePay: 0,
        nightBonusPay: 0,
        totalGrossFromHours: 0,
        hourlyRate,
        breakdown: {
            regular100Pay: 0,
            overtime125Pay: 0,
            overtime150Pay: 0,
            sabbath150Pay: 0,
            sabbath200Pay: 0,
        }
    };
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
