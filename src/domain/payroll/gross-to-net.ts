/**
 * FILE: gross-to-net.ts
 * PURPOSE: Gross-to-Net Payroll Engine (ברוטו → נטו) — Full 10-step pipeline
 * PROMOTED FROM: employee-system/employee-platform/src/lib/payroll/gross-to-net.ts
 * PROMOTION DATE: 2026-04-15
 * WAVE: 1C
 * ADAPTATION: Changed 3 import paths from external to local Wave 1A copies:
 *   - './tax-tables-2026' (local)
 *   - './national-insurance' (local)
 *   - './labor-law-constants' (local, was '../labor-law-constants')
 * EXTERNAL IMPORTS: NONE (resolved via Wave 1A)
 * RUNTIME TOUCH: NONE
 */

/**
 * Gross-to-Net Payroll Engine (ברוטו → נטו)
 * המנוע המרכזי לחישוב שכר
 * 
 * Combines: Income Tax + National Insurance + Health Tax + Pension + Ed. Fund
 * to produce a full payroll breakdown for an employee.
 */

import { calculateIncomeTax, getTaxCreditPointValue } from './tax-tables-2026';
import { calculateNationalInsurance } from './national-insurance';
import { LOCKED_PARAMS } from './labor-law-constants';

// ============================================================================
// Types
// ============================================================================

export interface DeductionEntry {
    name: string;
    amount: number;
    type: 'pre_tax' | 'post_tax';
}

export interface PayrollInput {
    /** Monthly gross salary (ברוטו חודשי) */
    grossSalary: number;
    /** Number of tax credit points */
    taxCreditPoints: number;
    /** Pension employee rate (decimal, e.g. 0.06) */
    pensionEmployeeRate?: number;
    /** Pension employer rate (decimal, e.g. 0.065) */
    pensionEmployerRate?: number;
    /** Severance rate (decimal, e.g. 0.0833) */
    severanceRate?: number;
    /** Education fund employee rate (decimal, e.g. 0.025) */
    educationFundEmployeeRate?: number;
    /** Education fund employer rate (decimal, e.g. 0.075) */
    educationFundEmployerRate?: number;
    /** Voluntary deductions (ניכויי רשות) */
    deductions?: DeductionEntry[];
    /** Is employee over 67? (affects NI) */
    isOver67?: boolean;
    /** Overtime pay included in gross (already calculated externally) */
    overtimePay?: number;
    /** Travel reimbursement (החזר נסיעות) — not subject to NI up to limit */
    travelReimbursement?: number;
    /** Convalescence pay (דמי הבראה) */
    convalescencePay?: number;
    /** The tax year to calculate against (e.g. 2025 or 2026) */
    taxYear?: 2025 | 2026;
}

export interface PayrollResult {
    // Income
    grossSalary: number;
    overtimePay: number;
    travelReimbursement: number;
    convalescencePay: number;
    totalGross: number;

    // Employee deductions
    incomeTax: number;
    nationalInsurance: number;
    healthTax: number;
    pensionEmployee: number;
    educationFundEmployee: number;
    voluntaryDeductions: number;
    totalDeductions: number;

    // Net
    netSalary: number;

    // Employer costs (not deducted from employee)
    employer: {
        pensionEmployer: number;
        severance: number;
        educationFundEmployer: number;
        nationalInsuranceEmployer: number;
        totalEmployerCost: number;
    };

    // Totals
    totalCostToEmployer: number;

    // Tax info
    taxInfo: {
        taxableIncome: number;
        taxCreditPoints: number;
        taxCreditAmount: number;
        effectiveTaxRate: number;
        marginalTaxRate: number;
    };

    // Detailed breakdown for UI
    breakdown: {
        incomeTaxDetails: ReturnType<typeof calculateIncomeTax>;
        niDetails: ReturnType<typeof calculateNationalInsurance>;
        deductionsList: DeductionEntry[];
    };
}

// ============================================================================
// Main Calculation
// ============================================================================

