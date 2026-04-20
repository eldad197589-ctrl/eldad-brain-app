/* ============================================
   FILE: eligibilityService.ts
   PURPOSE: B4 — Eligibility Layer.
            Determines base year, track size, eligibility,
            compensation cap, and (when data is complete)
            eligible expense calculation.
   DEPENDENCIES: ../data/leadClientTypes
   EXPORTS: determineBaseYear, determineTrackSize, checkEligibility,
            applyCap, calculateEligibleExpense, INDUSTRY_COEFFICIENTS,
            SMALL_BUSINESS_GRANTS, COMPENSATION_COEFFICIENTS
   ============================================ */

import type {
  IntakeQuestionnaire, IndustryType,
} from '../data/leadClientTypes';

// #region Constants

/**
 * מקדם פיצוי ענפי.
 * מוכפל בתוצאת הנוסחה הבסיסית.
 */
export const INDUSTRY_COEFFICIENTS: Record<IndustryType, number> = {
  general: 1.0,
  construction: 0.68,
  fuel: 0.35,
  gems: 0.19,
  other: 1.0,
};

/**
 * מקדמי פיצוי לפי שיעור ירידה במחזור.
 * חד-חודשי / דו-חודשי → מקדם.
 */
export const COMPENSATION_COEFFICIENTS = [
  { monthlyMin: 25, monthlyMax: 40, biMonthlyMin: 12.5, biMonthlyMax: 20, coefficient: 0.07 },
  { monthlyMin: 40, monthlyMax: 60, biMonthlyMin: 20, biMonthlyMax: 30, coefficient: 0.11 },
  { monthlyMin: 60, monthlyMax: 80, biMonthlyMin: 30, biMonthlyMax: 40, coefficient: 0.15 },
  { monthlyMin: 80, monthlyMax: 100, biMonthlyMin: 40, biMonthlyMax: 50, coefficient: 0.22 },
] as const;

/**
 * טבלת מענקים קבועים — עסקים קטנים (מחזור עד 300,000 ₪).
 * [תקרת מחזור, מענק 25-40%, מענק 40-60%, מענק 60-80%, מענק 80-100%]
 */
export const SMALL_BUSINESS_GRANTS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [50_000, 1_833, 1_833, 1_833, 1_833],
  [90_000, 3_300, 3_300, 3_300, 3_300],
  [120_000, 4_400, 4_400, 4_400, 4_400],
  [150_000, 2_776, 4_164, 6_662, 8_328],
  [200_000, 3_273, 4_910, 7_855, 9_819],
  [250_000, 4_190, 6_285, 10_056, 12_570],
  [300_000, 4_897, 7_346, 11_753, 14_691],
];

// #endregion

// #region determineBaseYear

/**
 * קובע שנת בסיס לפי מועד פתיחת העסק.
 *
 * כלל (חוק סיוע כלכלי 2025):
 * - עסק שנפתח לפני 1.1.2022 → בסיס = 2022
 * - עסק שנפתח מ-1.1.2022 ואילך → בסיס = מועד פתיחה או 1.1.2025 (המאוחר)
 *
 * @returns שנת הבסיס (מספר) או null אם חסר מועד פתיחה
 */
export function determineBaseYear(intake: IntakeQuestionnaire): number | null {
  if (!intake.businessOpenDate) return null;

  const openDate = new Date(intake.businessOpenDate);
  const cutoff = new Date('2022-01-01');

  if (openDate < cutoff) {
    return 2022;
  }

  // עסק שנפתח מ-1.1.2022 — בסיס = המאוחר מבין תחילת פעילות ל-1.1.2025
  const startOfYear2025 = new Date('2025-01-01');
  const effectiveStart = openDate > startOfYear2025 ? openDate : startOfYear2025;
  return effectiveStart.getFullYear();
}

// #endregion

// #region determineTrackSize

/**
 * סוג מסלול לפי גודל מחזור.
 */
export type TrackSize = 'small' | 'large' | 'unknown';

/**
 * קובע אם העסק במסלול "קטן" (עד 300K, מענקים קבועים)
 * או "גדול" (מעל 300K, נוסחת הוצאות מזכות).
 *
 * @returns 'small' | 'large' | 'unknown'
 */
export function determineTrackSize(intake: IntakeQuestionnaire): TrackSize {
  if (intake.annualRevenue === undefined || intake.annualRevenue === null) {
    return 'unknown';
  }
  return intake.annualRevenue <= 300_000 ? 'small' : 'large';
}

// #endregion

// #region checkEligibility

/**
 * תוצאת בדיקת זכאות — רשימת בדיקות עם סטטוס.
 */
export interface EligibilityCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

