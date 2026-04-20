/**
 * FILE: payrollService.ts
 * PURPOSE: Thin Internal Service Wrapper for Harvest Wave 1A/1B/1C assets
 * STATUS: Isolated Engine Service Layer
 * 
 * DESIGN:
 * This acts as the single point of entry/export for all 8 underlying 
 * payroll calculation and validation modules. 
 * External runtime files should import from THIS service instead of directly 
 * importing the deep calculators to enforce strict boundary control.
 */

// 1. Core Calculators
import { calculatePayroll, PayrollResult, PayrollInput } from './gross-to-net';
import { calculateIncomeTax, IncomeTaxResult } from './tax-tables-2026';
import { calculateNationalInsurance, NationalInsuranceResult } from './national-insurance';
import { calculateHourTiers, HourBreakdown, HourLimits } from './calculate-overtime-tiers';
import { calculateTaxCredits, TaxCreditResult, TaxCreditFormInput } from './tax-credits';

// 2. Constants & Settings
import { 
    LOCKED_PARAMS, 
    SECTOR_PRESETS, 
    EDITABLE_DEFAULTS, 
    CompanySettings, 
    SectorPreset 
} from './labor-law-constants';

// 3. Israeli Localization Utilities
import { 
    validateIsraeliId, 
    normalizeIsraeliPhone, 
    normalizeDateToISO,
    validateBankBranch
} from './israeli-validators';

import { 
    getHolidayForDate, 
    isRestDay, 
    isTomorrowRestDay,
    IsraeliHoliday
} from './israeli-holidays';

// ============================================================================
// Service Facade Configuration
// ============================================================================

export const PayrollService = {
    /**
     * Complete Gross-to-Net pipeline execution
     * Computes all 10 standard Israeli payroll steps.
     */
    calculateFullPayroll: (input: PayrollInput): PayrollResult => calculatePayroll(input),

    /**
     * Isolated Tax Engine
     */
    TaxEngine: {
        calculateIncomeTax,
        calculateNationalInsurance,
        calculateTaxCredits
    },

    /**
     * Overtime & Attendance Rules Engine
     */
    AttendanceEngine: {
        calculateHourTiers
    },

    /**
     * Legal Constants (Source of truth)
     */
    Constants: {
        LOCKED_PARAMS,
        EDITABLE_DEFAULTS,
        getSectorPreset: (sectorId: keyof typeof SECTOR_PRESETS): SectorPreset | undefined => SECTOR_PRESETS[sectorId as string],
        getAllSectors: () => SECTOR_PRESETS
    },

    /**
     * Israeli Context Utilities (Dates, Holidays, Validations)
     */
    Utils: {
        isValidId: validateIsraeliId,
        isValidPhone: normalizeIsraeliPhone,
        formatDate: normalizeDateToISO,
        isValidBank: validateBankBranch,
        Holidays: {
            getHoliday: getHolidayForDate,
            isRestDay,
            isEveOfRestDay: isTomorrowRestDay
        }
    }
};

// Re-export core types for consumers of this service
export type {
    PayrollInput,
    PayrollResult,
    IncomeTaxResult,
    NationalInsuranceResult,
    HourBreakdown,
    HourLimits,
    TaxCreditResult,
    TaxCreditFormInput,
    CompanySettings,
    SectorPreset,
    IsraeliHoliday
};