/**
 * Calculate full payroll: Gross → Net with all Israeli deductions.
 * חישוב שכר מלא: ברוטו → נטו
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
    const {
        grossSalary,
        taxCreditPoints = 2.25,
        pensionEmployeeRate = LOCKED_PARAMS.PENSION_EMPLOYEE_MIN,
        pensionEmployerRate = LOCKED_PARAMS.PENSION_EMPLOYER_MIN,
        severanceRate = LOCKED_PARAMS.PENSION_SEVERANCE_MIN,
        educationFundEmployeeRate = 0,
        educationFundEmployerRate = 0,
        deductions = [],
        isOver67 = false,
        overtimePay = 0,
        travelReimbursement = 0,
        convalescencePay = 0,
        taxYear = 2026,
    } = input;

    if (grossSalary < 0 || overtimePay < 0 || travelReimbursement < 0 || convalescencePay < 0) {
        throw new Error('Negative values are not allowed for gross salary or compensation components.');
    }

    // ---- Step 1: Total gross ----
    const totalGross = grossSalary + overtimePay + travelReimbursement + convalescencePay;

    // ---- Step 2: Pension deductions (pre-tax) ----
    // Pension is calculated on base + overtime, NOT on travel/convalescence
    const pensionableIncome = grossSalary + overtimePay;
    const pensionEmployee = round2(pensionableIncome * pensionEmployeeRate);
    const pensionEmployer = round2(pensionableIncome * pensionEmployerRate);
    const severance = round2(pensionableIncome * severanceRate);
    const educationFundEmployee = round2(pensionableIncome * educationFundEmployeeRate);
    const educationFundEmployer = round2(pensionableIncome * educationFundEmployerRate);

    // ---- Step 3: Taxable income (after pension deductions) ----
    // Pension employee contribution is deductible from taxable income
    const preTaxDeductions = deductions.filter(d => d.type === 'pre_tax');
    const preTaxTotal = preTaxDeductions.reduce((sum, d) => sum + d.amount, 0);

    const taxableIncome = Math.max(0, totalGross - pensionEmployee - educationFundEmployee - preTaxTotal);

    // ---- Step 4: Income Tax ----
    const incomeTaxResult = calculateIncomeTax(taxableIncome, taxCreditPoints, taxYear);
    const incomeTax = incomeTaxResult.tax;

    // ---- Step 5: National Insurance + Health Tax ----
    // NI is calculated on the FULL gross (before pension deductions)
    const niResult = calculateNationalInsurance(totalGross, isOver67, taxYear);
    const nationalInsurance = niResult.niEmployee;
    const healthTax = niResult.healthEmployee;

    // ---- Step 6: Post-tax voluntary deductions ----
    const postTaxDeductions = deductions.filter(d => d.type === 'post_tax');
    const voluntaryDeductions = postTaxDeductions.reduce((sum, d) => sum + d.amount, 0);

    // ---- Step 7: Total deductions ----
    const totalDeductions = round2(
        incomeTax +
        nationalInsurance +
        healthTax +
        pensionEmployee +
        educationFundEmployee +
        preTaxTotal +
        voluntaryDeductions
    );

    // ---- Step 8: Net salary ----
    const netSalary = round2(totalGross - totalDeductions);

    // ---- Step 9: Employer costs ----
    const totalEmployerCost = round2(
        pensionEmployer + severance + educationFundEmployer + niResult.niEmployer
    );

    // ---- Step 10: Find marginal tax rate ----
    const lastBracket = incomeTaxResult.brackets[incomeTaxResult.brackets.length - 1];
    const marginalTaxRate = lastBracket ? lastBracket.bracket.rate : 0;

    return {
        grossSalary,
        overtimePay,
        travelReimbursement,
        convalescencePay,
        totalGross: round2(totalGross),

        incomeTax,
        nationalInsurance,
        healthTax,
        pensionEmployee,
        educationFundEmployee,
        voluntaryDeductions: round2(voluntaryDeductions + preTaxTotal),
        totalDeductions,

        netSalary,

        employer: {
            pensionEmployer,
            severance,
            educationFundEmployer,
            nationalInsuranceEmployer: niResult.niEmployer,
            totalEmployerCost,
        },

        totalCostToEmployer: round2(totalGross + totalEmployerCost),

        taxInfo: {
            taxableIncome: round2(taxableIncome),
            taxCreditPoints,
            taxCreditAmount: round2(taxCreditPoints * getTaxCreditPointValue(taxYear)),
            effectiveTaxRate: incomeTaxResult.effectiveRate,
            marginalTaxRate,
        },

        breakdown: {
            incomeTaxDetails: incomeTaxResult,
            niDetails: niResult,
            deductionsList: deductions,
        },
    };
}

// ============================================================================
// Quick Estimate Helper
// ============================================================================

/**
 * Quick net salary estimate with default parameters.
 * הערכה מהירה של שכר נטו עם פרמטרים ברירת מחדל.
 */
export function quickNetEstimate(grossSalary: number, gender?: 'male' | 'female'): number {
    const taxCreditPoints = gender === 'female' ? 2.75 : 2.25;
    const result = calculatePayroll({
        grossSalary,
        taxCreditPoints,
        pensionEmployeeRate: LOCKED_PARAMS.PENSION_EMPLOYEE_MIN,
    });
    return result.netSalary;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
