/**
 * FILE: national-insurance.ts
 * PURPOSE: Israeli National Insurance (ביטוח לאומי) + Health Tax (מס בריאות) — 2026
 * PROMOTED FROM: employee-system/employee-platform/src/lib/payroll/national-insurance.ts
 * PROMOTION DATE: 2026-04-15
 * LAST MODIFIED: 2026-04-16 — Verified Values Sprint
 * CHANGES (sprint 2):
 *   - Fixed NI_EMPLOYEE_REDUCED_RATE: 0.4% → 1.04% (source: payroll_verified_operational_values_2026)
 *   - Fixed HEALTH_EMPLOYEE_REDUCED_RATE: 3.1% → 3.23% (combined: 4.27% verified)
 *   - Fixed HEALTH_EMPLOYEE_FULL_RATE: 5.0% → 5.17% (combined: 12.17% verified)
 *   - Fixed NI_EMPLOYER_REDUCED_RATE: 3.55% → 4.51% (source: verified doc)
 *   - Fixed NI_EMPLOYER_FULL_RATE: 7.45% → 7.60% (source: verified doc)
 *   - Added MINIMUM_WAGE_FROM_APRIL_2026 = 6,443.85 (effective 01.04.2026)
 *   - Added MINIMUM_WAGE_HOURLY_182H, MINIMUM_WAGE_HOURLY_186H (verified)
 * CHANGES (sprint 1):
 *   - Fixed MINIMUM_WAGE_2026: 5,880.02 → 6,247.67
 *   - Fixed MAX_INSURABLE_INCOME: 64,190 → 51,910
 *   - Added AVERAGE_WAGE_2026_REPORTED = 13,769
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

/**
 * Israeli National Insurance (ביטוח לאומי) + Health Tax (מס בריאות) — 2026
 * 
 * Two-tier system:
 *  - Reduced rate: income up to 60% of average wage
 *  - Full rate: income above 60% of average wage, up to max insurable income
 * 
 * Source: Bituach Leumi, Israel Tax Authority
 */

// ============================================================================
// Constants — 2026
// ============================================================================

/**
 * Average monthly wage (שכר ממוצע) used by Bהל as the BASE for NI thresholds.
 * NOTE: Bהל uses the PRIOR year's average wage for the current year's thresholds.
 * The 2026 thresholds are calculated from 12,838 (2025 avg wage declared by Bהל).
 * The 2026 reported average wage (13,769) is used for other purposes, NOT for NI thresholds.
 * Source: Verified: 60% × 12,838 = 7,703 matches payroll_tables_seed_2026_01 (מופחת threshold).
 */
export const AVERAGE_WAGE_2026 = 12_838; // Bהל”s base for 2026 NI thresholds (prior year declared avg)
export const AVERAGE_WAGE_2026_REPORTED = 13_769; // Actual 2026 avg wage (source: מי"ה tab, seed doc)

/** 60% of average wage — threshold between reduced & full rate */
export const REDUCED_RATE_THRESHOLD = Math.round(AVERAGE_WAGE_2026 * 0.6); // 7,703 — verified

/**
 * Maximum insurable monthly income.
 * FIXED: Was calculated as AVERAGE_WAGE × 5 = 64,190 (WRONG).
 * Actual value from payroll system tables (payroll_tables_seed_2026_01): 51,910.
 * Source confidence: HIGH.
 * Note: The multiplier is not simply 5× avg wage — the actual basis is unclear;
 * recording verified absolute value.
 */
export const MAX_INSURABLE_INCOME = 51_910; // FIXED: was 64,190

/**
 * Minimum monthly wage for 2026 — until 31.03.2026.
 * FIXED: Was 5,880.02 (stale / incorrect).
 * Source: payroll_tables_seed_2026_01 — HIGH confidence.
 * From 01.04.2026, use MINIMUM_WAGE_FROM_APRIL_2026.
 */
export const MINIMUM_WAGE_2026 = 6_247.67; // Until 31.03.2026

/**
 * Minimum monthly wage from 01.04.2026 (updated).
 * Source: payroll_verified_operational_values_2026 — VERIFIED.
 */
export const MINIMUM_WAGE_FROM_APRIL_2026    = 6_443.85;
export const MINIMUM_WAGE_HOURLY_182H        = 35.40;   // 6,443.85 / 182
export const MINIMUM_WAGE_HOURLY_186H        = 34.64;   // 6,443.85 / 186
export const MINIMUM_WAGE_HOURLY_2026_ESTIMATED = 6_247.67 / 182; // ~34.33 (pre-April)

// ============================================================================
// National Insurance (ביטוח לאומי) Rates — Employee
// Source: payroll_verified_operational_values_2026 — ALL VERIFIED
// ============================================================================

/** Employee NI rate — reduced tier (up to 60% average wage) */
export const NI_EMPLOYEE_REDUCED_RATE  = 0.0104; // 1.04% FIXED: was 0.4%

