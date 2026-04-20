/**
 * FILE: israeli-validators.ts
 * PURPOSE: Israeli Data Validators & Normalizers (ID, Phone, Date, Bank, Period, Salary, Hours)
 * PROMOTED FROM: employee-system/employee-platform/src/lib/israeli-validators.ts
 * PROMOTION DATE: 2026-04-15
 * ADAPTATION: NONE — verbatim copy
 * EXTERNAL IMPORTS: NONE
 * RUNTIME TOUCH: NONE
 */

/**
 * Israeli Data Validators & Normalizers
 * Smart Data Management utilities for document processing
 * Epic 9: Israeli ID, Phone, Date, Bank validation
 */

// ============================================================================
// E9-S6: Israeli ID Validator (Luhn Algorithm)
// ============================================================================

/**
 * Validate Israeli ID number using Luhn checksum algorithm
 * @param idNumber - 9-digit Israeli ID number (may include leading zeros)
 * @returns Object with validation result and normalized ID
 */
export function validateIsraeliId(idNumber: string): {
    valid: boolean;
    normalized: string;
    error?: string;
} {
    // Clean input - remove spaces, dashes
    const cleaned = idNumber.replace(/[\s-]/g, "");

    // Check length
    if (!/^\d+$/.test(cleaned)) {
        return { valid: false, normalized: cleaned, error: "מספר זהות חייב להכיל ספרות בלבד" };
    }

    // Pad to 9 digits with leading zeros
    const normalized = cleaned.padStart(9, "0");

    if (normalized.length !== 9) {
        return { valid: false, normalized, error: "מספר זהות חייב להיות 9 ספרות" };
    }

    // Luhn algorithm for Israeli ID
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(normalized[i]);

        // Multiply alternating digits by 1 and 2
        if (i % 2 === 1) {
            digit *= 2;
            // If result > 9, subtract 9 (same as sum of digits)
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
    }

    const valid = sum % 10 === 0;

    return {
        valid,
        normalized,
        error: valid ? undefined : "מספר זהות לא תקין (בדיקת ספרת ביקורת נכשלה)",
    };
}

// ============================================================================
// E9-S7: Phone Normalizer
// ============================================================================

/**
 * Normalize Israeli phone numbers to standard format
 * Handles mobile (05X) and landline (0X) numbers
 * @param phone - Phone number in various formats
 * @returns Normalized phone in 05X-XXXXXXX or 0X-XXXXXXX format
 */
export function normalizeIsraeliPhone(phone: string): {
    normalized: string;
    type: "mobile" | "landline" | "unknown";
    valid: boolean;
    international?: string;
} {
    // Clean input - keep only digits
    const digits = phone.replace(/\D/g, "");

    // Handle international format (+972)
    let localDigits = digits;
    if (digits.startsWith("972")) {
        localDigits = "0" + digits.slice(3);
    }

    // Mobile: starts with 05 (050-059), 10 digits total
    if (/^05\d{8}$/.test(localDigits)) {
        const formatted = `${localDigits.slice(0, 3)}-${localDigits.slice(3)}`;
        return {
            normalized: formatted,
            type: "mobile",
            valid: true,
            international: `+972-${localDigits.slice(1, 3)}-${localDigits.slice(3)}`,
        };
    }

    // Landline: starts with 02-09 (except 05), 9-10 digits
    if (/^0[2-489]\d{7,8}$/.test(localDigits)) {
        const areaCode = localDigits.slice(0, 2);
        const number = localDigits.slice(2);
        const formatted = `${areaCode}-${number}`;
        return {
            normalized: formatted,
            type: "landline",
            valid: true,
            international: `+972-${localDigits.slice(1)}`,
        };
    }

    // Invalid format
    return {
        normalized: phone,
        type: "unknown",
        valid: false,
    };
}

// ============================================================================
// E9-S10: Date Normalizer
// ============================================================================

/**
 * Normalize various Hebrew date formats to ISO YYYY-MM-DD
 * Handles: DD/MM/YYYY, DD.MM.YY, DD-MM-YYYY, etc.
 */
