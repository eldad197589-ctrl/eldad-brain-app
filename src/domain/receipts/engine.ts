/* ============================================
   FILE: receipts/engine.ts
   PURPOSE: מנוע קבלות — תיוק, חוק מהותיות, חיבור לחשבון
   DEPENDENCIES: ../types
   EXPORTS: processReceipt
   ============================================ */
import type { Receipt } from '../types';

// #region Receipt Processing

/**
 * יוצר קבלה חדשה עם נתיב תיוק. לא יוצרת חשבון חדש.
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
  let filingTarget: 'personal' | 'business';
  let filingPath: string;

  if (entity === 'business') {
    filingTarget = 'business';
    filingPath = `הוצאות עסק/${new Date().getFullYear()}/קבלות`;
    notes.push('הוצאה עסקית מוכרת — יועבר להנה"ח.');
  } else {
    filingTarget = 'personal';
    if (amount >= 1000) {
      filingPath = `הוצאות בית/${new Date().getFullYear()}/מהותיות`;
      notes.push('מעל 1,000 ש"ח — תיוק מהותי.');
    } else {
      filingPath = `הוצאות בית/${new Date().getFullYear()}/שוטף`;
      notes.push('מתחת ל-1,000 ש"ח — תיוק שוטף.');
    }
  }

  return {
    id, provider, amount,
    receivedDate: new Date().toISOString().split('T')[0],
    confirmationNumber,
    linkedBillId: null,
    filingTarget, filingPath, sourceEmailId, notes
  };
}

// #endregion