export interface EligibilityResult {
  eligible: boolean;
  checks: EligibilityCheck[];
}

/**
 * בודק תנאי סף לזכאות פיצוי (חוק סיוע כלכלי 2025).
 *
 * תנאים:
 * 1. מחזור בין 12,000 ₪ ל-400,000,000 ₪
 * 2. עסק נפתח עד 31.5.2025
 * 3. ירידת מחזור מעל 25% (חד-חודשי) / 12.5% (דו-חודשי)
 * 4. הגשת 102 + דוחות מע"מ (נבדק כ-warning)
 *
 * @returns EligibilityResult עם רשימת בדיקות
 */
export function checkEligibility(intake: IntakeQuestionnaire): EligibilityResult {
  const checks: EligibilityCheck[] = [];

  // ── 1. מחזור ──
  if (intake.annualRevenue !== undefined) {
    const inRange = intake.annualRevenue >= 12_000 && intake.annualRevenue <= 400_000_000;
    checks.push({
      rule: 'revenue_range',
      passed: inRange,
      detail: inRange
        ? `מחזור ${intake.annualRevenue.toLocaleString()} ₪ — בטווח 12K-400M`
        : `מחזור ${intake.annualRevenue.toLocaleString()} ₪ — מחוץ לטווח`,
    });
  } else {
    checks.push({ rule: 'revenue_range', passed: false, detail: 'מחזור שנתי לא צוין' });
  }

  // ── 2. מועד פתיחה ──
  if (intake.businessOpenDate) {
    const openDate = new Date(intake.businessOpenDate);
    const deadline = new Date('2025-05-31');
    const valid = openDate <= deadline;
    checks.push({
      rule: 'open_date',
      passed: valid,
      detail: valid
        ? `נפתח ב-${intake.businessOpenDate} — לפני 31.5.2025`
        : `נפתח ב-${intake.businessOpenDate} — אחרי 31.5.2025, לא זכאי`,
    });
  } else {
    checks.push({ rule: 'open_date', passed: false, detail: 'מועד פתיחה לא צוין' });
  }

  // ── 3. אחוז ירידה ──
  if (intake.revenueDeclinePercent !== undefined) {
    const isMonthly = intake.vatCycle === 'monthly';
    const threshold = isMonthly ? 25 : 12.5;
    const label = isMonthly ? 'חד-חודשי' : 'דו-חודשי';
    const passed = intake.revenueDeclinePercent >= threshold;
    checks.push({
      rule: 'decline_threshold',
      passed,
      detail: passed
        ? `ירידה ${intake.revenueDeclinePercent}% (${label}) — עוברת סף ${threshold}%`
        : `ירידה ${intake.revenueDeclinePercent}% (${label}) — מתחת לסף ${threshold}%`,
    });
  } else {
    checks.push({ rule: 'decline_threshold', passed: false, detail: 'אחוז ירידה לא צוין' });
  }

  // ── 4. דיווחים (warning level) ──
  const hasVat = intake.vatCycle !== 'exempt' && intake.vatCycle !== 'none';
  checks.push({
    rule: 'vat_reporting',
    passed: hasVat,
    detail: hasVat
      ? `דיווח מע"מ ${intake.vatCycle} — תקין`
      : 'פטור/ללא מע"מ — לבדוק מסלול מתאים',
  });

  if (intake.hasEmployees) {
    checks.push({
      rule: 'form_102',
      passed: intake.payrollReportingAvailable,
      detail: intake.payrollReportingAvailable
        ? 'טופס 102 זמין — תנאי הכרחי לפיצוי שכר'
        : 'טופס 102 חסר — חובה להשיג לפני הגשה',
    });
  }

  const eligible = checks.filter(c =>
    ['revenue_range', 'open_date', 'decline_threshold'].includes(c.rule)
  ).every(c => c.passed);

  return { eligible, checks };
}

// #endregion

// #region applyCap

/**
 * מחיל תקרת פיצוי לפי מחזור שנתי.
 *
 * כללים (חוק סיוע כלכלי 2025):
 * - עד 100M ₪: תקרה 600,000 ₪
 * - 100M-300M: 600,000 + 0.3% מהחלק שמעל 100M
 * - 300M-400M: עלייה ליניארית עד 2,000,000 ₪
 *
 * @returns תקרת פיצוי ב-NIS, או null אם אין מחזור
 */
