/* ============================================
   FILE: receipts.ts
   PURPOSE: מנוע קבלות - תיוק מסמכים סגורים, חיבור לחשבונות
   DEPENDENCIES: bills.ts
   EXPORTS: Receipt, processReceipt
   ============================================ */
// #region Interfaces

/**
 * מבנה נתונים של קבלה
 */
export interface Receipt {
  id: string;
  provider: string;
  amount: number;
  receivedDate: string;        // תאריך קבלת הקבלה (ISO)
  confirmationNumber: string;
  linkedBillId: string | null;  // מצביע לחשבון שנסגר, null אם לא אותר
  filingTarget: 'personal' | 'business';
  filingPath: string;           // נתיב תיוק ב-Gmail/Drive
  sourceEmailId?: string;
  notes: string[];
}

// #endregion

// #region Receipt Processing

/**
 * עיבוד קבלה נכנסת: מחפש חשבון פתוח לסגירה, מסווג תיוק.
 * הקבלה לעולם לא יוצרת חשבון חדש - רק סוגרת קיים.
 */
export function processReceipt(
  id: string,
  provider: string,
  amount: number,
  confirmationNumber: string,
  entity: 'household' | 'business',
  sourceEmailId?: string
): Receipt {
  const notes: string[] = [];

  // קביעת יעד תיוק
  let filingTarget: 'personal' | 'business';
  let filingPath: string;

  if (entity === 'business') {
    filingTarget = 'business';
    filingPath = `הוצאות עסק/${new Date().getFullYear()}/קבלות`;
    notes.push('מסווג כהוצאה עסקית מוכרת. יועבר להנהלת חשבונות.');
  } else {
    filingTarget = 'personal';
    if (amount >= 1000) {
      filingPath = `הוצאות בית/${new Date().getFullYear()}/הוצאות מהותיות`;
      notes.push('הוצאה מעל 1,000 ש"ח - מתויקת כמהותית בתיקייה נפרדת.');
    } else {
      filingPath = `הוצאות בית/${new Date().getFullYear()}/שוטף`;
      notes.push('הוצאה שוטפת מתחת ל-1,000 ש"ח - תיוק כללי.');
    }
  }

  return {
    id,
    provider,
    amount,
    receivedDate: new Date().toISOString().split('T')[0],
    confirmationNumber,
    linkedBillId: null, // יתמלא ע"י הקוד הקורא לאחר חיפוש חשבון מתאים
    filingTarget,
    filingPath,
    sourceEmailId,
    notes
  };
}

// #endregion