export function normalizeDateToISO(dateStr: string): {
    normalized: string | null;
    format: string;
    valid: boolean;
    error?: string;
} {
    if (!dateStr || typeof dateStr !== "string") {
        return { normalized: null, format: "unknown", valid: false, error: "תאריך ריק" };
    }

    const cleaned = dateStr.trim();

    // Pattern 1: DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
    const fullYearMatch = cleaned.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (fullYearMatch) {
        const [, day, month, year] = fullYearMatch;
        const normalized = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        return validateDate(normalized, "DD/MM/YYYY");
    }

    // Pattern 2: DD/MM/YY or DD.MM.YY (2-digit year)
    const shortYearMatch = cleaned.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2})$/);
    if (shortYearMatch) {
        const [, day, month, shortYear] = shortYearMatch;
        // Assume 20xx for years 00-50, 19xx for 51-99
        const fullYear = parseInt(shortYear) <= 50 ? `20${shortYear}` : `19${shortYear}`;
        const normalized = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        return validateDate(normalized, "DD/MM/YY");
    }

    // Pattern 3: YYYY-MM-DD (already ISO)
    const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return validateDate(cleaned, "ISO");
    }

    // Pattern 4: Hebrew text date (e.g., "15 בינואר 2026")
    const hebrewMonths: Record<string, string> = {
        "ינואר": "01", "פברואר": "02", "מרץ": "03", "אפריל": "04",
        "מאי": "05", "יוני": "06", "יולי": "07", "אוגוסט": "08",
        "ספטמבר": "09", "אוקטובר": "10", "נובמבר": "11", "דצמבר": "12",
    };

    const hebrewMatch = cleaned.match(/^(\d{1,2})\s+ב?([א-ת]+)\s+(\d{4})$/);
    if (hebrewMatch) {
        const [, day, monthHeb, year] = hebrewMatch;
        const month = hebrewMonths[monthHeb];
        if (month) {
            const normalized = `${year}-${month}-${day.padStart(2, "0")}`;
            return validateDate(normalized, "Hebrew");
        }
    }

    return { normalized: null, format: "unknown", valid: false, error: "פורמט תאריך לא מזוהה" };
}

/**
 * Validate that a date string represents a real date
 */
function validateDate(isoDate: string, format: string): {
    normalized: string | null;
    format: string;
    valid: boolean;
    error?: string;
} {
    const date = new Date(isoDate);
    const valid = !isNaN(date.getTime());

    if (!valid) {
        return { normalized: null, format, valid: false, error: "תאריך לא תקין" };
    }

    // Verify the date parts match (to catch invalid dates like Feb 30)
    const [year, month, day] = isoDate.split("-").map(Number);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return { normalized: null, format, valid: false, error: "תאריך לא קיים" };
    }

    return { normalized: isoDate, format, valid: true };
}

// ============================================================================
// E9-S8: Bank Code Validator
// ============================================================================

/** Israeli bank codes and names */
export const ISRAELI_BANKS: Record<string, string> = {
    "10": "לאומי",
    "11": "דיסקונט",
    "12": "הפועלים",
    "13": "אגוד",
    "14": "אוצר החייל",
    "17": "מרכנתיל דיסקונט",
    "20": "מזרחי טפחות",
    "31": "בינלאומי",
    "46": "מסד",
    "52": "הפועלים ב.מ.",
    "54": "ירושלים",
    "99": "בנק ישראל",
};

/**
 * Validate Israeli bank code
 */
export function validateBankCode(code: string): {
    valid: boolean;
    bankName?: string;
    error?: string;
} {
    const normalized = code.trim().padStart(2, "0");
    const bankName = ISRAELI_BANKS[normalized];

    if (bankName) {
        return { valid: true, bankName };
    }

    return { valid: false, error: `קוד בנק לא מוכר: ${code}` };
}

/**
 * Validate Israeli bank branch
 * Format: 3-digit branch code
 */
export function validateBankBranch(branch: string): {
    valid: boolean;
    normalized: string;
    error?: string;
} {
    const cleaned = branch.replace(/\D/g, "");

    if (cleaned.length < 1 || cleaned.length > 4) {
        return { valid: false, normalized: branch, error: "מספר סניף חייב להיות 1-4 ספרות" };
    }

    return { valid: true, normalized: cleaned.padStart(3, "0") };
}