export function applyCap(annualRevenue: number | undefined): number | null {
  if (annualRevenue === undefined || annualRevenue === null) return null;

  if (annualRevenue <= 100_000_000) {
    return 600_000;
  }

  if (annualRevenue <= 300_000_000) {
    const excess = annualRevenue - 100_000_000;
    return 600_000 + (excess * 0.003);
  }

  if (annualRevenue <= 400_000_000) {
    // 300M cap = 600K + 200M*0.003 = 600K + 600K = 1,200,000
    const capAt300M = 1_200_000;
    const maxCap = 2_000_000;
    const fraction = (annualRevenue - 300_000_000) / 100_000_000;
    return capAt300M + fraction * (maxCap - capAt300M);
  }

  // מעל 400M — מחוץ לטווח
  return null;
}

// #endregion

// #region calculateEligibleExpense

/**
 * תוצאת חישוב הוצאה מזכה.
 */
export interface EligibleExpenseResult {
  /** סכום פיצוי מחושב (לפני תקרה) */
  rawAmount: number;
  /** מקדם שהוחל */
  coefficient: number;
  /** מקדם ענפי */
  industryMultiplier: number;
  /** תקרה שהוחלה */
  cap: number | null;
  /** סכום סופי (אחרי תקרה) */
  finalAmount: number;
  /** האם עסק קטן (מענק קבוע) */
  isSmallBusiness: boolean;
}

/**
 * מחשב פיצוי הוצאה מזכה.
 *
 * נוסחה (חוק סיוע כלכלי 2025):
 * - עסק קטן (עד 300K): מענק קבוע מטבלה
 * - עסק גדול (מעל 300K): ממוצע תשומות × מקדם × מקדם ענפי
 *
 * סטטוס ידע: נוסחה, מקדמים ותקרות מאומתים מהמחקר.
 * ⚠️ אין לוגיקת חישוב שכר — חסרה נוסחה ספציפית.
 *
 * @returns EligibleExpenseResult או null אם חסרים נתונים
 */
export function calculateEligibleExpense(intake: IntakeQuestionnaire): EligibleExpenseResult | null {
  if (intake.annualRevenue === undefined) return null;
  if (intake.revenueDeclinePercent === undefined) return null;

  const trackSize = determineTrackSize(intake);
  const isMonthly = intake.vatCycle === 'monthly';

  // ── עסק קטן — מענק קבוע ──
  if (trackSize === 'small') {
    const grant = lookupSmallBusinessGrant(intake.annualRevenue, intake.revenueDeclinePercent, isMonthly);
    return {
      rawAmount: grant,
      coefficient: 0,
      industryMultiplier: 1,
      cap: null,
      finalAmount: grant,
      isSmallBusiness: true,
    };
  }

  // ── עסק גדול — נוסחת תשומות ──
  if (intake.vatInputsAverage === undefined) return null;

  const coefficient = getCompensationCoefficient(intake.revenueDeclinePercent, isMonthly);
  if (coefficient === null) return null;

  const industryMultiplier = INDUSTRY_COEFFICIENTS[intake.industryType ?? 'general'];
  const rawAmount = intake.vatInputsAverage * coefficient * industryMultiplier;
  const cap = applyCap(intake.annualRevenue);
  const finalAmount = cap !== null ? Math.min(rawAmount, cap) : rawAmount;

  return {
    rawAmount,
    coefficient,
    industryMultiplier,
    cap,
    finalAmount,
    isSmallBusiness: false,
  };
}

// #endregion

// #region Helpers

/**
 * מחזיר מקדם פיצוי לפי אחוז ירידה.
 */
function getCompensationCoefficient(declinePercent: number, isMonthly: boolean): number | null {
  for (const band of COMPENSATION_COEFFICIENTS) {
    const min = isMonthly ? band.monthlyMin : band.biMonthlyMin;
    const max = isMonthly ? band.monthlyMax : band.biMonthlyMax;
    if (declinePercent >= min && declinePercent < max) {
      return band.coefficient;
    }
  }
  // 100% decline edge case
  if (declinePercent >= (isMonthly ? 80 : 40)) {
    return 0.22;
  }
  return null;
}

/**
 * מחפש מענק קבוע לעסק קטן.
 */
function lookupSmallBusinessGrant(
  revenue: number,
  declinePercent: number,
  isMonthly: boolean,
): number {
  // מציאת שורה מתאימה בטבלה
  let row: readonly [number, number, number, number, number] | undefined;
  for (const r of SMALL_BUSINESS_GRANTS) {
    if (revenue <= r[0]) {
      row = r;
      break;
    }
  }
  if (!row) return 0;

  // קביעת עמודה (1-4) לפי שיעור ירידה
  const effectiveDecline = isMonthly ? declinePercent : declinePercent * 2;
  let col: number;
  if (effectiveDecline < 40) col = 1;
  else if (effectiveDecline < 60) col = 2;
  else if (effectiveDecline < 80) col = 3;
  else col = 4;

  return row[col];
}

// #endregion
