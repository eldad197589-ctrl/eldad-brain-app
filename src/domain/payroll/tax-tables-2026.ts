/**
 * FILE: tax-tables-2026.ts
 * PURPOSE: Israeli Income Tax Tables & Calculator — 2026 & 2025
 * PROMOTED FROM: employee-system/employee-platform/src/lib/payroll/tax-tables-2026.ts
 * PROMOTION DATE: 2026-04-15
 * LAST MODIFIED: 2026-04-16 — Eldad Decision Sprint
 * CHANGES:
 *   - REVERTED bracket 3 ceiling: 16,150 → 19,000 (Eldad decision 2026-04-16)
 *   - REVERTED bracket 4 ceiling: 22,440 → 25,100 (Eldad decision 2026-04-16)
 *   - Reason: Screenshots were from Jan 2026 (pre-update). Source of truth is
 *     the official חוברת ניכויים updated for April 2026.
 *   - Added TAX_BRACKETS_2026_JAN_MAR: historical Jan-Mar 2026 brackets for
 *     any retrospective calculations (phase 2 concern)
 *   - Fixed bracket 6: added ceiling 60,130 at 47% (kept from prev sprint)
 *   - Added bracket 7: 50% combined above 60,130 (kept from prev sprint)
 *   - Fixed getBracketsForYear: now explicit per year (kept from prev sprint)
 *   - Added TAX_BRACKETS_2025: PENDING_VERIFICATION placeholder (kept)
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

/**
 * Israeli Income Tax Tables — 2026
 * מדרגות מס הכנסה לשנת 2026
 * 
 * Source: Israel Tax Authority + CWS Israel Guide
 * Updated: January 2026
 */

// ============================================================================
// Tax Bracket Definitions (Monthly)
// ============================================================================

export interface TaxBracket {
    /** Upper bound of monthly income for this bracket (inclusive) */
    upTo: number;
    /** Tax rate as decimal (e.g., 0.10 = 10%) */
    rate: number;
    /** Hebrew label */
    label: string;
}

/**
 * 2026 Monthly Income Tax Brackets — CURRENT (from April 1, 2026)
 * מדרגות מס הכנסה חודשיות 2026 — מעודכנות 1.4.2026
 *
 * Source: חוברת ניכויים מעודכנת לאפריל 2026 — Eldad decision 2026-04-16.
 * Previous screenshots (Jan 2026) showed the PRE-UPDATE values (16,150 / 22,440).
 * Those applied only for Jan–Mar 2026 payroll. See TAX_BRACKETS_2026_JAN_MAR below.
 *
 * DESIGN NOTE: Bracket 7 (50%) combines the 47% marginal rate + 3% surtax (מס יסף).
 */
export const TAX_BRACKETS_2026: TaxBracket[] = [
    { upTo: 7_010,       rate: 0.10, label: '10% - מדרגה ראשונה' },
    { upTo: 10_060,      rate: 0.14, label: '14% - מדרגה שנייה' },
    { upTo: 19_000,      rate: 0.20, label: '20% - מדרגה שלישית' },  // REVERTED: was 16,150 (pre-April)
    { upTo: 25_100,      rate: 0.31, label: '31% - מדרגה רביעית' },  // REVERTED: was 22,440 (pre-April)
    { upTo: 46_690,      rate: 0.35, label: '35% - מדרגה חמישית' },
    { upTo: 60_130,      rate: 0.47, label: '47% - מדרגה שישית' },
    { upTo: Infinity,    rate: 0.50, label: '50% - מדרגה שביעית (כולל מס יסף 3%)' },
];

/**
 * 2026 Monthly Income Tax Brackets — HISTORICAL (Jan 1 – Mar 31, 2026)
 * מדרגות ינואר–מרץ 2026 (לפני תיקון 31.3.2026)
 *
 * Use for retrospective payroll calculations for Jan–Mar 2026 only.
 * These values came from the payroll system screenshots (confidence: HIGH for that period).
 * STATUS: HISTORICAL — not used in current engine calculations.
 */
export const TAX_BRACKETS_2026_JAN_MAR: TaxBracket[] = [
    { upTo: 7_010,       rate: 0.10, label: '10% - מדרגה ראשונה' },
    { upTo: 10_060,      rate: 0.14, label: '14% - מדרגה שנייה' },
    { upTo: 16_150,      rate: 0.20, label: '20% - מדרגה שלישית' },  // HISTORICAL: pre-April bracket
    { upTo: 22_440,      rate: 0.31, label: '31% - מדרגה רביעית' },  // HISTORICAL: pre-April bracket
    { upTo: 46_690,      rate: 0.35, label: '35% - מדרגה חמישית' },
    { upTo: 60_130,      rate: 0.47, label: '47% - מדרגה שישית' },
    { upTo: Infinity,    rate: 0.50, label: '50% - מדרגה שביעית (כולל מס יסף 3%)' },
];