/**
 * Validate Israeli bank account number
 * Format: 6-9 digits typically
 */
export function validateBankAccount(account: string): {
    valid: boolean;
    normalized: string;
    error?: string;
} {
    const cleaned = account.replace(/\D/g, "");

    if (cleaned.length < 5 || cleaned.length > 12) {
        return { valid: false, normalized: account, error: "מספר חשבון חייב להיות 5-12 ספרות" };
    }

    return { valid: true, normalized: cleaned };
}

// ============================================================================
// E9-S4: Period Detection
// ============================================================================

/**
 * Extract period (YYYY-MM) from document text or filename
 * Detects patterns like "ינואר 2026", "01/2026", "January 2026"
 */
export function detectPeriod(text: string): {
    period: string | null;
    confidence: number;
    source: "filename" | "content" | "unknown";
} {
    const hebrewMonths: Record<string, string> = {
        "ינואר": "01", "פברואר": "02", "מרץ": "03", "אפריל": "04",
        "מאי": "05", "יוני": "06", "יולי": "07", "אוגוסט": "08",
        "ספטמבר": "09", "אוקטובר": "10", "נובמבר": "11", "דצמבר": "12",
    };

    const englishMonths: Record<string, string> = {
        "january": "01", "february": "02", "march": "03", "april": "04",
        "may": "05", "june": "06", "july": "07", "august": "08",
        "september": "09", "october": "10", "november": "11", "december": "12",
        "jan": "01", "feb": "02", "mar": "03", "apr": "04",
        "jun": "06", "jul": "07", "aug": "08",
        "sep": "09", "oct": "10", "nov": "11", "dec": "12",
    };

    // Pattern 1: Hebrew month name + year (e.g., "ינואר 2026")
    for (const [monthName, monthNum] of Object.entries(hebrewMonths)) {
        const regex = new RegExp(`${monthName}\\s*(\\d{4})`, "i");
        const match = text.match(regex);
        if (match) {
            return { period: `${match[1]}-${monthNum}`, confidence: 0.9, source: "content" };
        }
    }

    // Pattern 2: English month name + year
    for (const [monthName, monthNum] of Object.entries(englishMonths)) {
        const regex = new RegExp(`${monthName}\\s*(\\d{4})`, "i");
        const match = text.match(regex);
        if (match) {
            return { period: `${match[1]}-${monthNum}`, confidence: 0.85, source: "content" };
        }
    }

    // Pattern 3: MM/YYYY or MM-YYYY
    const slashMatch = text.match(/(\d{1,2})[\/\-](\d{4})/);
    if (slashMatch) {
        const month = slashMatch[1].padStart(2, "0");
        const year = slashMatch[2];
        if (parseInt(month) >= 1 && parseInt(month) <= 12) {
            return { period: `${year}-${month}`, confidence: 0.8, source: "content" };
        }
    }

    // Pattern 4: YYYY-MM (ISO format)
    const isoMatch = text.match(/(\d{4})-(\d{2})/);
    if (isoMatch) {
        const year = isoMatch[1];
        const month = isoMatch[2];
        if (parseInt(month) >= 1 && parseInt(month) <= 12) {
            return { period: `${year}-${month}`, confidence: 0.95, source: "content" };
        }
    }

    return { period: null, confidence: 0, source: "unknown" };
}

// ============================================================================
// E9-S5: Calculator Validation
// ============================================================================

/**
 * Validate salary calculations
 * Checks: gross - deductions = net
 */
