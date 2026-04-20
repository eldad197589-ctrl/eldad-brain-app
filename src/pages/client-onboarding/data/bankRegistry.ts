/* ============================================
// #region Module

   FILE: bankRegistry.ts
   PURPOSE: Bank template registry for generic bank onboarding phase.
            Defines which banks have known templates.
   DEPENDENCIES: None
   EXPORTS: BankTemplate, BANK_REGISTRY
   ============================================ */

export interface BankTemplate {
  bankId: string;
  bankName: string;
  templateStatus: 'VERIFIED' | 'PARTIAL' | 'NOT_LOADED';
  requiredBankSpecificDocuments: {
    id: string;
    name: string;
    description?: string;
  }[];
  physicalPresenceRequired: 'YES' | 'NO' | 'UNKNOWN';
  originalSignatureRequired: 'YES' | 'NO' | 'UNKNOWN';
  notes?: string;
}

export const BANK_REGISTRY: Record<string, BankTemplate> = {
  mercantile: {
    bankId: 'mercantile',
    bankName: 'מרכנתיל (מירלה)',
    templateStatus: 'PARTIAL',
    requiredBankSpecificDocuments: [
      { id: 'bank_kyc_mercantile', name: 'טופס הכרת הלקוח נספח א (מרכנתיל)', description: 'טופס בנק ייעודי להבהרת מקורות הון' },
      { id: 'bank_fatca_crs', name: 'טופס אישור תושבות לצרכי מס (FATCA / CRS)' }
    ],
    physicalPresenceRequired: 'UNKNOWN',
    originalSignatureRequired: 'YES',
    notes: 'פתיחה מהירה כחלק מהסדר מייצגים. נדרשת שקיפות מלאה לגבי פעילות ישראלית מול פעילות בחו"ל.'
  },
  poalim: {
    bankId: 'poalim',
    bankName: 'בנק הפועלים',
    templateStatus: 'NOT_LOADED',
    requiredBankSpecificDocuments: [],
    physicalPresenceRequired: 'UNKNOWN',
    originalSignatureRequired: 'UNKNOWN',
    notes: 'פתיחת חשבון עסקי דורשת שלבים דיגיטליים ו/או פגישה בסניף בהתאם לסווג וגודל העסק.'
  },
  leumi: {
    bankId: 'leumi',
    bankName: 'בנק לאומי',
    templateStatus: 'NOT_LOADED',
    requiredBankSpecificDocuments: [],
    physicalPresenceRequired: 'UNKNOWN',
    originalSignatureRequired: 'UNKNOWN',
  },
  discount: {
    bankId: 'discount',
    bankName: 'דיסקונט',
    templateStatus: 'NOT_LOADED',
    requiredBankSpecificDocuments: [],
    physicalPresenceRequired: 'UNKNOWN',
    originalSignatureRequired: 'UNKNOWN',
  }
};