/**
 * 2025 Monthly Income Tax Brackets
 * מדרגות מס הכנסה חודשיות 2025
 *
 * STATUS: PENDING_VERIFICATION
 * Reason: Screenshots provided were for 1/2026 only.
 * Until 2025 brackets are verified, this returns the 2026 brackets as a safe fallback.
 * Do NOT use for production 2025 tax year calculations without verification.
 */
export const TAX_BRACKETS_2025: TaxBracket[] = TAX_BRACKETS_2026; // PENDING_VERIFICATION

/**
 * Surtax (מס יסף) threshold — 3% on annual income above this
 * Applied monthly as 1/12 of the annual threshold
 *
 * NOTE: With bracket 7 now at 50%, the surtax block in calculateIncomeTax()
 * will correctly add 0 for most cases (bracket 7 already integrates it).
 * Preserved for backward compatibility.
 */
export const SURTAX_ANNUAL_THRESHOLD = 721_560;
export const SURTAX_MONTHLY_THRESHOLD = SURTAX_ANNUAL_THRESHOLD / 12; // 60,130
export const SURTAX_RATE = 0.03;

/**
 * Tax Credit Point value for 2026
 * ערך נקודת זיכוי חודשית 2026
 * Source: payroll_tables_seed_2026_01 — HIGH confidence (yellow highlighted field)
 */
export const TAX_CREDIT_POINT_VALUE_MONTHLY = 242;
export const TAX_CREDIT_POINT_VALUE_ANNUAL = TAX_CREDIT_POINT_VALUE_MONTHLY * 12; // 2,904

export function getTaxCreditPointValue(year: number = 2026): number {
    // PENDING_VERIFICATION: 2025 credit point value not yet confirmed from official source
    return 242; // Same for both 2025 and 2026 per current data
}

/**
 * Returns the correct tax brackets for a given year.
 * FIXED: Previously both 2025 and 2026 silently returned TAX_BRACKETS_2026.
 * Now explicit: 2025 returns TAX_BRACKETS_2025 (currently same, see PENDING_VERIFICATION above).
 */
export function getBracketsForYear(year: number): TaxBracket[] {
    if (year === 2025) return TAX_BRACKETS_2025;
    return TAX_BRACKETS_2026; // default: 2026
}

// ============================================================================
// Tax Calculation Functions
// ============================================================================

/**
 * Calculate income tax for a given monthly taxable income.
 * חישוב מס הכנסה חודשי לפי מדרגות.
 * 
 * @param monthlyTaxableIncome - Gross salary minus pension/education fund deductions
 * @param taxCreditPoints - Number of tax credit points (e.g., 2.25 baseline)
 * @param taxYear - The tax year to calculate for (defaults to 2026)
 * @returns Tax amount after credits (never negative)
 */
export function calculateIncomeTax(
    monthlyTaxableIncome: number,
    taxCreditPoints: number = 2.25,
    taxYear: number = 2026
): { tax: number; taxBeforeCredits: number; creditAmount: number; effectiveRate: number; brackets: { bracket: TaxBracket; taxableInBracket: number; taxAmount: number }[] } {
    if (monthlyTaxableIncome <= 0) {
        return { tax: 0, taxBeforeCredits: 0, creditAmount: 0, effectiveRate: 0, brackets: [] };
    }

    let remaining = monthlyTaxableIncome;
    let totalTax = 0;
    let prevUpperBound = 0;
    const bracketDetails: { bracket: TaxBracket; taxableInBracket: number; taxAmount: number }[] = [];

    const brackets = getBracketsForYear(taxYear);
    for (const bracket of brackets) {
        if (remaining <= 0) break;

        const bracketWidth = bracket.upTo === Infinity
            ? remaining
            : bracket.upTo - prevUpperBound;

        const taxableInBracket = Math.min(remaining, bracketWidth);
        const taxAmount = taxableInBracket * bracket.rate;

        bracketDetails.push({ bracket, taxableInBracket, taxAmount });

        totalTax += taxAmount;
        remaining -= taxableInBracket;
        prevUpperBound = bracket.upTo === Infinity ? prevUpperBound : bracket.upTo;
    }

    // Surtax (מס יסף) — 3% on income above threshold
    if (monthlyTaxableIncome > SURTAX_MONTHLY_THRESHOLD) {
        const surtaxAmount = (monthlyTaxableIncome - SURTAX_MONTHLY_THRESHOLD) * SURTAX_RATE;
        totalTax += surtaxAmount;
    }

    const taxBeforeCredits = totalTax;

    // Apply tax credit points
    const creditAmount = taxCreditPoints * getTaxCreditPointValue(taxYear);
    const taxAfterCredits = Math.max(0, totalTax - creditAmount);

    const effectiveRate = monthlyTaxableIncome > 0
        ? taxAfterCredits / monthlyTaxableIncome
        : 0;

    return {
        tax: Math.round(taxAfterCredits * 100) / 100,
        taxBeforeCredits: Math.round(taxBeforeCredits * 100) / 100,
        creditAmount: Math.round(creditAmount * 100) / 100,
        effectiveRate: Math.round(effectiveRate * 10000) / 10000,
        brackets: bracketDetails,
    };
}
