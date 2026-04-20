/**
 * FILE: tax-credits.ts
 * PURPOSE: Israeli Tax Credits Calculator (נקודות זיכוי) — 2026
 * PROMOTED FROM: employee-system/employee-platform/src/lib/payroll/tax-credits.ts
 * PROMOTION DATE: 2026-04-15
 * WAVE: 1B
 * ADAPTATION: Replaced `import type { Form101Data } from '@/types/form-101'` with local TaxCreditFormInput interface
 * EXTERNAL IMPORTS: NONE (after adaptation)
 * RUNTIME TOUCH: NONE
 */

/**
 * Israeli Tax Credits Calculator (נקודות זיכוי) — 2026
 * 
 * Calculates the total number of tax credit points an employee
 * is entitled to based on their Form 101 data.
 * 
 * Source: Israel Tax Authority — Tax Credit Point Rules
 */

// ============================================================================
// Local Type Definition (replaces external Form101Data import)
// ============================================================================

/**
 * Minimal interface for tax credit calculation.
 * Extracted from the fields actually used by calculateTaxCredits().
 */
export interface TaxCreditFormInput {
    is_israeli_resident?: boolean;
    gender?: 'male' | 'female';
    is_new_immigrant?: boolean;
    aliyah_year?: number;
    is_discharged_soldier?: boolean;
    discharge_date?: string;
    has_degree?: boolean;
    degree_type?: 'bachelor' | 'master' | 'doctorate' | 'diploma';
    children?: { birth_date: string; full_name?: string }[];
    is_single_parent?: boolean;
    has_disability?: boolean;
    disability_percentage?: number;
}

// ============================================================================
// Tax Credit Rules
// ============================================================================

export interface TaxCreditBreakdown {
    /** Total credit points */
    totalPoints: number;
    /** Breakdown by category */
    items: { category: string; points: number; reason: string }[];
}

/**
 * Calculate tax credit points from Form 101 data.
 * חישוב נקודות זיכוי מתוך טופס 101.
 * 
 * Standard credit points (2026):
 * - Israeli resident: 2.25 points
 * - Female worker: +0.5 points
 * - New immigrant: up to 3 points (first 18 months), then 2, then 1
 * - Discharged soldier: 2 points (first 36 months after discharge)
 * - Academic degree: 1 point (bachelor/diploma), 0.5 point (master/doctorate)
 * - Children under 18: variable by age
 * - Single parent: 1 point
 * - Disability: 2 points
 * 
 * @param form101 - Form 101 data
 * @param referenceDate - Date to calculate relative credits (default: now)
 */
export function calculateTaxCredits(
    form101: Partial<TaxCreditFormInput>,
    referenceDate: Date = new Date()
): TaxCreditBreakdown {
    const items: { category: string; points: number; reason: string }[] = [];

    // 1. Israeli Resident — 2.25 points (baseline)
    if (form101.is_israeli_resident !== false) {
        items.push({ category: 'תושב ישראל', points: 2.25, reason: 'נקודות בסיס לתושב ישראל' });
    }

    // 2. Gender — Female gets additional 0.5 points
    if (form101.gender === 'female') {
        items.push({ category: 'אישה', points: 0.5, reason: 'נקודת זיכוי לאישה' });
    }

    // 3. New Immigrant (עולה חדש)
    if (form101.is_new_immigrant && form101.aliyah_year) {
        const aliyahDate = new Date(form101.aliyah_year, 0, 1);
        const monthsSinceAliyah = monthsBetween(aliyahDate, referenceDate);

        if (monthsSinceAliyah <= 18) {
            items.push({ category: 'עולה חדש', points: 3, reason: '18 חודשים ראשונים מהעלייה' });
        } else if (monthsSinceAliyah <= 30) {
            items.push({ category: 'עולה חדש', points: 2, reason: 'חודשים 19-30 מהעלייה' });
        } else if (monthsSinceAliyah <= 42) {
            items.push({ category: 'עולה חדש', points: 1, reason: 'חודשים 31-42 מהעלייה' });
        }
    }

    // 4. Discharged Soldier (חייל משוחרר)
    if (form101.is_discharged_soldier && form101.discharge_date) {
        const dischargeDate = new Date(form101.discharge_date);
        const monthsSinceDischarge = monthsBetween(dischargeDate, referenceDate);

        if (monthsSinceDischarge <= 36) {
            items.push({
                category: 'חייל משוחרר',
                points: 2,
                reason: `${monthsSinceDischarge} חודשים מהשחרור (זכאי עד 36 חודשים)`,
            });
        }
    }

    // 5. Academic Degree (תואר אקדמי)
    if (form101.has_degree) {
        switch (form101.degree_type) {
            case 'bachelor':
            case 'diploma':
                items.push({ category: 'תואר ראשון', points: 1, reason: 'תואר ראשון / תעודת הוראה' });
                break;
            case 'master':
                items.push({ category: 'תואר שני', points: 0.5, reason: 'תואר שני' });
                break;
            case 'doctorate':
                items.push({ category: 'דוקטורט', points: 0.5, reason: 'תואר דוקטור' });
                break;
        }
    }

    // 6. Children (ילדים)
    if (form101.children && form101.children.length > 0) {
        let childPoints = 0;
        let childReasons: string[] = [];

        for (const child of form101.children) {
            if (!child.birth_date) continue;

            const childBirthDate = new Date(child.birth_date);
            const ageInMonths = monthsBetween(childBirthDate, referenceDate);
            const ageInYears = ageInMonths / 12;

            if (ageInYears < 1) {
                // Child born in current tax year
                childPoints += 1.5;
                childReasons.push(`${child.full_name} (עד גיל 1) — 1.5 נק'`);
            } else if (ageInYears >= 1 && ageInYears < 5) {
                childPoints += 2.5;
                childReasons.push(`${child.full_name} (גיל 1-5) — 2.5 נק'`);
            } else if (ageInYears >= 5 && ageInYears < 18) {
                childPoints += 1;
                childReasons.push(`${child.full_name} (גיל 5-18) — 1 נק'`);
            }
        }

        if (childPoints > 0) {
            items.push({
                category: 'ילדים',
                points: childPoints,
                reason: childReasons.join('; '),
            });
        }
    }

    // 7. Single Parent (הורה יחיד)
    if (form101.is_single_parent) {
        items.push({ category: 'הורה יחיד', points: 1, reason: 'נקודת זיכוי להורה יחידני' });
    }

    // 8. Disability (נכות)
    if (form101.has_disability) {
        const disabilityPct = form101.disability_percentage || 0;
        if (disabilityPct >= 100) {
            items.push({ category: 'נכות', points: 4, reason: `נכות ${disabilityPct}% — 4 נקודות` });
        } else if (disabilityPct >= 90) {
            items.push({ category: 'נכות', points: 2, reason: `נכות ${disabilityPct}% — 2 נקודות` });
        }
    }

    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);

    return {
        totalPoints: Math.round(totalPoints * 100) / 100,
        items,
    };
}

/**
 * Quick calculation with minimal data — for employees without Form 101.
 * Uses baseline: Israeli resident (2.25) + gender bonus if female.
 */
export function getDefaultTaxCredits(gender?: 'male' | 'female'): number {
    return gender === 'female' ? 2.75 : 2.25;
}

// ============================================================================
// Helpers
// ============================================================================

function monthsBetween(from: Date, to: Date): number {
    return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}