/** Employee NI rate — full tier (above 60% average wage) */
export const NI_EMPLOYEE_FULL_RATE     = 0.07;   // 7.00% unchanged

// ============================================================================
// National Insurance Rates — Employer
// Source: payroll_verified_operational_values_2026 — ALL VERIFIED
// ============================================================================

/** Employer NI rate — reduced tier */
export const NI_EMPLOYER_REDUCED_RATE  = 0.0451; // 4.51% FIXED: was 3.55%

/** Employer NI rate — full tier */
export const NI_EMPLOYER_FULL_RATE     = 0.076;  // 7.60% FIXED: was 7.45%

// ============================================================================
// Health Tax (מס בריאות) Rates
// Source: payroll_verified_operational_values_2026 — ALL VERIFIED
// Combined checks: reduced 1.04+3.23=4.27% / full 7.00+5.17=12.17% (both match seed)
// ============================================================================

/** Employee Health Tax — reduced tier */
export const HEALTH_EMPLOYEE_REDUCED_RATE = 0.0323; // 3.23% FIXED: was 3.1%

/** Employee Health Tax — full tier */
export const HEALTH_EMPLOYEE_FULL_RATE    = 0.0517; // 5.17% FIXED: was 5.0%

// ============================================================================
// Calculation Functions
// ============================================================================

export interface NIResult {
    /** Employee NI payment (ביטוח לאומי עובד) */
    niEmployee: number;
    /** Employer NI payment (ביטוח לאומי מעסיק) */
    niEmployer: number;
    /** Employee health tax (מס בריאות עובד) */
    healthEmployee: number;
    /** Total employee deductions (NI + health) */
    totalEmployee: number;
    /** Total employer cost */
    totalEmployer: number;
    /** Breakdown for transparency */
    breakdown: {
        reducedPortionIncome: number;
        fullPortionIncome: number;
        niEmployeeReduced: number;
        niEmployeeFull: number;
        healthReduced: number;
        healthFull: number;
    };
}

/**
 * Calculate National Insurance + Health Tax for a given gross salary.
 * חישוב ביטוח לאומי + מס בריאות
 * 
 * @param grossSalary - Monthly gross salary
 * @param isOver67 - If true, different (lower) rates may apply for retirees
 * @returns Full NI breakdown
 */
export function calculateNationalInsurance(
    grossSalary: number,
    isOver67: boolean = false,
    taxYear: number = 2026
): NIResult {
    if (grossSalary <= 0) {
        return {
            niEmployee: 0, niEmployer: 0, healthEmployee: 0,
            totalEmployee: 0, totalEmployer: 0,
            breakdown: {
                reducedPortionIncome: 0, fullPortionIncome: 0,
                niEmployeeReduced: 0, niEmployeeFull: 0,
                healthReduced: 0, healthFull: 0,
            },
        };
    }

    // Cap at max insurable income
    const insurable = Math.min(grossSalary, MAX_INSURABLE_INCOME);

    // Split into two tiers
    const reducedPortion = Math.min(insurable, REDUCED_RATE_THRESHOLD);
    const fullPortion = Math.max(0, insurable - REDUCED_RATE_THRESHOLD);

    // Employee National Insurance
    // Over 67 — no NI, only health tax (simplified)
    const niEmployeeReduced = isOver67 ? 0 : reducedPortion * NI_EMPLOYEE_REDUCED_RATE;
    const niEmployeeFull = isOver67 ? 0 : fullPortion * NI_EMPLOYEE_FULL_RATE;
    const niEmployee = niEmployeeReduced + niEmployeeFull;

    // Employer National Insurance
    const niEmployerReduced = reducedPortion * NI_EMPLOYER_REDUCED_RATE;
    const niEmployerFull = fullPortion * NI_EMPLOYER_FULL_RATE;
    const niEmployer = niEmployerReduced + niEmployerFull;

    // Health Tax (employee only — no employer health tax)
    const healthReduced = reducedPortion * HEALTH_EMPLOYEE_REDUCED_RATE;
    const healthFull = fullPortion * HEALTH_EMPLOYEE_FULL_RATE;
    const healthEmployee = healthReduced + healthFull;

    return {
        niEmployee: round2(niEmployee),
        niEmployer: round2(niEmployer),
        healthEmployee: round2(healthEmployee),
        totalEmployee: round2(niEmployee + healthEmployee),
        totalEmployer: round2(niEmployer),
        breakdown: {
            reducedPortionIncome: round2(reducedPortion),
            fullPortionIncome: round2(fullPortion),
            niEmployeeReduced: round2(niEmployeeReduced),
            niEmployeeFull: round2(niEmployeeFull),
            healthReduced: round2(healthReduced),
            healthFull: round2(healthFull),
        },
    };
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
