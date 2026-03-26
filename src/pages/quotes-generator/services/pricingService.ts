/* ============================================
// #region Module

   FILE: pricingService.ts
   PURPOSE: Manage the FULL Smart Bareau pricing matrices via localStorage
   DEPENDENCIES: None
   EXPORTS: getPricingMatrix, savePricingMatrix, SmartBareauPricing, getServicesCatalog, saveServicesCatalog
   ============================================ */

// #region Types

/** Base retainer pricing per client classification */
export interface BasePricing {
  label: string;
  baseMonthlyFee: number;
  annualReportFee: number;
  setupFee?: number;
  successFeePercent?: number;
  includes: string[];
}

/** Hourly consulting rates */
export interface HourlyRate {
  id: string;
  name: string;
  pricePerHour: number;
}

/** One-off / per-case service */
export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isMonthly: boolean;
  isPercentage?: boolean;
  category: 'capital_statement' | 'representation' | 'payroll' | 'consulting' | 'project' | 'other';
}

export type ClientTypeKey = 'exempt' | 'authorized_small' | 'authorized_medium' | 'company' | 'employee';

export interface SmartBareauPricing {
  retainers: Record<ClientTypeKey, BasePricing>;
  hourlyRates: HourlyRate[];
  services: ServiceCatalogItem[];
  terms: string[];
}

// #endregion

// #region Defaults (from knowledge_smart_bareau_pricing.md)

const PRICING_STORAGE_KEY = 'sb_pricing_full_v2';

const DEFAULT_PRICING: SmartBareauPricing = {
  retainers: {
    exempt: {
      label: 'עוסק פטור (מחזור נמוך)',
      baseMonthlyFee: 300,
      annualReportFee: 1200,
      includes: ['דיווח מע"מ (חצי שנתי/שנתי)', 'ייעוץ שוטף טלפוני', 'עדכוני חקיקה']
    },
    authorized_small: {
      label: 'עוסק מורשה (עד 25 חשבוניות)',
      baseMonthlyFee: 400,
      annualReportFee: 2000,
      includes: ['דיווחי מע"מ חודשיים', 'הנה"ח חד-צידית', 'מקדמות דיווחים', 'ייעוץ שוטף']
    },
    authorized_medium: {
      label: 'עוסק מורשה (25-100 חשבוניות)',
      baseMonthlyFee: 550,
      annualReportFee: 2000,
      includes: ['התאמות בנקים וספקים', 'דוחות רווח והפסד תקופתיים', 'דיווחים לרשויות']
    },
    company: {
      label: 'חברה בע"מ / עמותה (מעל 100 חשבוניות)',
      baseMonthlyFee: 750,
      annualReportFee: 4000,
      includes: ['ניהול מורחב', 'התאמות אשראי', 'ישיבות תקופתיות', 'דוח מבוקר']
    },
    employee: {
      label: 'שכיר / פנסיונר (החזרי מס)',
      baseMonthlyFee: 0,
      annualReportFee: 0,
      setupFee: 500,
      successFeePercent: 15,
      includes: ['בדיקת זכאות להחזר', 'הגשת דוח שנתי', 'מעקב עד לקבלת החזר']
    }
  },
  hourlyRates: [
    { id: 'hr_biz', name: 'ייעוץ עסקי', pricePerHour: 450 },
    { id: 'hr_senior', name: 'חשבות בכירה', pricePerHour: 3000 },
    { id: 'hr_general', name: 'ייעוץ כללי / מס', pricePerHour: 500 },
  ],
  services: [
    // הצהרות הון
    { id: 'cap_new', name: 'הצהרת הון (ראשונה)', description: 'הפקת הצהרת הון ראשונה כולל מאזן', price: 2000, isMonthly: false, category: 'capital_statement' },
    { id: 'cap_repeat', name: 'הצהרת הון (חוזרת)', description: 'הצהרת הון חוזרת לאור השוואת הון קודמת', price: 1500, isMonthly: false, category: 'capital_statement' },
    { id: 'cap_complex', name: 'הצהרת הון (מורכבת)', description: 'הצהרת הון מורכבת עם נכסים בחו"ל / שותפויות', price: 3000, isMonthly: false, category: 'capital_statement' },
    // ייצוג
    { id: 'rep_tax', name: 'ייצוג בדיוני שומה (מס הכנסה/ביט"ל)', description: 'ייצוג מול פקיד שומה או ביטוח לאומי', price: 2500, isMonthly: false, category: 'representation' },
    // שכר
    { id: 'payroll_slip', name: 'תלוש שכר בודד (עד 10 עובדים)', description: 'הפקת תלוש שכר חודשי', price: 100, isMonthly: true, category: 'payroll' },
    // פרויקטלי
    { id: 'biz_plan', name: 'תוכנית עסקית אסטרטגית', description: 'מודל עסקי, ניתוח מתחרים ותמחור דינמי', price: 3500, isMonthly: false, category: 'project' },
    // דוחות שנתיים - יחיד/שכיר
    { id: 'annual_employee', name: 'דוח שנתי יחיד/שכיר', description: 'הכנת דוח שנתי למס הכנסה עבור שכיר', price: 800, isMonthly: false, category: 'other' },
  ],
  terms: [
    'כל הצעה תקפה ל-30 יום.',
    'תשלום חודשי מראש ב-1 לכל חודש, בהוראת קבע/אשראי.',
    'חידוש ההסכם הנו אוטומטי, יציאה דורשת התראה של 30 יום.',
    'הסכומים אינם כוללים מע"מ כחוק.',
  ]
};

// #endregion

// #region API

/**
 * Retrieves the full pricing matrix from localStorage or returns defaults
 */
export function getPricingMatrix(): SmartBareauPricing {
  try {
    const data = localStorage.getItem(PRICING_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('[PricingService] Failed to load pricing matrix', e);
  }
  return DEFAULT_PRICING;
}

/**
 * Saves the full pricing matrix to localStorage
 */
export function savePricingMatrix(matrix: SmartBareauPricing): void {
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(matrix));
}

// #endregion
