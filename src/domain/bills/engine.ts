/* ============================================
   FILE: bills/engine.ts
   PURPOSE: מנוע תשלומים — סיווג סטטוס, זיהוי כפילויות, חיבור קבלות
   DEPENDENCIES: ../types
   EXPORTS: classifyBillStatus, linkReceiptToBill
   ============================================ */
import type { Bill, BillStatus } from '../types';

// #region Status Classification

/**
 * מחשב סטטוס אוטומטי של חשבון
 */
export function classifyBillStatus(
  bill: Omit<Bill, 'status' | 'notes'>,
  existingBills: Bill[],
  today: Date = new Date()
): { status: BillStatus; notes: string[] } {
  const notes: string[] = [];
  const due = new Date(bill.dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isDuplicate = existingBills.some(e =>
    e.id !== bill.id && e.provider === bill.provider && e.amount === bill.amount && e.dueDate === bill.dueDate && e.status !== 'duplicate'
  );
  if (isDuplicate) { notes.push('כפילות: חשבון זהה כבר קיים.'); return { status: 'duplicate', notes }; }

  if (bill.previousAmount && bill.amount > bill.previousAmount * 1.2) {
    const pct = Math.round(((bill.amount - bill.previousAmount) / bill.previousAmount) * 100);
    notes.push(`סכום חריג: עלייה של ${pct}% (₪${bill.previousAmount} → ₪${bill.amount}).`);
    return { status: 'review', notes };
  }

  if (diffDays < 0) { notes.push(`איחור של ${Math.abs(diffDays)} ימים.`); return { status: 'overdue', notes }; }
  if (diffDays <= 3) { notes.push(`${diffDays} ימים לפדיון.`); return { status: 'due', notes }; }

  notes.push(`${diffDays} ימים לפדיון.`);
  return { status: 'upcoming', notes };
}

// #endregion

// #region Receipt Linking

/**
 * קבלה סוגרת חשבון פתוח. לא יוצרת חשבון חדש.
 */
export function linkReceiptToBill(
  receiptId: string,
  provider: string,
  amount: number,
  confirmationNumber: string,
  bills: Bill[]
): Bill | null {
  const match = bills.find(b =>
    b.status !== 'paid' && b.status !== 'duplicate' &&
    b.provider === provider && Math.abs(b.amount - amount) / b.amount < 0.05
  );
  if (!match) return null;

  match.status = 'paid';
  match.linkedReceiptId = receiptId;
  match.confirmationNumber = confirmationNumber;
  match.paidDate = new Date().toISOString().split('T')[0];
  match.notes.push(`נסגר אוטומטית ע"י קבלה ${receiptId}.`);
  return match;
}

// #endregion