export function validateSalaryCalculations(data: {
    grossSalary: number;
    netSalary: number;
    deductions: {
        incomeTax?: number;
        bituachLeumi?: number;
        healthTax?: number;
        pension?: number;
        other?: number;
    };
}): {
    valid: boolean;
    calculatedNet: number;
    difference: number;
    discrepancies: string[];
} {
    const totalDeductions = Object.values(data.deductions)
        .filter((v): v is number => typeof v === "number")
        .reduce((sum, val) => sum + val, 0);

    const calculatedNet = data.grossSalary - totalDeductions;
    const difference = Math.abs(calculatedNet - data.netSalary);
    const discrepancies: string[] = [];

    // Allow small rounding differences (up to 1 NIS)
    const valid = difference <= 1;

    if (!valid) {
        discrepancies.push(
            `שכר נטו מחושב (${calculatedNet.toFixed(2)}₪) שונה מהנטו במסמך (${data.netSalary.toFixed(2)}₪)`
        );
    }

    return { valid, calculatedNet, difference, discrepancies };
}

/**
 * Validate hours calculations
 * Checks: total = sum(daily hours) or regular + overtime
 */
export function validateHoursCalculations(data: {
    totalHours: number;
    regularHours?: number;
    overtime125?: number;
    overtime150?: number;
    dailyHours?: number[];
}): {
    valid: boolean;
    calculatedTotal: number;
    difference: number;
    discrepancies: string[];
} {
    const discrepancies: string[] = [];
    let calculatedTotal = 0;

    // Method 1: Sum of regular + overtime
    if (data.regularHours !== undefined) {
        calculatedTotal = (data.regularHours || 0) +
            (data.overtime125 || 0) +
            (data.overtime150 || 0);
    }
    // Method 2: Sum of daily hours
    else if (data.dailyHours && data.dailyHours.length > 0) {
        calculatedTotal = data.dailyHours.reduce((sum, h) => sum + h, 0);
    }
    else {
        return { valid: true, calculatedTotal: data.totalHours, difference: 0, discrepancies: [] };
    }

    const difference = Math.abs(calculatedTotal - data.totalHours);
    // Allow small rounding differences (up to 0.5 hours)
    const valid = difference <= 0.5;

    if (!valid) {
        discrepancies.push(
            `סה"כ שעות מחושב (${calculatedTotal.toFixed(2)}) שונה מהסה"כ במסמך (${data.totalHours.toFixed(2)})`
        );
    }

    return { valid, calculatedTotal, difference, discrepancies };
}

// ============================================================================
// Bulk Validation Helper
// ============================================================================

export interface ValidationResult {
    field: string;
    valid: boolean;
    originalValue: string;
    normalizedValue?: string;
    error?: string;
}

/**
 * Validate and normalize multiple fields at once
 */
export function validateDocumentFields(fields: {
    idNumber?: string;
    phone?: string;
    date?: string;
    bankCode?: string;
    bankBranch?: string;
    bankAccount?: string;
}): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (fields.idNumber) {
        const result = validateIsraeliId(fields.idNumber);
        results.push({
            field: "id_number",
            valid: result.valid,
            originalValue: fields.idNumber,
            normalizedValue: result.normalized,
            error: result.error,
        });
    }

    if (fields.phone) {
        const result = normalizeIsraeliPhone(fields.phone);
        results.push({
            field: "phone",
            valid: result.valid,
            originalValue: fields.phone,
            normalizedValue: result.normalized,
        });
    }

    if (fields.date) {
        const result = normalizeDateToISO(fields.date);
        results.push({
            field: "date",
            valid: result.valid,
            originalValue: fields.date,
            normalizedValue: result.normalized || undefined,
            error: result.error,
        });
    }

    if (fields.bankCode) {
        const result = validateBankCode(fields.bankCode);
        results.push({
            field: "bank_code",
            valid: result.valid,
            originalValue: fields.bankCode,
            normalizedValue: result.bankName,
            error: result.error,
        });
    }

    if (fields.bankBranch) {
        const result = validateBankBranch(fields.bankBranch);
        results.push({
            field: "bank_branch",
            valid: result.valid,
            originalValue: fields.bankBranch,
            normalizedValue: result.normalized,
            error: result.error,
        });
    }

    if (fields.bankAccount) {
        const result = validateBankAccount(fields.bankAccount);
        results.push({
            field: "bank_account",
            valid: result.valid,
            originalValue: fields.bankAccount,
            normalizedValue: result.normalized,
            error: result.error,
        });
    }

    return results;
}
