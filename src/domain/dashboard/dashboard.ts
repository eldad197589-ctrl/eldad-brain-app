/* ============================================
   FILE: dashboard.ts
   PURPOSE: הגדרת מבנה הנתונים שה-Dashboard צורך - שכבת קריאה בלבד
   DEPENDENCIES: bills.ts, cashflow.ts
   EXPORTS: DashboardView, buildDashboardView
   ============================================ */
// #region Interfaces

import { Bill } from '../bills/bills';
import { Receipt } from '../receipts/receipts';
import { PaymentPlan } from '../cashflow/cashflow';

/**
 * מבנה תצוגה שה-Dashboard מציג - אין בו לוגיקה, רק צריכת נתונים
 */
export interface DashboardView {
  urgent: Bill[];           // תשלומים דחופים (overdue + due)
  upcoming: Bill[];         // תשלומים עתידיים (upcoming)
  recentlyPaid: Bill[];     // שולם לאחרונה (paid)
  anomalies: Bill[];        // חריגות הדורשות בדיקה (review + duplicate)
  plan: PaymentPlan;        // תוכנית התשלום מ-Cashflow
  recentReceipts: Receipt[];// קבלות אחרונות שנקלטו
}

// #endregion

// #region Dashboard Builder

/**
 * בונה את תצוגת ה-Dashboard מתוך נתוני המנועים.
 * אין כאן שום לוגיקה - רק סינון ומיון של מידע שכבר עובד.
 */
export function buildDashboardView(
  allBills: Bill[],
  allReceipts: Receipt[],
  plan: PaymentPlan
): DashboardView {
  return {
    urgent: allBills.filter(b => b.status === 'overdue' || b.status === 'due'),
    upcoming: allBills.filter(b => b.status === 'upcoming'),
    recentlyPaid: allBills
      .filter(b => b.status === 'paid')
      .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))
      .slice(0, 10),
    anomalies: allBills.filter(b => b.status === 'review' || b.status === 'duplicate'),
    plan,
    recentReceipts: allReceipts
      .sort((a, b) => b.receivedDate.localeCompare(a.receivedDate))
      .slice(0, 10)
  };
}

// #endregion
